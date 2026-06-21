const UNIT_SIZE_MAP = [
  // Produce
  { keywords: ["apple"],           sellQty: 3,    sellUnit: "lb bag" },
  { keywords: ["banana"],          sellQty: 1,    sellUnit: "bunch" },
  { keywords: ["avocado"],         sellQty: 1,    sellUnit: "each" },
  { keywords: ["tomato"],          sellQty: 1,    sellUnit: "lb" },
  { keywords: ["onion"],           sellQty: 3,    sellUnit: "lb bag" },
  { keywords: ["garlic"],          sellQty: 1,    sellUnit: "head" },
  { keywords: ["lemon"],           sellQty: 1,    sellUnit: "each" },
  { keywords: ["lime"],            sellQty: 1,    sellUnit: "each" },
  { keywords: ["spinach"],         sellQty: 5,    sellUnit: "oz bag" },
  { keywords: ["kale"],            sellQty: 1,    sellUnit: "bunch" },
  { keywords: ["lettuce"],         sellQty: 1,    sellUnit: "head" },
  { keywords: ["carrot"],          sellQty: 1,    sellUnit: "lb bag" },
  { keywords: ["celery"],          sellQty: 1,    sellUnit: "bunch" },
  { keywords: ["broccoli"],        sellQty: 1,    sellUnit: "head" },
  { keywords: ["cauliflower"],     sellQty: 1,    sellUnit: "head" },
  { keywords: ["bell pepper", "pepper"], sellQty: 1, sellUnit: "each" },
  { keywords: ["mushroom"],        sellQty: 8,    sellUnit: "oz pack" },
  { keywords: ["potato"],          sellQty: 5,    sellUnit: "lb bag" },
  { keywords: ["sweet potato"],    sellQty: 1,    sellUnit: "lb" },
  { keywords: ["zucchini"],        sellQty: 1,    sellUnit: "each" },
  { keywords: ["cucumber"],        sellQty: 1,    sellUnit: "each" },
  { keywords: ["corn"],            sellQty: 1,    sellUnit: "ear" },
  // Meat & Seafood
  { keywords: ["chicken breast"],  sellQty: 2,    sellUnit: "lb pack" },
  { keywords: ["chicken thigh"],   sellQty: 2,    sellUnit: "lb pack" },
  { keywords: ["chicken"],         sellQty: 2,    sellUnit: "lb pack" },
  { keywords: ["ground beef"],     sellQty: 1,    sellUnit: "lb" },
  { keywords: ["beef"],            sellQty: 1,    sellUnit: "lb" },
  { keywords: ["pork chop"],       sellQty: 1,    sellUnit: "lb pack" },
  { keywords: ["pork"],            sellQty: 1,    sellUnit: "lb" },
  { keywords: ["salmon"],          sellQty: 1,    sellUnit: "fillet" },
  { keywords: ["tuna"],            sellQty: 5,    sellUnit: "oz can" },
  { keywords: ["shrimp"],          sellQty: 12,   sellUnit: "oz bag" },
  { keywords: ["bacon"],           sellQty: 12,   sellUnit: "oz pack" },
  { keywords: ["sausage"],         sellQty: 1,    sellUnit: "lb pack" },
  // Dairy & Eggs
  { keywords: ["egg"],             sellQty: 12,   sellUnit: "ct carton" },
  { keywords: ["milk"],            sellQty: 1,    sellUnit: "gallon" },
  { keywords: ["butter"],          sellQty: 1,    sellUnit: "lb (4 sticks)" },
  { keywords: ["cheddar", "mozzarella", "cheese"], sellQty: 8, sellUnit: "oz block" },
  { keywords: ["cream cheese"],    sellQty: 8,    sellUnit: "oz brick" },
  { keywords: ["greek yogurt", "yogurt"], sellQty: 32, sellUnit: "oz tub" },
  { keywords: ["sour cream"],      sellQty: 16,   sellUnit: "oz tub" },
  { keywords: ["heavy cream"],     sellQty: 1,    sellUnit: "pint" },
  // Grains & Pantry
  { keywords: ["rice"],            sellQty: 5,    sellUnit: "lb bag" },
  { keywords: ["pasta", "penne", "spaghetti", "rigatoni"], sellQty: 16, sellUnit: "oz box" },
  { keywords: ["flour"],           sellQty: 5,    sellUnit: "lb bag" },
  { keywords: ["bread"],           sellQty: 1,    sellUnit: "loaf" },
  { keywords: ["tortilla"],        sellQty: 1,    sellUnit: "pack (10 ct)" },
  { keywords: ["oat", "oatmeal"],  sellQty: 18,   sellUnit: "oz canister" },
  { keywords: ["olive oil"],       sellQty: 16.9, sellUnit: "oz bottle" },
  { keywords: ["vegetable oil", "canola oil"], sellQty: 48, sellUnit: "oz bottle" },
  { keywords: ["soy sauce"],       sellQty: 10,   sellUnit: "oz bottle" },
  { keywords: ["chicken broth", "broth", "stock"], sellQty: 32, sellUnit: "oz carton" },
  { keywords: ["tomato sauce", "marinara"], sellQty: 24, sellUnit: "oz jar" },
  { keywords: ["diced tomato"],    sellQty: 14.5, sellUnit: "oz can" },
  { keywords: ["black bean", "kidney bean", "bean"], sellQty: 15, sellUnit: "oz can" },
  { keywords: ["chickpea"],        sellQty: 15,   sellUnit: "oz can" },
  { keywords: ["lentil"],          sellQty: 1,    sellUnit: "lb bag" },
  { keywords: ["quinoa"],          sellQty: 16,   sellUnit: "oz bag" },
  { keywords: ["honey"],           sellQty: 12,   sellUnit: "oz bottle" },
  { keywords: ["maple syrup"],     sellQty: 12,   sellUnit: "oz bottle" },
  { keywords: ["sugar"],           sellQty: 4,    sellUnit: "lb bag" },
  { keywords: ["salt"],            sellQty: 26,   sellUnit: "oz canister" },
  { keywords: ["coconut milk"],    sellQty: 13.5, sellUnit: "oz can" },
];

export function getUnitSize(ingredientName) {
  if (!ingredientName) return null;
  const lower = ingredientName.toLowerCase();
  for (const entry of UNIT_SIZE_MAP) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        return { sellQty: entry.sellQty, sellUnit: entry.sellUnit };
      }
    }
  }
  return null;
}
