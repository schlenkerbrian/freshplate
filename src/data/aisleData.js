export const AISLE_ORDER = {
  "Produce": 1,
  "Meat & Seafood": 2,
  "Dairy & Eggs": 3,
  "Bakery": 4,
  "Deli": 5,
  "Canned & Dry": 6,
  "Condiments": 7,
  "Baking": 8,
  "Snacks": 9,
  "Frozen": 10,
  "Beverages": 11,
  "Household": 12,
  "Personal Care": 13,
};

const AISLE_KEYWORDS = [
  {
    aisle: "Produce",
    keywords: [
      "apple", "banana", "orange", "lemon", "lime", "grape", "strawberry", "blueberry",
      "raspberry", "mango", "pineapple", "peach", "pear", "plum", "cherry", "watermelon",
      "cantaloupe", "avocado", "tomato", "cucumber", "zucchini", "squash", "pepper",
      "onion", "shallot", "garlic", "leek", "scallion", "green onion", "carrot", "celery",
      "broccoli", "cauliflower", "cabbage", "kale", "spinach", "lettuce", "arugula",
      "chard", "collard", "beet", "radish", "turnip", "potato", "sweet potato", "yam",
      "mushroom", "corn", "asparagus", "artichoke", "eggplant", "jalapeno", "cilantro",
      "parsley", "basil", "mint", "thyme", "rosemary", "dill", "sage", "ginger",
    ],
  },
  {
    aisle: "Meat & Seafood",
    keywords: [
      "chicken", "beef", "pork", "lamb", "turkey", "duck", "veal", "bison",
      "steak", "ground beef", "ground turkey", "sausage", "bacon", "ham", "prosciutto",
      "salami", "pepperoni", "hot dog", "bratwurst", "chorizo", "ribs", "tenderloin",
      "salmon", "tuna", "shrimp", "crab", "lobster", "clam", "oyster", "scallop",
      "tilapia", "cod", "halibut", "mahi", "trout", "catfish", "anchovy", "sardine",
      "fish", "seafood", "meat",
    ],
  },
  {
    aisle: "Dairy & Eggs",
    keywords: [
      "milk", "egg", "butter", "cheese", "yogurt", "cream", "sour cream",
      "cream cheese", "cottage cheese", "ricotta", "mozzarella", "parmesan", "cheddar",
      "brie", "gouda", "feta", "whipped cream", "half and half", "buttermilk",
      "kefir", "ghee",
    ],
  },
  {
    aisle: "Bakery",
    keywords: [
      "bread", "bagel", "muffin", "croissant", "roll", "bun", "tortilla", "pita",
      "naan", "english muffin", "sourdough", "baguette", "loaf", "cake", "cookie",
      "donut", "pie crust",
    ],
  },
  {
    aisle: "Deli",
    keywords: [
      "deli", "sliced turkey", "sliced ham", "cold cut", "roast beef", "pastrami",
      "corned beef", "swiss cheese", "provolone", "hummus", "prepared salad",
    ],
  },
  {
    aisle: "Canned & Dry",
    keywords: [
      "canned", "can of", "rice", "pasta", "noodle", "bean", "lentil", "chickpea",
      "pea", "quinoa", "oat", "oatmeal", "cereal", "granola", "ramen", "soup",
      "broth", "stock", "tomato sauce", "tomato paste", "diced tomato", "coconut milk",
      "tuna can", "sardine can", "black bean", "kidney bean", "navy bean",
    ],
  },
  {
    aisle: "Condiments",
    keywords: [
      "ketchup", "mustard", "mayonnaise", "mayo", "relish", "pickle", "hot sauce",
      "sriracha", "soy sauce", "teriyaki", "worcestershire", "vinegar", "salsa",
      "guacamole", "pesto", "marinara", "barbecue sauce", "bbq", "ranch", "caesar",
      "italian dressing", "balsamic", "oil", "olive oil", "vegetable oil", "coconut oil",
      "sesame oil",
    ],
  },
  {
    aisle: "Baking",
    keywords: [
      "flour", "sugar", "brown sugar", "powdered sugar", "baking soda", "baking powder",
      "yeast", "cornstarch", "cocoa powder", "chocolate chip", "vanilla extract",
      "almond extract", "salt", "honey", "maple syrup", "molasses", "agave",
      "corn syrup", "shortening", "lard", "sprinkle",
    ],
  },
  {
    aisle: "Snacks",
    keywords: [
      "chip", "cracker", "pretzel", "popcorn", "trail mix", "nut", "almond", "cashew",
      "peanut", "walnut", "pecan", "pistachio", "granola bar", "protein bar", "energy bar",
      "rice cake", "pork rind", "beef jerky", "dried fruit", "raisin",
    ],
  },
  {
    aisle: "Frozen",
    keywords: [
      "frozen", "ice cream", "gelato", "sorbet", "popsicle", "frozen pizza",
      "frozen meal", "frozen vegetable", "frozen fruit", "edamame", "waffles",
      "tater tot", "french fry", "frozen shrimp", "frozen fish",
    ],
  },
  {
    aisle: "Beverages",
    keywords: [
      "water", "sparkling water", "juice", "soda", "coffee", "tea", "energy drink",
      "sports drink", "lemonade", "kombucha", "almond milk", "oat milk", "soy milk",
      "coconut water", "wine", "beer", "spirits", "cider",
    ],
  },
  {
    aisle: "Household",
    keywords: [
      "dish soap", "laundry", "paper towel", "toilet paper", "trash bag", "zip bag",
      "plastic wrap", "aluminum foil", "cleaning", "bleach", "detergent", "fabric softener",
      "sponge", "mop", "vacuum", "candle", "air freshener", "battery", "light bulb",
    ],
  },
  {
    aisle: "Personal Care",
    keywords: [
      "shampoo", "conditioner", "body wash", "soap", "toothpaste", "toothbrush",
      "deodorant", "razor", "shaving", "lotion", "sunscreen", "makeup", "mascara",
      "lipstick", "foundation", "hair", "nail", "bandage", "medicine", "vitamin",
    ],
  },
];

export function getAisle(ingredientName) {
  if (!ingredientName) return "Canned & Dry";
  const lower = ingredientName.toLowerCase();
  for (const { aisle, keywords } of AISLE_KEYWORDS) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return aisle;
    }
  }
  return "Canned & Dry";
}
