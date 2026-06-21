import { extractEquipmentIds } from "./kitchenEquipment";
import { krogerLookupUPC } from "./kroger";

const KEY = import.meta.env.VITE_SPOONACULAR_KEY;
const BASE = "https://api.spoonacular.com";

export async function searchRecipes({
  query = "", diet = "", cuisine = "", intolerances = "",
  includeIngredients = "", maxReadyTime, maxCalories, minServings, maxServings, number = 24,
} = {}) {
  const params = new URLSearchParams({
    apiKey: KEY,
    number,
    addRecipeInformation: true,
    addRecipeNutrition: true,
    ...(query              && { query }),
    ...(diet               && { diet }),
    ...(cuisine            && { cuisine }),
    ...(intolerances       && { intolerances }),
    ...(includeIngredients && { includeIngredients }),
    ...(maxReadyTime       && { maxReadyTime }),
    ...(maxCalories        && { maxCalories }),
    ...(minServings > 1    && { minServings }),
    ...(maxServings < 12   && { maxServings }),
  });

  const res = await fetch(`${BASE}/recipes/complexSearch?${params}`);
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);
  const data = await res.json();

  return data.results.map(r => {
    const nutrients = r.nutrition?.nutrients ?? [];
    const getNutrient = name => nutrients.find(n => n.name === name)?.amount ?? null;
    return {
      id:              r.id,
      name:            r.title,
      image:           r.image,
      time:            r.readyInMinutes ? `${r.readyInMinutes} min` : "—",
      servings:        r.servings ?? "—",
      tags:            buildTags(r),
      pricePerServing: r.pricePerServing ?? null, // cents
      calories:        getNutrient("Calories"),
      carbs:           getNutrient("Carbohydrates"),
      protein:         getNutrient("Protein"),
      requiredEquipment: extractEquipmentIds(r.analyzedInstructions ?? []),
    };
  });
}

export async function lookupUPC(upc) {
  // Try Spoonacular first
  const params = new URLSearchParams({ apiKey: KEY });
  const res = await fetch(`${BASE}/food/products/upc/${upc}?${params}`);
  if (res.ok) {
    const d = await res.json();
    return {
      name:   d.title,
      image:  d.images?.[0] ?? null,
      amount: d.servings?.size ?? 1,
      unit:   d.servings?.unit ?? "",
    };
  }

  // Fall back to Kroger API
  if (import.meta.env.VITE_KROGER_CLIENT_ID) {
    const kroger = await krogerLookupUPC(upc);
    if (kroger) return kroger;
  }

  throw new Error("Product not found");
}

export async function extractRecipeFromUrl(url) {
  const params = new URLSearchParams({ apiKey: KEY, url, addRecipeInformation: true, addRecipeNutrition: true });
  const res = await fetch(`${BASE}/recipes/extract?${params}`);
  if (res.status === 404) throw new Error("No recipe found at that URL. Try a different link.");
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);
  const r = await res.json();
  const nutrients = r.nutrition?.nutrients ?? [];
  const getNutrient = name => nutrients.find(n => n.name === name)?.amount ?? null;
  return {
    id:              `custom-${Date.now()}`,
    name:            r.title,
    image:           r.image ?? null,
    time:            r.readyInMinutes ? `${r.readyInMinutes} min` : "—",
    servings:        r.servings ?? "—",
    sourceUrl:       r.sourceUrl ?? url,
    summary:         r.summary ? r.summary.replace(/<[^>]+>/g, "") : "",
    instructions:    (r.analyzedInstructions?.[0]?.steps ?? []).map(s => s.step),
    ingredients:     (r.extendedIngredients ?? []).map(i => ({
      name: i.name, amount: i.amount, unit: i.unit, original: i.original,
    })),
    tags:            buildTags(r),
    pricePerServing: r.pricePerServing ?? null,
    calories:        getNutrient("Calories"),
    carbs:           getNutrient("Carbohydrates"),
    protein:         getNutrient("Protein"),
    isCustom:        true,
  };
}

export async function getIngredientSubstitutes(name) {
  const params = new URLSearchParams({ apiKey: KEY, ingredientName: name });
  const res = await fetch(`${BASE}/food/ingredients/substitutes?${params}`);
  if (!res.ok) return [];
  const d = await res.json();
  return d.substitutes ?? [];
}

export async function getRecipeDetails(id) {
  const params = new URLSearchParams({ apiKey: KEY, includeNutrition: false });
  const res = await fetch(`${BASE}/recipes/${id}/information?${params}`);
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);
  const r = await res.json();
  return {
    id:           r.id,
    name:         r.title,
    image:        r.image ?? null,
    time:         r.readyInMinutes ? `${r.readyInMinutes} min` : "—",
    servings:     r.servings ?? "—",
    sourceUrl:    r.sourceUrl ?? null,
    summary:      r.summary ? r.summary.replace(/<[^>]+>/g, "") : "",
    instructions: (r.analyzedInstructions?.[0]?.steps ?? []).map(s => ({
      number: s.number,
      step:   s.step,
      ingredients: (s.ingredients ?? []).map(i => i.name),
      equipment:   (s.equipment   ?? []).map(e => e.name),
    })),
    ingredients: (r.extendedIngredients ?? []).map(i => ({
      name: i.name, amount: i.amount, unit: i.unit, original: i.original,
    })),
  };
}

