// Shelf life data in days. Each entry covers fridge, freezer, and pantry
// storage where applicable. Source: USDA / FoodKeeper guidelines.
const SHELF_LIFE = [
  // ── Meat & Poultry ──
  { keywords: ["chicken breast", "chicken thigh", "chicken wing", "chicken leg", "ground chicken"], fridge: 2, freezer: 270, pantry: null },
  { keywords: ["ground beef", "ground turkey", "ground pork", "ground lamb", "ground meat"], fridge: 2, freezer: 120, pantry: null },
  { keywords: ["steak", "beef steak", "sirloin", "ribeye", "flank steak", "beef roast"], fridge: 5, freezer: 365, pantry: null },
  { keywords: ["pork chop", "pork loin", "pork roast", "pork tenderloin"], fridge: 5, freezer: 180, pantry: null },
  { keywords: ["bacon"], fridge: 7, freezer: 30, pantry: null },
  { keywords: ["sausage", "hot dog", "bratwurst"], fridge: 7, freezer: 60, pantry: null },
  { keywords: ["deli meat", "lunch meat", "turkey breast", "ham slice", "salami", "pepperoni"], fridge: 5, freezer: 60, pantry: null },
  { keywords: ["whole chicken", "whole turkey"], fridge: 2, freezer: 365, pantry: null },
  { keywords: ["lamb chop", "lamb roast"], fridge: 5, freezer: 270, pantry: null },

  // ── Seafood ──
  { keywords: ["salmon", "tuna steak", "halibut", "cod", "tilapia", "fish fillet", "fish"], fridge: 2, freezer: 180, pantry: null },
  { keywords: ["shrimp", "prawn"], fridge: 2, freezer: 270, pantry: null },
  { keywords: ["canned tuna", "canned salmon", "canned sardine"], fridge: null, freezer: null, pantry: 1825 },
  { keywords: ["scallop", "crab", "lobster", "clam", "mussel", "oyster"], fridge: 2, freezer: 90, pantry: null },

  // ── Dairy & Eggs ──
  { keywords: ["egg", "eggs"], fridge: 35, freezer: null, pantry: null },
  { keywords: ["milk", "whole milk", "skim milk", "2% milk"], fridge: 7, freezer: 90, pantry: null },
  { keywords: ["heavy cream", "whipping cream", "half and half"], fridge: 10, freezer: 90, pantry: null },
  { keywords: ["sour cream", "creme fraiche"], fridge: 21, freezer: null, pantry: null },
  { keywords: ["cream cheese"], fridge: 14, freezer: 60, pantry: null },
  { keywords: ["cottage cheese", "ricotta"], fridge: 7, freezer: 90, pantry: null },
  { keywords: ["cheddar", "mozzarella", "parmesan", "swiss cheese", "gouda", "brie", "cheese"], fridge: 28, freezer: 180, pantry: null },
  { keywords: ["butter"], fridge: 90, freezer: 365, pantry: null },
  { keywords: ["yogurt", "greek yogurt"], fridge: 14, freezer: 60, pantry: null },

  // ── Produce — Vegetables ──
  { keywords: ["broccoli", "cauliflower", "brussels sprout"], fridge: 7, freezer: 365, pantry: null },
  { keywords: ["spinach", "arugula", "mixed greens", "lettuce", "kale", "swiss chard"], fridge: 7, freezer: 365, pantry: null },
  { keywords: ["romaine", "iceberg lettuce"], fridge: 10, freezer: null, pantry: null },
  { keywords: ["carrot"], fridge: 21, freezer: 365, pantry: 14 },
  { keywords: ["celery"], fridge: 14, freezer: 365, pantry: null },
  { keywords: ["cucumber"], fridge: 7, freezer: null, pantry: null },
  { keywords: ["zucchini", "summer squash"], fridge: 7, freezer: 270, pantry: null },
  { keywords: ["bell pepper", "green pepper", "red pepper", "yellow pepper"], fridge: 10, freezer: 270, pantry: null },
  { keywords: ["tomato"], fridge: 7, freezer: 60, pantry: 4 },
  { keywords: ["onion", "yellow onion", "white onion", "red onion"], fridge: null, freezer: null, pantry: 60 },
  { keywords: ["green onion", "scallion", "spring onion"], fridge: 7, freezer: null, pantry: null },
  { keywords: ["garlic", "garlic bulb"], fridge: null, freezer: null, pantry: 180 },
  { keywords: ["ginger", "ginger root"], fridge: 21, freezer: 180, pantry: null },
  { keywords: ["potato", "russet potato", "yukon gold", "red potato"], fridge: null, freezer: null, pantry: 30 },
  { keywords: ["sweet potato", "yam"], fridge: null, freezer: null, pantry: 14 },
  { keywords: ["mushroom"], fridge: 7, freezer: 270, pantry: null },
  { keywords: ["asparagus"], fridge: 5, freezer: 270, pantry: null },
  { keywords: ["green bean", "snap pea", "snow pea"], fridge: 7, freezer: 270, pantry: null },
  { keywords: ["corn", "corn on the cob"], fridge: 3, freezer: 365, pantry: null },
  { keywords: ["pea", "frozen pea"], fridge: 5, freezer: 365, pantry: null },
  { keywords: ["butternut squash", "acorn squash", "spaghetti squash"], fridge: null, freezer: null, pantry: 90 },
  { keywords: ["eggplant", "aubergine"], fridge: 7, freezer: 270, pantry: null },
  { keywords: ["artichoke"], fridge: 7, freezer: 270, pantry: null },
  { keywords: ["cabbage"], fridge: 21, freezer: 270, pantry: null },
  { keywords: ["beet", "beetroot"], fridge: 14, freezer: 270, pantry: null },
  { keywords: ["leek"], fridge: 14, freezer: 270, pantry: null },

  // ── Produce — Fruit ──
  { keywords: ["apple"], fridge: 42, freezer: 270, pantry: 7 },
  { keywords: ["banana"], fridge: null, freezer: 60, pantry: 5 },
  { keywords: ["lemon", "lime"], fridge: 21, freezer: 120, pantry: 7 },
  { keywords: ["orange", "mandarin", "clementine", "tangerine"], fridge: 21, freezer: 120, pantry: 7 },
  { keywords: ["grape", "grapes"], fridge: 7, freezer: 270, pantry: null },
  { keywords: ["strawberry", "blueberry", "raspberry", "blackberry", "berry"], fridge: 5, freezer: 365, pantry: null },
  { keywords: ["avocado"], fridge: 4, freezer: 60, pantry: 2 },
  { keywords: ["mango"], fridge: 7, freezer: 180, pantry: 3 },
  { keywords: ["peach", "nectarine", "plum", "apricot"], fridge: 7, freezer: 270, pantry: 2 },
  { keywords: ["pineapple"], fridge: 4, freezer: 180, pantry: 2 },
  { keywords: ["watermelon", "cantaloupe", "honeydew"], fridge: 4, freezer: 270, pantry: null },
  { keywords: ["pear"], fridge: 5, freezer: 270, pantry: 3 },
  { keywords: ["cherry", "cherries"], fridge: 7, freezer: 365, pantry: null },

  // ── Grains & Bread ──
  { keywords: ["bread", "sourdough", "baguette", "loaf"], fridge: 7, freezer: 90, pantry: 5 },
  { keywords: ["tortilla", "flour tortilla", "corn tortilla"], fridge: 30, freezer: 180, pantry: 7 },
  { keywords: ["rice", "white rice", "brown rice"], fridge: null, freezer: null, pantry: 730 },
  { keywords: ["pasta", "spaghetti", "penne", "fettuccine", "noodle"], fridge: null, freezer: null, pantry: 730 },
  { keywords: ["oat", "oatmeal", "rolled oat"], fridge: null, freezer: null, pantry: 730 },
  { keywords: ["flour", "all-purpose flour", "bread flour"], fridge: null, freezer: 365, pantry: 365 },
  { keywords: ["cereal", "granola"], fridge: null, freezer: null, pantry: 365 },
  { keywords: ["crackers", "cracker"], fridge: null, freezer: null, pantry: 180 },
  { keywords: ["quinoa"], fridge: null, freezer: null, pantry: 730 },
  { keywords: ["couscous"], fridge: null, freezer: null, pantry: 730 },

  // ── Canned & Pantry Staples ──
  { keywords: ["canned bean", "black bean", "kidney bean", "chickpea", "garbanzo", "lentil", "canned lentil"], fridge: null, freezer: null, pantry: 1825 },
  { keywords: ["canned tomato", "tomato paste", "tomato sauce", "crushed tomato", "diced tomato"], fridge: null, freezer: null, pantry: 1825 },
  { keywords: ["chicken broth", "beef broth", "vegetable broth", "stock", "chicken stock", "beef stock"], fridge: 5, freezer: 180, pantry: 1095 },
  { keywords: ["coconut milk", "coconut cream"], fridge: 5, freezer: 90, pantry: 1095 },
  { keywords: ["olive oil", "vegetable oil", "canola oil", "avocado oil", "oil"], fridge: null, freezer: null, pantry: 730 },
  { keywords: ["vinegar", "balsamic vinegar", "apple cider vinegar", "white vinegar", "red wine vinegar"], fridge: null, freezer: null, pantry: 1825 },
  { keywords: ["soy sauce", "tamari", "coconut aminos"], fridge: 1095, freezer: null, pantry: 1095 },
  { keywords: ["hot sauce", "sriracha", "tabasco"], fridge: 1095, freezer: null, pantry: 1825 },
  { keywords: ["ketchup"], fridge: 180, freezer: null, pantry: 365 },
  { keywords: ["mustard", "dijon mustard", "yellow mustard"], fridge: 365, freezer: null, pantry: 730 },
  { keywords: ["mayonnaise", "mayo"], fridge: 60, freezer: null, pantry: 90 },
  { keywords: ["honey"], fridge: null, freezer: null, pantry: 3650 },
  { keywords: ["maple syrup"], fridge: 365, freezer: null, pantry: 365 },
  { keywords: ["sugar", "white sugar", "brown sugar", "powdered sugar"], fridge: null, freezer: null, pantry: 3650 },
  { keywords: ["salt"], fridge: null, freezer: null, pantry: 3650 },
  { keywords: ["black pepper", "pepper"], fridge: null, freezer: null, pantry: 1095 },
  { keywords: ["baking soda", "baking powder"], fridge: null, freezer: null, pantry: 365 },
  { keywords: ["vanilla extract", "vanilla"], fridge: null, freezer: null, pantry: 1825 },
  { keywords: ["cocoa powder", "cacao"], fridge: null, freezer: null, pantry: 730 },
  { keywords: ["chocolate chip", "dark chocolate", "milk chocolate"], fridge: null, freezer: 365, pantry: 365 },
  { keywords: ["peanut butter", "almond butter", "cashew butter"], fridge: 90, freezer: 180, pantry: 90 },
  { keywords: ["jam", "jelly", "preserves"], fridge: 365, freezer: null, pantry: 365 },
  { keywords: ["salsa"], fridge: 14, freezer: 60, pantry: 365 },

  // ── Nuts & Seeds ──
  { keywords: ["almond", "almonds"], fridge: 365, freezer: 730, pantry: 180 },
  { keywords: ["walnut", "walnuts"], fridge: 180, freezer: 365, pantry: 90 },
  { keywords: ["cashew", "cashews"], fridge: 180, freezer: 365, pantry: 90 },
  { keywords: ["pecan", "pecans"], fridge: 270, freezer: 730, pantry: 90 },
  { keywords: ["pine nut", "pine nuts"], fridge: 90, freezer: 270, pantry: 30 },
  { keywords: ["sunflower seed", "pumpkin seed", "chia seed", "flaxseed", "sesame seed"], fridge: 90, freezer: 365, pantry: 90 },

  // ── Herbs & Spices ──
  { keywords: ["fresh basil", "fresh cilantro", "fresh parsley", "fresh thyme", "fresh rosemary", "fresh dill", "fresh mint", "fresh herb"], fridge: 7, freezer: 180, pantry: null },
  { keywords: ["dried basil", "dried oregano", "dried thyme", "dried rosemary", "dried parsley", "dried dill", "dried herb", "spice", "cumin", "paprika", "turmeric", "cinnamon", "chili powder", "cayenne"], fridge: null, freezer: null, pantry: 1095 },
];

