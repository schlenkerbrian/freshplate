export const EQUIPMENT_GROUPS = [
  {
    group: "Stovetop",
    items: [
      { id: "skillet",      name: "Skillet / Frying Pan",   icon: "🍳" },
      { id: "saucepan",     name: "Saucepan",               icon: "🫕" },
      { id: "stockpot",     name: "Large Pot / Stockpot",   icon: "🫕" },
      { id: "wok",          name: "Wok",                    icon: "🥘" },
      { id: "dutch_oven",   name: "Dutch Oven",             icon: "🫕" },
      { id: "cast_iron",    name: "Cast Iron Pan",          icon: "🍳" },
      { id: "grill_pan",    name: "Grill Pan",              icon: "🥩" },
      { id: "double_boiler",name: "Double Boiler",          icon: "🫕" },
      { id: "steamer",      name: "Steamer Basket",         icon: "♨️"  },
    ],
  },
  {
    group: "Oven & Baking",
    items: [
      { id: "oven",         name: "Oven",                   icon: "🔥" },
      { id: "baking_sheet", name: "Baking Sheet",           icon: "🍪" },
      { id: "roasting_pan", name: "Roasting Pan",           icon: "🍗" },
      { id: "baking_dish",  name: "Baking Dish / Casserole",icon: "🥘" },
      { id: "cake_pan",     name: "Cake Pan",               icon: "🎂" },
      { id: "muffin_tin",   name: "Muffin Tin",             icon: "🧁" },
      { id: "loaf_pan",     name: "Loaf Pan",               icon: "🍞" },
      { id: "springform",   name: "Springform Pan",         icon: "🎂" },
      { id: "pie_dish",     name: "Pie Dish",               icon: "🥧" },
    ],
  },
  {
    group: "Small Appliances",
    items: [
      { id: "blender",      name: "Blender",                icon: "🥤" },
      { id: "food_proc",    name: "Food Processor",         icon: "⚙️"  },
      { id: "stand_mixer",  name: "Stand Mixer",            icon: "🍰" },
      { id: "hand_mixer",   name: "Hand Mixer",             icon: "🍰" },
      { id: "instant_pot",  name: "Instant Pot / Pressure Cooker", icon: "⚡" },
      { id: "slow_cooker",  name: "Slow Cooker / Crock Pot",icon: "🍲" },
      { id: "air_fryer",    name: "Air Fryer",              icon: "🌀" },
      { id: "rice_cooker",  name: "Rice Cooker",            icon: "🍚" },
      { id: "microwave",    name: "Microwave",              icon: "📡" },
      { id: "toaster_oven", name: "Toaster Oven",           icon: "🔲" },
    ],
  },
  {
    group: "Outdoor & Specialty",
    items: [
      { id: "grill",        name: "Outdoor Grill / BBQ",    icon: "🔥" },
      { id: "smoker",       name: "Smoker",                 icon: "💨" },
      { id: "deep_fryer",   name: "Deep Fryer",             icon: "🍟" },
      { id: "ice_cream",    name: "Ice Cream Maker",        icon: "🍦" },
      { id: "waffle_iron",  name: "Waffle Iron",            icon: "🧇" },
      { id: "pasta_maker",  name: "Pasta Maker",            icon: "🍝" },
    ],
  },
];

export const ALL_EQUIPMENT = EQUIPMENT_GROUPS.flatMap(g => g.items);

/**
 * Maps Spoonacular equipment name strings (lowercased) to equipment IDs above.
 * Spoonacular returns names like "oven", "baking sheet", "skillet", etc.
 * Multiple Spoonacular names can map to the same ID.
 */
export const SPOONACULAR_EQUIPMENT_MAP = {
  // Stovetop
  "frying pan":            "skillet",
  "skillet":               "skillet",
  "pan":                   "skillet",
  "non stick pan":         "skillet",
  "sauté pan":             "skillet",
  "saute pan":             "skillet",
  "saucepan":              "saucepan",
  "sauce pan":             "saucepan",
  "pot":                   "saucepan",
  "small pot":             "saucepan",
  "medium pot":            "stockpot",
  "large pot":             "stockpot",
  "stockpot":              "stockpot",
  "stock pot":             "stockpot",
  "soup pot":              "stockpot",
  "dutch oven":            "dutch_oven",
  "cast iron pan":         "cast_iron",
  "cast iron skillet":     "cast_iron",
  "wok":                   "wok",
  "grill pan":             "grill_pan",
  "grill grate":           "grill_pan",
  "double boiler":         "double_boiler",
  "steamer":               "steamer",
  "steamer basket":        "steamer",
  "bamboo steamer":        "steamer",
  // Oven & Baking
  "oven":                  "oven",
  "broiler":               "oven",
  "toaster":               "oven",
  "baking sheet":          "baking_sheet",
  "baking pan":            "baking_sheet",
  "cookie sheet":          "baking_sheet",
  "sheet pan":             "baking_sheet",
  "jelly roll pan":        "baking_sheet",
  "roasting pan":          "roasting_pan",
  "baking dish":           "baking_dish",
  "casserole dish":        "baking_dish",
  "cake pan":              "cake_pan",
  "round cake pan":        "cake_pan",
  "bundt pan":             "cake_pan",
  "tube pan":              "cake_pan",
  "muffin tin":            "muffin_tin",
  "cupcake tin":           "muffin_tin",
  "loaf pan":              "loaf_pan",
  "bread pan":             "loaf_pan",
  "springform pan":        "springform",
  "pie dish":              "pie_dish",
  "pie plate":             "pie_dish",
  "tart pan":              "pie_dish",
  // Small appliances
  "blender":               "blender",
  "immersion blender":     "blender",
  "food processor":        "food_proc",
  "stand mixer":           "stand_mixer",
  "hand mixer":            "hand_mixer",
  "electric mixer":        "hand_mixer",
  "mixer":                 "stand_mixer",
  "pressure cooker":       "instant_pot",
  "instant pot":           "instant_pot",
  "slow cooker":           "slow_cooker",
  "crock pot":             "slow_cooker",
  "crockpot":              "slow_cooker",
  "air fryer":             "air_fryer",
  "rice cooker":           "rice_cooker",
  "microwave":             "microwave",
  "toaster oven":          "toaster_oven",
  // Outdoor & Specialty
  "grill":                 "grill",
  "bbq":                   "grill",
  "outdoor grill":         "grill",
  "charcoal grill":        "grill",
  "gas grill":             "grill",
  "smoker":                "smoker",
  "deep fryer":            "deep_fryer",
  "ice cream machine":     "ice_cream",
  "ice cream maker":       "ice_cream",
  "waffle iron":           "waffle_iron",
  "waffle maker":          "waffle_iron",
  "pasta machine":         "pasta_maker",
  "pasta maker":           "pasta_maker",
};

/** Convert a Spoonacular equipment name to our equipment ID (or null if unmapped). */
export function normalizeEquipment(spoonacularName) {
  return SPOONACULAR_EQUIPMENT_MAP[spoonacularName.toLowerCase()] ?? null;
}

/** Extract unique equipment IDs from a Spoonacular analyzedInstructions array. */
export function extractEquipmentIds(analyzedInstructions = []) {
  const ids = new Set();
  for (const section of analyzedInstructions) {
    for (const step of section.steps ?? []) {
      for (const eq of step.equipment ?? []) {
        const id = normalizeEquipment(eq.name ?? "");
        if (id) ids.add(id);
      }
    }
  }
  return [...ids];
}
