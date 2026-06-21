import { useState, useEffect } from "react";
import { ALL_STORES } from "../groceryStores";
import { krogerFetchDeals } from "../kroger";
import { WEEKLY_DEALS } from "../data/dealsData";

const CATEGORIES = ["All", "Meat", "Produce", "Dairy", "Snacks", "Drinks", "Frozen", "Household", "Sponsored"];

const CATEGORY_MAP = {
  "Meat":      ["Meat & Seafood"],
  "Produce":   ["Produce"],
  "Dairy":     ["Dairy & Eggs"],
  "Snacks":    ["Snacks"],
  "Drinks":    ["Beverages"],
  "Frozen":    ["Frozen"],
  "Household": ["Household"],
};

function getStoreName(id) {
  return ALL_STORES.find(s => s.id === id)?.name ?? id;
}
function getStoreLogo(id) {
  return ALL_STORES.find(s => s.id === id)?.logo ?? "🛒";
}

function DealCard({ deal, added, onAdd }) {
  const savings = (deal.regPrice - deal.salePrice).toFixed(2);
  return (
    <div style={{
      background: "#fff", borderRadius: "14px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
      padding: "12px", display: "flex", alignItems: "center", gap: "12px",
    }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        {deal.image ? (
          <img
            src={deal.image}
            alt={deal.name}
            style={{ width: "48px", height: "48px", borderRadius: "10px", objectFit: "cover" }}
            onError={e => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%",
          background: "#eaf4e0", display: deal.image ? "none" : "flex",
          alignItems: "center", justifyContent: "center", fontSize: "24px",
        }}>
          {deal.emoji}
        </div>
        {deal.sponsored && (
          <span style={{
            position: "absolute", top: "-4px", right: "-4px",
            background: "#ef4444", color: "#fff", fontSize: "8px",
            fontWeight: 800, borderRadius: "4px", padding: "1px 4px",
          }}>AD</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#1a2e10", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {deal.name}
        </p>
        <p style={{ fontSize: "8px", color: "#888", margin: "0 0 4px" }}>
          {getStoreLogo(deal.storeId)} Sale ends Sat
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "14px", fontWeight: 800, color: "#16a34a" }}>${deal.salePrice}</span>
          <span style={{ fontSize: "10px", color: "#aaa", textDecoration: "line-through" }}>${deal.regPrice}</span>
          <span style={{ fontSize: "9px", color: "#ef4444", fontWeight: 700 }}>save ${savings}</span>
        </div>
        {deal.coupon && (
          <span style={{
            fontSize: "10px", background: "#eaf4e0", color: "#2d3a1e",
            borderRadius: "8px", padding: "2px 8px", fontWeight: 600,
            display: "inline-block", marginTop: "4px",
          }}>
            🏷️ Digital coupon applied
          </span>
        )}
      </div>

      <button
        onClick={onAdd}
        disabled={added}
        style={{
          width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
          background: added ? "#bbf7d0" : "#3a6b2a", border: "none",
          color: "#fff", fontSize: "18px", cursor: added ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {added ? "✓" : "+"}
      </button>
    </div>
  );
}

export default function Deals({ prefs, groceryList, onAddToGroceryList, krogerLocationId, krogerLocation }) {
  const userStores = prefs?.stores?.length
    ? prefs.stores.filter(sid => ALL_STORES.some(s => s.id === sid))
    : ["kroger"];

  const [activeStore, setActiveStore] = useState(userStores[0] ?? "kroger");
  const [activeCategory, setActiveCategory] = useState("All");
  const [addedIds, setAddedIds] = useState(new Set());
  const [liveDeals, setLiveDeals] = useState(null);
  const [loadingDeals, setLoadingDeals] = useState(false);

  useEffect(() => {
    if (activeStore !== "kroger") return;
    setLoadingDeals(true);
    krogerFetchDeals(krogerLocationId)
      .then(deals => setLiveDeals(deals.length > 0 ? deals : null))
      .catch(() => setLiveDeals(null))
      .finally(() => setLoadingDeals(false));
  }, [activeStore, krogerLocationId]);

  const groceryNames = groceryList.map(i => (i.name ?? "").toLowerCase());
  const dealsSource = (activeStore === "kroger" && liveDeals) ? liveDeals : WEEKLY_DEALS;

  function filterDeals(deals) {
    return deals.filter(deal => {
      if (deal.storeId !== activeStore) return false;
      if (groceryNames.includes(deal.name.toLowerCase())) return false;
      if (activeCategory === "All") return true;
      if (activeCategory === "Sponsored") return deal.sponsored;
      const mapped = CATEGORY_MAP[activeCategory];
      if (!mapped) return false;
      return mapped.includes(deal.category);
    });
  }

  const filtered = filterDeals(dealsSource);
  const sponsored = filtered.filter(d => d.sponsored);
  const regular   = filtered.filter(d => !d.sponsored);

  function handleAdd(deal) {
    onAddToGroceryList({
      id: crypto.randomUUID(),
      name: deal.name,
      amount: 1,
      unit: deal.unitLabel,
      storeId: deal.storeId,
      aisle: deal.category,
      checked: false,
      estimatedPrice: deal.salePrice,
      coupon: deal.coupon,
    });
    setAddedIds(prev => new Set([...prev, deal.id]));
  }

  return (
    <div style={{ fontFamily: "-apple-system, Arial, sans-serif", paddingBottom: "80px" }}>
      <div style={{ padding: "20px 16px 12px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1a2e10", margin: 0 }}>🛒 Browse Products</h1>
        <p style={{ color: "#888", fontSize: "13px", marginTop: "2px" }}>
          {loadingDeals
            ? `${getStoreName(activeStore)} · Loading deals…`
            : `${getStoreName(activeStore)} · ${dealsSource.filter(d => d.storeId === activeStore).length} items on sale`
          }
        </p>
        {activeStore === "kroger" && krogerLocation?.name && (
          <p style={{ color: "#3a6b2a", fontSize: "12px", marginTop: "2px", fontWeight: 600 }}>
            📍 {krogerLocation.name} · {krogerLocation.address}
          </p>
        )}
        {activeStore === "kroger" && !krogerLocation && prefs?.zipCode && (
          <p style={{ color: "#f97316", fontSize: "12px", marginTop: "2px" }}>
            ⚠️ Resolving your Kroger location…
          </p>
        )}
        {activeStore === "kroger" && !prefs?.zipCode && (
          <p style={{ color: "#f97316", fontSize: "12px", marginTop: "2px" }}>
            ℹ️ Add your zip code in Profile for location-specific deals
          </p>
        )}
        {activeStore === "kroger" && (
          <div style={{
            marginTop: "8px", padding: "8px 12px", background: "#fff8e8",
            border: "1px solid #f5c842", borderRadius: "10px",
            fontSize: "12px", color: "#7a5500", lineHeight: 1.4,
          }}>
            ⚠️ Prices shown are from the Kroger product API and may not match the current weekly circular. Check{" "}
            <a href="https://www.kroger.com/savings/cl/weeklyad" target="_blank" rel="noopener noreferrer" style={{ color: "#3a6b2a", fontWeight: 700 }}>
              kroger.com/weeklyad
            </a>{" "}for verified sale prices.
          </div>
        )}
      </div>

      {/* Store tabs */}
      <div style={{ overflowX: "auto", display: "flex", gap: "8px", padding: "0 16px 12px", scrollbarWidth: "none" }}>
        {userStores.map(sid => (
          <button key={sid} onClick={() => setActiveStore(sid)} style={{
            padding: "8px 16px", borderRadius: "20px",
            border: activeStore === sid ? "2px solid #3a6b2a" : "2px solid #e0e8d8",
            background: activeStore === sid ? "#eaf4e0" : "#fff",
            fontSize: "13px", fontWeight: activeStore === sid ? 700 : 400,
            color: activeStore === sid ? "#2d3a1e" : "#666",
            cursor: "pointer", whiteSpace: "nowrap",
          }}>
            {getStoreName(sid)}
          </button>
        ))}
      </div>

      {/* Category pills */}
      <div style={{ overflowX: "auto", display: "flex", gap: "8px", padding: "0 16px 16px", scrollbarWidth: "none" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: "6px 14px", borderRadius: "16px",
            border: activeCategory === cat ? "2px solid #3a6b2a" : "2px solid #e0e8d8",
            background: activeCategory === cat ? "#eaf4e0" : "#fff",
            fontSize: "12px", fontWeight: activeCategory === cat ? 700 : 400,
            color: activeCategory === cat ? "#2d3a1e" : "#666",
            cursor: "pointer", whiteSpace: "nowrap",
          }}>
            {cat}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>
        {loadingDeals && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏳</div>
            <p style={{ fontSize: "14px" }}>Fetching live Kroger deals…</p>
          </div>
        )}
        {!loadingDeals && (activeCategory === "All" || activeCategory === "Sponsored") && sponsored.length > 0 && (
          <>
            <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
              ✨ Featured Brands
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {sponsored.map(deal => <DealCard key={deal.id} deal={deal} added={addedIds.has(deal.id)} onAdd={() => handleAdd(deal)} />)}
            </div>
          </>
        )}
        {!loadingDeals && activeCategory !== "Sponsored" && regular.length > 0 && (
          <>
            <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
              {activeStore === "kroger" && liveDeals ? "Kroger Products" : "This Week's Sales"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {regular.map(deal => <DealCard key={deal.id} deal={deal} added={addedIds.has(deal.id)} onAdd={() => handleAdd(deal)} />)}
            </div>
          </>
        )}
        {!loadingDeals && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>🏷️</div>
            <p>No deals found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
