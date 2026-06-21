// Try sizes in preference order; fall back through all available sizes
function pickImage(images) {
  const front = images?.find(i => i.perspective === "front") ?? images?.[0];
  if (!front?.sizes?.length) return null;
  const preferred = ["thumbnail", "small", "medium", "large", "xlarge"];
  for (const size of preferred) {
    const url = front.sizes.find(s => s.size === size)?.url;
    if (url) return url;
  }
  return front.sizes[0]?.url ?? null;
}

// All Kroger calls go through our serverless function — auth is handled server-side
const BASE = "/api/kroger";

async function krogerFetch(path) {
  const res = await fetch(`${BASE}${path}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Kroger error ${res.status}: ${err.error ?? res.statusText}`);
  }
  return res.json();
}

/**
 * Look up a product by UPC barcode.
 */
export async function krogerLookupUPC(upc) {
  const data = await krogerFetch(
    `/products?filter.term=${upc}&filter.fulfillment=ais&filter.limit=1`
  );
  const product = data?.data?.[0];
  if (!product) return null;
  const item = product.items?.[0];
  return {
    name:            product.description,
    image:           pickImage(product.images),
    amount:          item?.size ? parseFloat(item.size) || 1 : 1,
    unit:            item?.soldBy ?? "",
    krogerProductId: product.productId,
    price:           item?.price?.regular ?? null,
  };
}

/**
 * Search products by name. Returns array of { name, image, price, promo, productId, size, soldBy }.
 */
export async function krogerSearchProducts(query, locationId = null, limit = 5) {
  const locationParam = locationId ? `&filter.locationId=${locationId}` : "";
  const data = await krogerFetch(
    `/products?filter.term=${encodeURIComponent(query)}&filter.fulfillment=ais&filter.limit=${limit}${locationParam}`
  );
  if (!data?.data) return [];

  return data.data.map(p => {
    const item = p.items?.[0];
    return {
      name:      p.description,
      productId: p.productId,
      image:     pickImage(p.images),
      price:     item?.price?.regular ?? null,
      promo:     item?.price?.promo   ?? null,
      size:      item?.size   ?? null,
      soldBy:    item?.soldBy ?? null,
    };
  });
}

/**
 * Find the nearest Kroger location by zip code.
 */
export async function krogerFindLocation(zipCode) {
  const data = await krogerFetch(
    `/locations?filter.zipCode.near=${zipCode}&filter.limit=1&filter.chain=Kroger`
  );
  const loc = data?.data?.[0];
  if (!loc) return null;
  return {
    locationId: loc.locationId,
    name:       loc.name,
    address:    `${loc.address?.addressLine1}, ${loc.address?.city}, ${loc.address?.state}`,
  };
}

const DEAL_TERMS = [
  { term: "chicken breast",    category: "Meat & Seafood", emoji: "🍗" },
  { term: "ground beef",       category: "Meat & Seafood", emoji: "🥩" },
  { term: "pork chops",        category: "Meat & Seafood", emoji: "🥩" },
  { term: "salmon",            category: "Meat & Seafood", emoji: "🐟" },
  { term: "shrimp",            category: "Meat & Seafood", emoji: "🦐" },
  { term: "bacon",             category: "Meat & Seafood", emoji: "🥓" },
  { term: "steak",             category: "Meat & Seafood", emoji: "🥩" },
  { term: "sausage",           category: "Meat & Seafood", emoji: "🌭" },
  { term: "strawberry",        category: "Produce",        emoji: "🍓" },
  { term: "blueberry",         category: "Produce",        emoji: "🫐" },
  { term: "broccoli",          category: "Produce",        emoji: "🥦" },
  { term: "apples",            category: "Produce",        emoji: "🍎" },
  { term: "bananas",           category: "Produce",        emoji: "🍌" },
  { term: "tomatoes",          category: "Produce",        emoji: "🍅" },
  { term: "avocado",           category: "Produce",        emoji: "🥑" },
  { term: "spinach",           category: "Produce",        emoji: "🥬" },
  { term: "yogurt",            category: "Dairy & Eggs",   emoji: "🥛" },
  { term: "cheese",            category: "Dairy & Eggs",   emoji: "🧀" },
  { term: "butter",            category: "Dairy & Eggs",   emoji: "🧈" },
  { term: "eggs",              category: "Dairy & Eggs",   emoji: "🥚" },
  { term: "milk",              category: "Dairy & Eggs",   emoji: "🥛" },
  { term: "cream cheese",      category: "Dairy & Eggs",   emoji: "🧀" },
  { term: "orange juice",      category: "Beverages",      emoji: "🧃" },
  { term: "soda",              category: "Beverages",      emoji: "🥤" },
  { term: "water",             category: "Beverages",      emoji: "💧" },
  { term: "coffee",            category: "Beverages",      emoji: "☕" },
  { term: "chips",             category: "Snacks",         emoji: "🥔" },
  { term: "cookies",           category: "Snacks",         emoji: "🍪" },
  { term: "crackers",          category: "Snacks",         emoji: "🫙" },
  { term: "granola bar",       category: "Snacks",         emoji: "🍫" },
  { term: "frozen pizza",      category: "Frozen",         emoji: "🍕" },
  { term: "ice cream",         category: "Frozen",         emoji: "🍦" },
  { term: "frozen vegetables", category: "Frozen",         emoji: "🥦" },
  { term: "frozen meals",      category: "Frozen",         emoji: "🍱" },
  { term: "pasta",             category: "Pantry",         emoji: "🍝" },
  { term: "cereal",            category: "Pantry",         emoji: "🥣" },
  { term: "bread",             category: "Pantry",         emoji: "🍞" },
  { term: "soup",              category: "Pantry",         emoji: "🍲" },
  { term: "salsa",             category: "Pantry",         emoji: "🫙" },
  { term: "peanut butter",     category: "Pantry",         emoji: "🥜" },
  { term: "paper towels",      category: "Household",      emoji: "🧻" },
  { term: "laundry detergent", category: "Household",      emoji: "🧺" },
  { term: "dish soap",         category: "Household",      emoji: "🫧" },
];

/**
 * Fetch products with promotional pricing from Kroger.
 */
export async function krogerFetchDeals(locationId = null) {
  const seen    = new Set();
  const results = [];
  const locationParam = locationId ? `&filter.locationId=${locationId}` : "";

  await Promise.allSettled(
    DEAL_TERMS.map(async ({ term, category, emoji }) => {
      try {
        const data = await krogerFetch(
          `/products?filter.term=${encodeURIComponent(term)}&filter.fulfillment=ais&filter.limit=8${locationParam}`
        );
        for (const p of data?.data ?? []) {
          const item = p.items?.[0];
          if (!item?.price?.promo || seen.has(p.productId)) continue;
          seen.add(p.productId);
          results.push({
            id:        p.productId,
            name:      p.description,
            category,
            storeId:   "kroger",
            salePrice: item.price.promo,
            regPrice:  item.price.regular ?? item.price.promo,
            image:     pickImage(p.images),
            unitLabel: item.soldBy ?? "each",
            size:      item.size ?? null,
            sponsored: false,
            coupon:    false,
            emoji,
          });
        }
      } catch (_) {}
    })
  );

  return results.sort((a, b) => (b.regPrice - b.salePrice) - (a.regPrice - a.salePrice));
}