// Words that describe preparation, state, or grade — stripped before merging
const PREP_WORDS = new Set([
  'deseeded', 'seeded', 'seedless', 'chopped', 'diced', 'sliced', 'minced',
  'grated', 'shredded', 'peeled', 'crushed', 'ground', 'fresh', 'dried',
  'frozen', 'cooked', 'raw', 'boneless', 'skinless', 'halved', 'quartered',
  'trimmed', 'rinsed', 'drained', 'canned', 'large', 'medium', 'small',
  'whole', 'lean', 'finely', 'roughly', 'thinly', 'lightly', 'packed',
  'heaped', 'heaping', 'de', 'plus', 'extra', 'and', 'or',
  // grade / fat / processing descriptors
  'virgin', 'unsalted', 'salted', 'reduced', 'low', 'nonfat', 'fat',
  'plain', 'sweetened', 'unsweetened', 'sodium', 'purpose', 'all',
  'organic', 'natural', 'lite', 'light',
  // part / cut descriptors that Spoonacular appends
  'clove', 'breast', 'thigh', 'fillet', 'loin', 'chop', 'steak',
  'rib', 'wing', 'leg', 'belly', 'chunk', 'strip', 'cube', 'floret',
  'stalk', 'sprig', 'leaf', 'leave', 'slice',
]);

function singularize(word) {
  if (word.length <= 3) return word;
  if (word.endsWith('oes'))                          return word.slice(0, -2); // tomatoes→tomato
  if (word.endsWith('ies') && word.length > 4)       return word.slice(0, -3) + 'y'; // berries→berry
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 5) return word.slice(0, -1); // peppers→pepper
  return word;
}

function normalizeIngredientName(name) {
  return name
    .toLowerCase()
    .replace(/[,().%]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0 && !PREP_WORDS.has(w))
    .map(singularize)
    .join(' ')
    .trim();
}

export async function getRecipeIngredients(ids) {
  if (!ids.length) return [];
  const params = new URLSearchParams({ apiKey: KEY, includeNutrition: false });
  const res = await fetch(`${BASE}/recipes/informationBulk?ids=${ids.join(",")}&${params}`);
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);
  const recipes = await res.json();

  // Flatten all ingredients, merging near-duplicates by normalized name
  const map = new Map();
  for (const r of recipes) {
    for (const ing of r.extendedIngredients ?? []) {
      const key = normalizeIngredientName(ing.nameClean ?? ing.name);
      if (map.has(key)) {
        const existing = map.get(key);
        // Only sum amounts when units match; otherwise keep the larger quantity
        const sameUnit = !ing.unit || !existing.unit ||
          ing.unit.toLowerCase() === existing.unit.toLowerCase();
        existing.amount = sameUnit
          ? existing.amount + ing.amount
          : Math.max(existing.amount, ing.amount);
        // Prefer the shorter/cleaner display name
        if ((ing.nameClean ?? ing.name).length < existing.name.length) {
          existing.name = ing.nameClean ?? ing.name;
        }
      } else {
        map.set(key, {
          name:   ing.nameClean ?? ing.name,
          amount: ing.amount,
          unit:   ing.unit,
        });
      }
    }
  }
  // Second pass: merge entries where one normalized key's words are a subset
  // of another's (e.g. "garlic" absorbs "garlic powder" only if it's already
  // a distinct key — avoids collapsing truly different ingredients).
  const keys = [...map.keys()];
  for (const shortKey of keys) {
    if (!map.has(shortKey)) continue;
    const shortWords = new Set(shortKey.split(' '));
    for (const longKey of keys) {
      if (longKey === shortKey || !map.has(longKey)) continue;
      const longWords = longKey.split(' ');
      // Only merge if every word of the shorter key appears in the longer key
      // AND the longer key has at most 2 extra words (avoids over-merging)
      const extras = longWords.filter(w => !shortWords.has(w));
      if (extras.length > 0 && extras.length <= 2 &&
          longWords.every(w => shortWords.has(w) || extras.includes(w)) &&
          shortWords.size > 0 && [...shortWords].every(w => longWords.includes(w))) {
        const existing = map.get(shortKey);
        const absorb   = map.get(longKey);
        existing.amount = (existing.amount ?? 0) + (absorb.amount ?? 0);
        if ((absorb.name ?? '').length < (existing.name ?? '').length) {
          existing.name = absorb.name;
        }
        map.delete(longKey);
      }
    }
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// Returns Map<recipeId, string[]> of ingredient names per recipe
export async function getIngredientsByRecipe(ids) {
  if (!ids.length) return new Map();
  const params = new URLSearchParams({ apiKey: KEY, includeNutrition: false });
  const res = await fetch(`${BASE}/recipes/informationBulk?ids=${ids.join(",")}&${params}`);
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);
  const recipes = await res.json();

  const map = new Map();
  for (const r of recipes) {
    map.set(r.id, (r.extendedIngredients ?? []).map(i => i.name.toLowerCase()));
  }
  return map;
}

function buildTags(r) {
  const tags = [];
  if (r.glutenFree)  tags.push("gf");
  if (r.dairyFree)   tags.push("df");
  if (r.vegan)       tags.push("v");
  if (r.veryHealthy) tags.push("lc");
  return tags;
}
