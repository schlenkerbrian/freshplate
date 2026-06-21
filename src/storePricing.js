/**
 * Store price-tier system.
 * Each store has a base multiplier + category specialties
 * so items don't all land at the same cheapest store.
 */

// Price multiplier relative to national average (1.0)
export const STORE_MULTIPLIERS = {
  aldi:        0.68,
  lidl:        0.70,
  walmart:     0.78,
  samsclub:    0.74,
  costco:      0.76,
  target:      0.92,
  kroger:      0.86,
  safeway:     0.94,
  publix:      0.97,
  heb:         0.83,
  meijer:      0.85,
  wegmans:     0.93,
  stopshop:    0.94,
  giant:       0.91,
  foodlion:    0.87,
  winndixie:   0.89,
  ralphsvons:  0.93,
  harristet:   0.98,
  sprouts:     1.05,
  freshmarket: 1.12,
  shoprite:    0.90,
  acme:        0.94,
  albertsons:  0.93,
  traderjoes:  0.91,
  wholefood:   1.28,
  amazonfresh: 0.96,
};

// Categories where a store beats its own multiplier (additional discount)
const STORE_SPECIALTIES = {
  wholefood:   { organic: 0.82, produce: 0.88 },
  traderjoes:  { specialty: 0.78, dairy: 0.85, frozen: 0.82 },
  costco:      { protein: 0.65, dairy: 0.70, grains: 0.68 },
  samsclub:    { protein: 0.68, dairy: 0.72, grains: 0.70 },
  aldi:        { pantry: 0.78, grains: 0.75, dairy: 0.78 },
  lidl:        { pantry: 0.78, produce: 0.80, dairy: 0.78 },
  heb:         { produce: 0.80, protein: 0.82 },
  sprouts:     { organic: 0.88, produce: 0.85 },
  walmart:     { pantry: 0.80, grains: 0.78 },
  kroger:      { produce: 0.84, pantry: 0.84 },
};

// Ingredient → { category, basePrice (USD per typical unit) }
const INGREDIENT_DATA = {
  // Produce
  onion:         { cat: "produce",   base: 0.89  },
  garlic:        { cat: "produce",   base: 0.59  },
  tomato:        { cat: "produce",   base: 1.29  },
  lemon:         { cat: "produce",   base: 0.69  },
  lime:          { cat: "produce",   base: 0.49  },
  spinach:       { cat: "organic",   base: 2.99  },
  kale:          { cat: "organic",   base: 2.49  },
  lettuce:       { cat: "produce",   base: 1.49  },
  avocado:       { cat: "produce",   base: 1.29  },
  carrot:        { cat: "produce",   base: 0.99  },
  celery:        { cat: "produce",   base: 1.49  },
  potato:        { cat: "produce",   base: 1.19  },
  broccoli:      { cat: "produce",   base: 1.79  },
  cauliflower:   { cat: "produce",   base: 2.29  },
  pepper:        { cat: "produce",   base: 1.29  },
  mushroom:      { cat: "produce",   base: 2.49  },
  zucchini:      { cat: "produce",   base: 1.29  },
  cucumber:      { cat: "produce",   base: 0.89  },
  corn:          { cat: "produce",   base: 0.79  },
  // Protein
  chicken:       { cat: "protein",   base: 4.99  },
  beef:          { cat: "protein",   base: 6.99  },
  pork:          { cat: "protein",   base: 4.49  },
  salmon:        { cat: "protein",   base: 9.99  },
  tuna:          { cat: "protein",   base: 2.49  },
  shrimp:        { cat: "protein",   base: 7.99  },
  bacon:         { cat: "protein",   base: 5.99  },
  sausage:       { cat: "protein",   base: 4.99  },
  eggs:          { cat: "protein",   base: 3.49  },
  tofu:          { cat: "specialty", base: 2.99  },
  // Dairy
  milk:          { cat: "dairy",     base: 3.49  },
  butter:        { cat: "dairy",     base: 4.99  },
  cheese:        { cat: "dairy",     base: 4.49  },
  "cream cheese":{ cat: "dairy",     base: 2.99  },
  yogurt:        { cat: "dairy",     base: 1.49  },
  "sour cream":  { cat: "dairy",     base: 2.29  },
  "heavy cream": { cat: "dairy",     base: 2.99  },
  // Grains & Pantry
  rice:          { cat: "grains",    base: 2.49  },
  pasta:         { cat: "grains",    base: 1.79  },
  flour:         { cat: "grains",    base: 3.29  },
  bread:         { cat: "grains",    base: 3.49  },
  tortilla:      { cat: "grains",    base: 2.99  },
  oat:           { cat: "grains",    base: 3.99  },
  quinoa:        { cat: "specialty", base: 5.99  },
  oil:           { cat: "pantry",    base: 6.99  },
  "olive oil":   { cat: "pantry",    base: 7.99  },
  vinegar:       { cat: "pantry",    base: 3.49  },
  salt:          { cat: "pantry",    base: 1.29  },
  sugar:         { cat: "pantry",    base: 2.99  },
  "soy sauce":   { cat: "pantry",    base: 2.99  },
  broth:         { cat: "pantry",    base: 2.49  },
  stock:         { cat: "pantry",    base: 2.49  },
  "tomato sauce":{ cat: "pantry",    base: 1.99  },
  "black beans": { cat: "pantry",    base: 1.29  },
  chickpea:      { cat: "pantry",    base: 1.49  },
  lentil:        { cat: "pantry",    base: 2.49  },
  // Frozen
  "frozen peas": { cat: "frozen",    base: 2.49  },
  "frozen corn": { cat: "frozen",    base: 1.99  },
};

