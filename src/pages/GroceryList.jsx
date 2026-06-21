import { useState, useEffect, useRef } from "react";
import { ALL_STORES } from "../groceryStores";
import { AISLE_ORDER } from "../data/aisleData";
import { EXTRAS_CATEGORIES } from "../data/extrasData";
import { krogerSearchProducts } from "../kroger";

function getStoreName(storeId) {
  return ALL_STORES.find(s => s.id === storeId)?.name ?? storeId;
}
function getStoreLogo(storeId) {
  return ALL_STORES.find(s => s.id === storeId)?.logo ?? "🛒";
}

function SwapModal({ item, onClose, onSelect }) {
  const brands = [
    { name: `${getStoreName(item.storeId ?? "kroger")} Brand`, price: ((item.estimatedPrice ?? 2) * 0.8).toFixed(2) },
    { name: "Signature Select", price: ((item.estimatedPrice ?? 2) * 0.9).toFixed(2) },
    { name: "Simple Truth Organic", price: ((item.estimatedPrice ?? 2) * 1.15).toFixed(2) },
  ];
  const subs = [
    { name: `Generic ${item.name}`, price: ((item.estimatedPrice ?? 2) * 0.75).toFixed(2) },
    { name: `Frozen ${item.name}`, price: ((item.estimatedPrice ?? 2) * 0.7).toFixed(2) },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div style={{ position: "relative", background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 32px", zIndex: 1 }}>
        <div style={{ width: "40px", height: "4px", background: "#ddd", borderRadius: "2px", margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#1a2e10", marginBottom: "16px" }}>Swap: {item.name}</h3>
        <p style={{ fontSize: "12px", color: "#888", marginBottom: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Brands</p>
        {brands.map((b, i) => (
          <button key={i} onClick={() => onSelect(b.name)} style={{
            width: "100%", display: "flex", justifyContent: "space-between", padding: "12px",
            marginBottom: "6px", background: "#f8faf6", border: "1.5px solid #e0e8d8",
            borderRadius: "10px", cursor: "pointer", fontSize: "14px",
          }}>
            <span>{b.name}</span>
            <span style={{ color: "#3a6b2a", fontWeight: 700 }}>${b.price}</span>
          </button>
        ))}
        <p style={{ fontSize: "12px", color: "#888", marginBottom: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "16px" }}>Substitutions</p>
        {subs.map((s, i) => (
          <button key={i} onClick={() => onSelect(s.name)} style={{
            width: "100%", display: "flex", justifyContent: "space-between", padding: "12px",
            marginBottom: "6px", background: "#f8faf6", border: "1.5px solid #e0e8d8",
            borderRadius: "10px", cursor: "pointer", fontSize: "14px",
          }}>
            <span>{s.name}</span>
            <span style={{ color: "#3a6b2a", fontWeight: 700 }}>${s.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function GroceryList({ groceryList, pantry, onUpdateList, onAddToPantry, prefs, krogerLocationId }) {
  const [activeTab, setActiveTab] = useState("list");
  const [swapItem, setSwapItem] = useState(null);
  const [orderBanners, setOrderBanners] = useState({});
  const [expandedExtra, setExpandedExtra] = useState(null);
  const [pricingStatus, setPricingStatus] = useState("idle"); // idle | loading | done
  const pricedIds = useRef(new Set());

  // Look up real Kroger prices for any kroger item that hasn't been priced yet
  useEffect(() => {
    const krogerItems = groceryList.filter(
      i => (i.storeId ?? "kroger") === "kroger" && !pricedIds.current.has(i.id)
    );
    if (!krogerItems.length) return;

    setPricingStatus("loading");
    Promise.allSettled(
      krogerItems.map(async item => {
        try {
          const results = await krogerSearchProducts(item.name, krogerLocationId ?? null, 1);
          const match = results[0];
          if (match?.price) {
            pricedIds.current.add(item.id);
            return { id: item.id, price: match.price, krogerName: match.name, krogerSize: match.size };
          }
        } catch (_) {}
        pricedIds.current.add(item.id); // mark as tried even if no result
        return null;
      })
    ).then(settled => {
      const updates = settled
        .filter(r => r.status === "fulfilled" && r.value)
        .map(r => r.value);

      if (updates.length) {
        onUpdateList(prev => prev.map(item => {
          const u = updates.find(u => u.id === item.id);
          return u ? { ...item, estimatedPrice: u.price, krogerName: u.krogerName, krogerSize: u.krogerSize } : item;
        }));
      }
      setPricingStatus("done");
    });
  }, [groceryList.map(i => i.id).join(","), krogerLocationId]);

  const pantryNames = pantry.map(p => (p.name ?? "").toLowerCase());
  const inPantryCount = groceryList.filter(item =>
    pantryNames.some(p => p.includes((item.name ?? "").toLowerCase()))
  ).length;

  const storeGroups = {};
  for (const item of groceryList) {
    const sid = item.storeId ?? "kroger";
    if (!storeGroups[sid]) storeGroups[sid] = [];
    storeGroups[sid].push(item);
  }

  function toggleCheck(id) {
    onUpdateList(groceryList.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  }

  function moveCheckedToPantry(storeId) {
    const storeItems = storeGroups[storeId] ?? [];
    const checked = storeItems.filter(i => i.checked);
    onAddToPantry(checked);
    onUpdateList(groceryList.filter(i => !(i.storeId === storeId && i.checked)));
  }

  function handleOrder(storeId) {
    setOrderBanners(prev => ({ ...prev, [storeId]: true }));
    setTimeout(() => {
      const items = storeGroups[storeId] ?? [];
      onAddToPantry(items);
      onUpdateList(groceryList.filter(i => i.storeId !== storeId));
      setOrderBanners(prev => ({ ...prev, [storeId]: false }));
    }, 1500);
  }

  function handleSwapSelect(item, newName) {
    onUpdateList(groceryList.map(i => i.id === item.id ? { ...i, name: newName } : i));
    setSwapItem(null);
  }

  function addExtra(extraItem) {
    const existing = groceryList.find(i => i.name.toLowerCase() === extraItem.name.toLowerCase());
    if (existing) return;
    onUpdateList([...groceryList, {
      id: crypto.randomUUID(),
      name: extraItem.name,
      amount: 1,
      unit: extraItem.unit,
      storeId: prefs?.stores?.[0] ?? "kroger",
      aisle: "Snacks",
      checked: false,
      estimatedPrice: null,
    }]);
  }

  function groupByAisle(items) {
    const map = {};
    for (const item of items) {
      const aisle = item.aisle ?? "Canned & Dry";
      if (!map[aisle]) map[aisle] = [];
      map[aisle].push(item);
    }
    return Object.entries(map).sort((a, b) => (AISLE_ORDER[a[0]] ?? 99) - (AISLE_ORDER[b[0]] ?? 99));
  }

  const storeTotal = (items) => items.reduce((sum, i) => sum + (i.estimatedPrice ?? 0), 0).toFixed(2);

  return (
    <div style={{ fontFamily: "-apple-system, Arial, sans-serif", paddingBottom: "80px" }}>
      <div style={{ display: "flex", borderBottom: "2px solid #e0e8d8", margin: "0 16px" }}>
        {[{ id: "list", label: "🛒 My List" }, { id: "extras", label: "➕ Extras" }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: "14px 0",
            background: "none", border: "none",
            borderBottom: activeTab === tab.id ? "2px solid #3a6b2a" : "2px solid transparent",
            marginBottom: "-2px",
            fontWeight: activeTab === tab.id ? 700 : 400,
            color: activeTab === tab.id ? "#3a6b2a" : "#888",
            fontSize: "14px", cursor: "pointer",
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "list" && (
        <div style={{ padding: "16px" }}>
          {groceryList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🧾</div>
              <p style={{ fontWeight: 700, color: "#1a2e10" }}>Your list is empty</p>
              <p style={{ fontSize: "13px" }}>Add meals from the Meals tab to build your list.</p>
            </div>
          ) : (
            <>
              {inPantryCount > 0 && (
                <div style={{ background: "#eaf4e0", borderRadius: "12px", padding: "12px 14px", marginBottom: "16px", color: "#2d3a1e", fontSize: "13px", fontWeight: 600 }}>
                  ✅ {inPantryCount} ingredient{inPantryCount !== 1 ? "s" : ""} already in your pantry
                </div>
              )}
              {Object.entries(storeGroups).map(([storeId, items]) => (
                <div key={storeId} style={{ marginBottom: "20px" }}>
                  <div style={{ background: "#2d3a1e", borderRadius: "14px 14px 0 0", padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <div>
                        <p style={{ color: "#fff", fontWeight: 800, fontSize: "16px", margin: 0 }}>
                          {getStoreLogo(storeId)} {getStoreName(storeId)}
                        </p>
                        <p style={{ color: "#a8e063", fontSize: "12px", margin: 0 }}>
                          {items.length} items · {storeId === "kroger" && pricingStatus === "loading" ? "fetching prices…" : `$${storeTotal(items)}`}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleOrder(storeId)} style={{
                        flex: 1, padding: "8px", borderRadius: "8px",
                        border: "1.5px solid rgba(255,255,255,0.5)", background: "transparent",
                        color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer",
                      }}>🏪 Pickup</button>
                      <button onClick={() => handleOrder(storeId)} style={{
                        flex: 1, padding: "8px", borderRadius: "8px",
                        border: "1.5px solid #f97316", background: "transparent",
                        color: "#f97316", fontSize: "12px", fontWeight: 700, cursor: "pointer",
                      }}>🛒 Instacart</button>
                    </div>
                  </div>

                  {orderBanners[storeId] && (
                    <div style={{ background: "#eaf4e0", padding: "12px 16px", color: "#2d3a1e", fontSize: "13px", fontWeight: 600 }}>
                      🚀 Ordering coming soon! Moving items to pantry…
                    </div>
                  )}

                  <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", border: "1.5px solid #e0e8d8", borderTop: "none" }}>
                    {groupByAisle(items).map(([aisle, aisleItems]) => (
                      <div key={aisle}>
                        <p style={{ fontSize: "11px", fontWeight: 700, color: "#888", padding: "8px 16px 4px", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", borderTop: "1px solid #f0f4ec" }}>
                          {aisle}
                        </p>
                        {aisleItems.map(item => {
                          const isKroger = (item.storeId ?? "kroger") === "kroger";
                          const isPricing = isKroger && pricingStatus === "loading" && !pricedIds.current.has(item.id);
                          return (
                            <div key={item.id} style={{ padding: "10px 16px", borderTop: "1px solid #f5f7f3" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <input type="checkbox" checked={!!item.checked} onChange={() => toggleCheck(item.id)} style={{ width: "18px", height: "18px", accentColor: "#3a6b2a", flexShrink: 0 }} />
                                <span style={{ flex: 1, fontSize: "14px", color: item.checked ? "#aaa" : "#1a2e10", textDecoration: item.checked ? "line-through" : "none" }}>
                                  {item.name}
                                </span>
                                <span style={{ fontSize: "12px", color: "#888", whiteSpace: "nowrap" }}>
                                  {item.amount} {item.sellUnit ?? item.unit}
                                </span>
                                {isPricing ? (
                                  <span style={{ fontSize: "12px", color: "#bbb", whiteSpace: "nowrap" }}>…</span>
                                ) : item.estimatedPrice ? (
                                  <span style={{ fontSize: "12px", color: "#3a6b2a", fontWeight: 700, whiteSpace: "nowrap" }}>
                                    ${typeof item.estimatedPrice === "number" ? item.estimatedPrice.toFixed(2) : item.estimatedPrice}
                                  </span>
                                ) : null}
                                <button onClick={() => setSwapItem(item)} style={{
                                  padding: "4px 8px", background: "#f0f4ec",
                                  border: "none", borderRadius: "6px",
                                  fontSize: "11px", color: "#3a6b2a", fontWeight: 700, cursor: "pointer",
                                }}>Swap</button>
                              </div>
                              {item.krogerName && (
                                <p style={{ margin: "3px 0 0 28px", fontSize: "11px", color: "#888" }}>
                                  🛒 {item.krogerName}{item.krogerSize ? ` · ${item.krogerSize}` : ""}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    <div style={{ padding: "10px 16px" }}>
                      <button onClick={() => moveCheckedToPantry(storeId)} style={{
                        width: "100%", padding: "10px",
                        background: "#eaf4e0", border: "none", borderRadius: "10px",
                        color: "#2d3a1e", fontWeight: 700, fontSize: "13px", cursor: "pointer",
                      }}>
                        ✓ Move Checked to Pantry
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {activeTab === "extras" && (
        <div style={{ padding: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {EXTRAS_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setExpandedExtra(prev => prev === cat.id ? null : cat.id)}
                style={{
                  padding: "16px 12px",
                  background: expandedExtra === cat.id ? "#eaf4e0" : "#fff",
                  border: `2px solid ${expandedExtra === cat.id ? "#3a6b2a" : "#e0e8d8"}`,
                  borderRadius: "12px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: "28px" }}>{cat.emoji}</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#1a2e10" }}>{cat.label}</span>
              </button>
            ))}
          </div>

          {expandedExtra && (() => {
            const cat = EXTRAS_CATEGORIES.find(c => c.id === expandedExtra);
            if (!cat) return null;
            return (
              <div style={{ marginTop: "16px", background: "#fff", borderRadius: "14px", border: "1.5px solid #e0e8d8", overflow: "hidden" }}>
                <p style={{ padding: "12px 16px 8px", fontWeight: 700, fontSize: "15px", color: "#1a2e10", margin: 0, borderBottom: "1px solid #f0f4ec" }}>
                  {cat.emoji} {cat.label}
                </p>
                {cat.items.map(item => (
                  <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderBottom: "1px solid #f5f7f3" }}>
                    <span style={{ fontSize: "20px" }}>{item.emoji}</span>
                    <span style={{ flex: 1, fontSize: "14px", color: "#1a2e10" }}>{item.name}</span>
                    <span style={{ fontSize: "12px", color: "#888" }}>{item.unit}</span>
                    <button onClick={() => addExtra(item)} style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "#3a6b2a", border: "none", color: "#fff",
                      fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>+</button>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {swapItem && (
        <SwapModal
          item={swapItem}
          onClose={() => setSwapItem(null)}
          onSelect={name => handleSwapSelect(swapItem, name)}
        />
      )}
    </div>
  );
}
