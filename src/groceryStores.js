// Major US grocery chains, grouped by category.
// ZIP prefix ranges are approximate regional hints (not exhaustive).

export const STORE_GROUPS = [
  {
    group: "National",
    stores: [
      { id: "walmart",      name: "Walmart",        logo: "🛒" },
      { id: "target",       name: "Target",         logo: "🎯" },
      { id: "costco",       name: "Costco",         logo: "📦" },
      { id: "samsclub",     name: "Sam's Club",     logo: "📦" },
      { id: "wholefood",    name: "Whole Foods",    logo: "🌿" },
      { id: "traderjoes",   name: "Trader Joe's",   logo: "🌺" },
      { id: "aldi",         name: "Aldi",           logo: "🏷️" },
      { id: "lidl",         name: "Lidl",           logo: "🏷️" },
      { id: "amazonfresh",  name: "Amazon Fresh",   logo: "📬" },
    ],
  },
  {
    group: "Regional",
    stores: [
      { id: "kroger",       name: "Kroger",         logo: "🛒" },
      { id: "safeway",      name: "Safeway",        logo: "🛒" },
      { id: "publix",       name: "Publix",         logo: "🛒" },
      { id: "heb",          name: "H-E-B",          logo: "🌵" },
      { id: "meijer",       name: "Meijer",         logo: "🛒" },
      { id: "wegmans",      name: "Wegmans",        logo: "🛒" },
      { id: "stopshop",     name: "Stop & Shop",    logo: "🛒" },
      { id: "giant",        name: "Giant",          logo: "🛒" },
      { id: "foodlion",     name: "Food Lion",      logo: "🦁" },
      { id: "winndixie",    name: "Winn-Dixie",     logo: "🛒" },
      { id: "ralphsvons",   name: "Ralphs / Vons",  logo: "🛒" },
      { id: "harristet",    name: "Harris Teeter",  logo: "🛒" },
      { id: "sprouts",      name: "Sprouts",        logo: "🌱" },
      { id: "freshmarket",  name: "The Fresh Market", logo: "🌿" },
      { id: "shoprite",     name: "ShopRite",       logo: "🛒" },
      { id: "acme",         name: "ACME Markets",   logo: "🛒" },
      { id: "albertsons",   name: "Albertsons",     logo: "🛒" },
    ],
  },
];

export const ALL_STORES = STORE_GROUPS.flatMap(g => g.stores);