// Storage type preference per item (where to look first)
const PREFER_FRIDGE  = new Set(["fridge", "refrigerator", "refrigerate"]);
const PREFER_FREEZER = new Set(["freezer", "freeze", "frozen"]);

/**
 * Look up shelf life for an ingredient name.
 * Returns { days, storage, label } or null if unknown.
 *   storage: "fridge" | "freezer" | "pantry"
 *   label:   human-readable string like "7 days (fridge)"
 */
export function lookupShelfLife(name, storageHint = "fridge") {
  if (!name) return null;
  const lower = name.toLowerCase().trim();

  let best = null;
  let bestLen = 0;

  for (const entry of SHELF_LIFE) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw) || kw.includes(lower)) {
        if (kw.length > bestLen) {
          bestLen = kw.length;
          best = entry;
        }
      }
    }
  }

  if (!best) return null;

  // Pick the best storage type
  let storage = "pantry";
  let days = best.pantry;

  if (best.fridge != null) { storage = "fridge"; days = best.fridge; }
  if (PREFER_FREEZER.has(storageHint) && best.freezer != null) { storage = "freezer"; days = best.freezer; }

  if (days == null) return null;

  return { days, storage, label: formatShelfLife(days, storage) };
}

export function formatShelfLife(days, storage) {
  let readable;
  if (days >= 3650)     readable = "Indefinite";
  else if (days >= 730) readable = `~${Math.round(days / 365)} years`;
  else if (days >= 365) readable = "~1 year";
  else if (days >= 60)  readable = `~${Math.round(days / 30)} months`;
  else if (days >= 14)  readable = `~${Math.round(days / 7)} weeks`;
  else                  readable = `${days} day${days === 1 ? "" : "s"}`;

  const icon = storage === "fridge" ? "❄️" : storage === "freezer" ? "🧊" : "🗄️";
  return `${icon} ${readable} (${storage})`;
}

/**
 * Given a shelf life result, return an expiry date string and status.
 */
export function expiryFromShelfLife(shelfLife) {
  if (!shelfLife) return { expiry: "Unknown", status: "ok" };
  const date = new Date();
  date.setDate(date.getDate() + shelfLife.days);
  const expiry = shelfLife.days >= 3650
    ? "Indefinite"
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const status = shelfLife.days <= 5 ? "soon" : "ok";
  return { expiry, status };
}