const CATEGORY_BASE_PRICES = {
  produce:   1.50,
  organic:   3.00,
  protein:   5.50,
  dairy:     3.50,
  grains:    2.50,
  pantry:    3.00,
  specialty: 4.00,
  frozen:    2.50,
};

function categorize(name) {
  const lower = name.toLowerCase();
  for (const [key, data] of Object.entries(INGREDIENT_DATA)) {
    if (lower.includes(key)) return data;
  }
  // fallback category guesses
  if (/organic/.test(lower)) return { cat: "organic", base: CATEGORY_BASE_PRICES.organic };
  if (/chicken|beef|pork|salmon|fish|shrimp|turkey|lamb|steak|ground/.test(lower))
    return { cat: "protein", base: CATEGORY_BASE_PRICES.protein };
  if (/milk|cheese|butter|cream|yogurt|dairy/.test(lower))
    return { cat: "dairy", base: CATEGORY_BASE_PRICES.dairy };
  if (/rice|pasta|bread|flour|grain|noodle|tortilla|cracker/.test(lower))
    return { cat: "grains", base: CATEGORY_BASE_PRICES.grains };
  if (/oil|sauce|spice|salt|sugar|vinegar|broth|stock|bean|can/.test(lower))
    return { cat: "pantry", base: CATEGORY_BASE_PRICES.pantry };
  if (/frozen/.test(lower))
    return { cat: "frozen", base: CATEGORY_BASE_PRICES.frozen };
  return { cat: "produce", base: CATEGORY_BASE_PRICES.produce };
}

// Add a small per-item deterministic variation so items spread across stores
function itemVariation(storeId, itemName) {
  let hash = 0;
  for (let i = 0; i < storeId.length + itemName.length; i++) {
    const ch = (storeId + itemName).charCodeAt(i);
    hash = (hash * 31 + ch) & 0xffff;
  }
  return 0.92 + (hash % 16) / 100; // 0.92–1.07
}

export function estimatePrice(ingredientName, storeId) {
  const { cat, base } = categorize(ingredientName);
  const storeMult = STORE_MULTIPLIERS[storeId] ?? 1.0;
  const specialty = STORE_SPECIALTIES[storeId]?.[cat] ?? 1.0;
  const variation = itemVariation(storeId, ingredientName);
  return +(base * storeMult * specialty * variation).toFixed(2);
}

/**
 * For a list of ingredients and a set of preferred store ids,
 * returns an array of { item, bestStore, price, allPrices }
 * sorted to minimize total trips.
 */
export function buildShoppingPlan(ingredients, storeIds) {
  if (!storeIds.length) return [];

  return ingredients.map(item => {
    const prices = {};
    for (const sid of storeIds) {
      prices[sid] = estimatePrice(item.name, sid);
    }
    const bestStore = Object.entries(prices).sort((a, b) => a[1] - b[1])[0][0];
    return { item, bestStore, price: prices[bestStore], allPrices: prices };
  });
}

/** Group plan rows by store, returning Map<storeId, {items, total}> */
export function groupByStore(plan) {
  const map = new Map();
  for (const row of plan) {
    if (!map.has(row.bestStore)) map.set(row.bestStore, { items: [], total: 0 });
    const entry = map.get(row.bestStore);
    entry.items.push(row);
    entry.total = +(entry.total + row.price).toFixed(2);
  }
  return map;
}
