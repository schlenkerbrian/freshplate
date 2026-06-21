import { useState, useEffect, useRef } from "react";
import { searchRecipes, extractRecipeFromUrl, getRecipeDetails } from "../spoonacular";
import { krogerSearchProducts } from "../kroger";
import { WEEKLY_DEALS } from "../data/dealsData";

const MEAL_COLORS = {
  Dinner: "#3b82f6",
  Lunch: "#22c55e",
  Breakfast: "#eab308",
};

function RecipeInstructionsModal({ recipe, onClose, onAddToQueue, krogerLocationId }) {
  const [adding, setAdding] = useState(false);
  const [details, setDetails] = useState(null);
  const [krogerMatches, setKrogerMatches] = useState({}); // name → { name, price, image }

  useEffect(() => {
    getRecipeDetails(recipe.id).then(setDetails).catch(() => {});
  }, [recipe.id]);

  useEffect(() => {
    if (!details?.ingredients?.length) return;
    const lookupAll = async () => {
      const entries = await Promise.allSettled(
        details.ingredients.map(async ing => {
          const results = await krogerSearchProducts(ing.name, krogerLocationId ?? null, 1);
          return [ing.name, results[0] ?? null];
        })
      );
      const map = {};
      for (const r of entries) {
        if (r.status === "fulfilled" && r.value[1]) {
          map[r.value[0]] = r.value[1];
        }
      }
      setKrogerMatches(map);
    };
    lookupAll();
  }, [details, krogerLocationId]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#fff", zIndex: 500,
      overflowY: "auto", fontFamily: "-apple-system, Arial, sans-serif",
    }}>
      <div style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, padding: "16px 16px 0", display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer" }}>←</button>
        <span style={{ fontWeight: 700, fontSize: "16px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{recipe.name}</span>
      </div>

      {recipe.image && (
        <img src={recipe.image} alt={recipe.name} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
      )}

      <div style={{ padding: "16px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1a2e10", marginBottom: "10px" }}>Ingredients</h3>
        {details ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            {details.ingredients.map((ing, i) => {
              const match = krogerMatches[ing.name];
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", background: "#f8faf6",
                  borderRadius: "12px", border: "1px solid #e0e8d8",
                }}>
                  {match?.image && (
                    <img src={match.image} alt={match.name} style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a2e10", margin: 0 }}>
                      {ing.amount} {ing.unit} {ing.name}
                    </p>
                    {match ? (
                      <p style={{ fontSize: "11px", color: "#3a6b2a", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        🛒 {match.name}{match.price ? ` — $${match.price.toFixed(2)}` : ""}
                        {match.promo && match.promo < match.price ? (
                          <span style={{ marginLeft: "6px", color: "#ef4444", fontWeight: 700 }}>
                            Sale ${match.promo.toFixed(2)}
                          </span>
                        ) : null}
                      </p>
                    ) : (
                      Object.keys(krogerMatches).length === 0 && (
                        <p style={{ fontSize: "11px", color: "#bbb", margin: "2px 0 0" }}>Looking up Kroger…</p>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "#888", fontSize: "13px", marginBottom: "20px" }}>Loading ingredients…</p>
        )}

        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1a2e10", marginBottom: "10px" }}>Instructions</h3>
        {details?.instructions?.length ? (
          <ol style={{ paddingLeft: "18px", margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {details.instructions.map((step, i) => (
              <li key={i} style={{ fontSize: "13px", lineHeight: 1.6, color: "#333" }}>
                {typeof step === "string" ? step : step.step}
              </li>
            ))}
          </ol>
        ) : (
          <p style={{ color: "#888", fontSize: "13px" }}>
            {details ? "No instructions available." : "Loading…"}
          </p>
        )}
      </div>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", paddingBottom: "32px" }}>
        <button onClick={onClose} style={{ padding: "14px", borderRadius: "12px", border: "1.5px solid #3a6b2a", background: "#fff", color: "#3a6b2a", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}>
          Close
        </button>
        {!adding ? (
          <button onClick={() => setAdding(true)} style={{ padding: "14px", borderRadius: "12px", border: "none", background: "#3a6b2a", color: "#fff", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}>
            Add to Meal Plan
          </button>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            {Object.entries(MEAL_COLORS).map(([type, color]) => (
              <button key={type} onClick={() => { onAddToQueue(recipe, type); onClose(); }} style={{
                flex: 1, padding: "12px 4px", borderRadius: "10px", border: "none",
                background: color, color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer",
              }}>
                {type}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => alert("Substitution options coming soon!")} style={{ padding: "14px", borderRadius: "12px", border: "1.5px solid #ddd", background: "#fff", color: "#555", fontWeight: 600, fontSize: "15px", cursor: "pointer" }}>
          Substitute Ingredients
        </button>
      </div>
    </div>
  );
}

function RecipeDetailSheet({ recipe, favorites, onClose, onAddToQueue, onToggleFavorite, krogerLocationId }) {
  const [mealPicking, setMealPicking] = useState(false);
  const [toast, setToast] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  function handleAdd(type) {
    onAddToQueue(recipe, type);
    setToast(`Added to ${type}! ✓`);
    setTimeout(() => { setToast(""); onClose(); }, 1200);
  }

  const isFav = favorites.some(f => f.id === recipe.id);

  if (showInstructions) {
    return <RecipeInstructionsModal recipe={recipe} onClose={() => setShowInstructions(false)} onAddToQueue={onAddToQueue} krogerLocationId={krogerLocationId} />;
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div style={{
        position: "relative", background: "#fff", borderRadius: "20px 20px 0 0",
        maxHeight: "85vh", overflowY: "auto", zIndex: 1,
      }}>
        <div style={{ width: "40px", height: "4px", background: "#ddd", borderRadius: "2px", margin: "12px auto 0" }} />

        <button onClick={onClose} style={{
          position: "absolute", top: "16px", right: "16px",
          background: "rgba(0,0,0,0.15)", border: "none", borderRadius: "50%",
          width: "30px", height: "30px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center",
        }}>×</button>

        {recipe.image && (
          <img src={recipe.image} alt={recipe.name} style={{ width: "100%", height: "180px", objectFit: "cover", marginTop: "8px" }} />
        )}

        <div style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "6px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1a2e10", flex: 1, marginRight: "8px" }}>{recipe.name}</h2>
            <button onClick={() => onToggleFavorite(recipe)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer" }}>
              {isFav ? "❤️" : "🤍"}
            </button>
          </div>
          <div style={{ display: "flex", gap: "12px", color: "#888", fontSize: "13px", marginBottom: "6px" }}>
            <span>⏱ {recipe.time}</span>
            <span>👤 {recipe.servings}</span>
            {recipe.pricePerServing && <span>${(recipe.pricePerServing / 100).toFixed(2)}/serving</span>}
          </div>

          {toast ? (
            <div style={{ padding: "14px", background: "#eaf4e0", borderRadius: "12px", color: "#3a6b2a", fontWeight: 700, textAlign: "center", fontSize: "15px", marginTop: "12px" }}>
              {toast}
            </div>
          ) : !mealPicking ? (
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button onClick={() => setMealPicking(true)} style={{
                flex: 1, padding: "14px", borderRadius: "12px", border: "none",
                background: "#3a6b2a", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer",
              }}>
                Add to Meal Plan
              </button>
              <button onClick={() => setShowInstructions(true)} style={{
                flex: 1, padding: "14px", borderRadius: "12px",
                border: "2px solid #3a6b2a", background: "#fff", color: "#3a6b2a",
                fontWeight: 700, fontSize: "14px", cursor: "pointer",
              }}>
                View Recipe
              </button>
            </div>
          ) : (
            <div style={{ marginTop: "16px" }}>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "10px" }}>Choose meal type:</p>
              <div style={{ display: "flex", gap: "8px" }}>
                {Object.entries(MEAL_COLORS).map(([type, color]) => (
                  <button key={type} onClick={() => handleAdd(type)} style={{
                    flex: 1, padding: "14px", borderRadius: "12px", border: "none",
                    background: color, color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer",
                  }}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CUISINES = ["Asian", "Italian", "Mediterranean", "Mexican", "American", "Indian", "Middle Eastern"];
const SORT_OPTIONS = [
  { id: "price-asc",    label: "Price low→high" },
  { id: "calories-asc", label: "Calories low→high" },
  { id: "protein-desc", label: "Protein high→low" },
  { id: "time-asc",     label: "Prep Time low→high" },
];
const PRICE_OPTIONS = [
  { id: "1", label: "$ (0–4)" },
  { id: "2", label: "$$ (4–8)" },
  { id: "3", label: "$$$ (8–12)" },
  { id: "4", label: "$$$$ (20+)" },
];
const CLOCK_OPTIONS = [
  { id: "10",  label: "Under 10 min" },
  { id: "30",  label: "10–30 min" },
  { id: "60",  label: "30–60 min" },
  { id: "999", label: "60+ min" },
];

function parseMinutes(timeStr) {
  const m = String(timeStr ?? "").match(/\d+/);
  return m ? parseInt(m[0]) : 999;
}

export default function Cookbook({ prefs, pantry, mealQueue, favorites, onAddToQueue, onToggleFavorite, myRecipes, onAddMyRecipe, krogerLocationId }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const [cuisines, setCuisines] = useState([]);
  const [favOnly, setFavOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState(null);
  const [clockFilter, setClockFilter] = useState(null);
  const [kidsFilter, setKidsFilter] = useState(() => (prefs?.kids ?? 0) > 0);
  const [sortBy, setSortBy] = useState(null);

  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const diet = (prefs?.dietary ?? []).filter(d => d !== "None").join(",");
    setLoading(true);
    searchRecipes({ diet, number: 24 })
      .then(r => { setRecipes(r); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [prefs]);

  function scoreRecipe(recipe) {
    let score = 0;
    const nameLower = recipe.name.toLowerCase();
    for (const item of pantry) {
      if (item.status === "soon" || item.status === "expired") {
        if (nameLower.includes(item.name?.toLowerCase() ?? "")) score += 3;
      }
    }
    for (const deal of WEEKLY_DEALS) {
      if (nameLower.includes(deal.name.toLowerCase())) score += 2;
    }
    // Boost kid-friendly recipes when household has kids
    if ((prefs?.kids ?? 0) > 0 && recipe.kidFriendly) score += 2;
    return score;
  }

  function applyFilters(list) {
    let result = [...list];
    if (favOnly) result = result.filter(r => favorites.some(f => f.id === r.id));
    if (cuisines.length) {
      // cuisine filter best-effort by name/tags
      result = result.filter(r => cuisines.some(c => r.name.toLowerCase().includes(c.toLowerCase())));
    }
    if (priceFilter) {
      const ranges = { "1": [0, 4], "2": [4, 8], "3": [8, 12], "4": [12, 999] };
      const [min, max] = ranges[priceFilter] ?? [0, 999];
      result = result.filter(r => {
        const pps = (r.pricePerServing ?? 0) / 100;
        return pps >= min && pps <= max;
      });
    }
    if (clockFilter) {
      const maxMin = parseInt(clockFilter);
      result = result.filter(r => {
        const mins = parseMinutes(r.time);
        if (clockFilter === "10") return mins < 10;
        if (clockFilter === "30") return mins >= 10 && mins <= 30;
        if (clockFilter === "60") return mins >= 30 && mins <= 60;
        return mins > 60;
      });
    }
    // scoring
    result = result.map(r => ({ ...r, _score: scoreRecipe(r) }));
    if (sortBy === "price-asc") result.sort((a, b) => (a.pricePerServing ?? 999) - (b.pricePerServing ?? 999));
    else if (sortBy === "calories-asc") result.sort((a, b) => (a.calories ?? 999) - (b.calories ?? 999));
    else if (sortBy === "protein-desc") result.sort((a, b) => (b.protein ?? 0) - (a.protein ?? 0));
    else if (sortBy === "time-asc") result.sort((a, b) => parseMinutes(a.time) - parseMinutes(b.time));
    else result.sort((a, b) => b._score - a._score);
    return result;
  }

  const displayed = applyFilters(recipes);

  function toggleFilter(id) {
    setActiveFilter(prev => prev === id ? null : id);
  }

  const filterDots = {
    cuisine: cuisines.length > 0,
    favorites: favOnly,
    price: !!priceFilter,
    clock: !!clockFilter,
    kids: kidsFilter,
    sort: !!sortBy,
  };

  function FilterBtn({ id, label }) {
    return (
      <button
        onClick={() => toggleFilter(id)}
        style={{
          display: "flex", alignItems: "center", gap: "4px",
          padding: "8px 14px", borderRadius: "20px",
          border: activeFilter === id ? "2px solid #3a6b2a" : "2px solid #e0e8d8",
          background: activeFilter === id ? "#eaf4e0" : "#fff",
          fontSize: "13px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
          color: activeFilter === id ? "#2d3a1e" : "#555",
        }}
      >
        {filterDots[id] && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3a6b2a", display: "inline-block" }} />}
        {label}
      </button>
    );
  }

  async function handleImport() {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportMsg("");
    try {
      const recipe = await extractRecipeFromUrl(importUrl.trim());
      onAddMyRecipe(recipe);
      setImportMsg("✅ Recipe imported!");
      setImportUrl("");
    } catch (e) {
      setImportMsg(`❌ ${e.message}`);
    } finally {
      setImporting(false);
    }
  }

  const allDisplayed = [
    ...myRecipes.map(r => ({ ...r, _isMyRecipe: true, _score: 0 })),
    ...displayed,
  ];

  return (
    <div style={{ fontFamily: "-apple-system, Arial, sans-serif", paddingBottom: "80px" }}>
      {/* Header */}
      <div style={{ padding: "20px 16px 12px", background: "#f4f6f0" }}>
        <p style={{ fontSize: "22px", fontWeight: 800, color: "#1a2e10", margin: 0 }}>
          {greeting}, Brian 👋
        </p>
        <p style={{ fontSize: "14px", color: "#888", marginTop: "2px" }}>What's cooking?</p>
      </div>

      {/* Filter bar */}
      <div style={{ overflowX: "auto", display: "flex", gap: "8px", padding: "4px 16px 12px", scrollbarWidth: "none" }}>
        <FilterBtn id="cuisine" label="🌍 Cuisine" />
        <FilterBtn id="favorites" label="⭐ Favorites" />
        <FilterBtn id="price" label="💰 Price" />
        <FilterBtn id="clock" label="⏱ Clock" />
        <FilterBtn id="kids" label="👶 Kids" />
        <FilterBtn id="sort" label="↕ Sort" />
      </div>

      {/* Filter dropdown */}
      {activeFilter && (
        <div style={{ margin: "0 16px 12px", padding: "14px", background: "#fff", borderRadius: "14px", border: "1.5px solid #e0e8d8" }}>
          {activeFilter === "cuisine" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CUISINES.map(c => (
                <button key={c} onClick={() => setCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                  style={{
                    padding: "6px 14px", borderRadius: "16px",
                    border: cuisines.includes(c) ? "2px solid #3a6b2a" : "2px solid #ddd",
                    background: cuisines.includes(c) ? "#eaf4e0" : "#fff",
                    fontSize: "13px", cursor: "pointer", fontWeight: cuisines.includes(c) ? 700 : 400,
                  }}>
                  {c}
                </button>
              ))}
            </div>
          )}
          {activeFilter === "favorites" && (
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input type="checkbox" checked={favOnly} onChange={e => setFavOnly(e.target.checked)} />
              <span style={{ fontSize: "14px" }}>Show favorites only</span>
            </label>
          )}
          {activeFilter === "price" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {PRICE_OPTIONS.map(o => (
                <button key={o.id} onClick={() => setPriceFilter(prev => prev === o.id ? null : o.id)}
                  style={{
                    padding: "6px 14px", borderRadius: "16px",
                    border: priceFilter === o.id ? "2px solid #3a6b2a" : "2px solid #ddd",
                    background: priceFilter === o.id ? "#eaf4e0" : "#fff",
                    fontSize: "13px", cursor: "pointer", fontWeight: priceFilter === o.id ? 700 : 400,
                  }}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
          {activeFilter === "clock" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CLOCK_OPTIONS.map(o => (
                <button key={o.id} onClick={() => setClockFilter(prev => prev === o.id ? null : o.id)}
                  style={{
                    padding: "6px 14px", borderRadius: "16px",
                    border: clockFilter === o.id ? "2px solid #3a6b2a" : "2px solid #ddd",
                    background: clockFilter === o.id ? "#eaf4e0" : "#fff",
                    fontSize: "13px", cursor: "pointer", fontWeight: clockFilter === o.id ? 700 : 400,
                  }}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
          {activeFilter === "kids" && (
            <div>
              {(prefs?.kids ?? 0) > 0 && (
                <div style={{ fontSize: "12px", color: "#7a5500", background: "#fff8e8", borderRadius: "8px", padding: "8px 10px", marginBottom: "10px" }}>
                  👶 Your household has {prefs.kids} kid{prefs.kids > 1 ? "s" : ""} — kid-friendly meals are boosted by default.
                </div>
              )}
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input type="checkbox" checked={kidsFilter} onChange={e => setKidsFilter(e.target.checked)} />
                <span style={{ fontSize: "14px" }}>Show kid-friendly meals only</span>
              </label>
              <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
                Kid-friendly = no stovetop or knife, appliance-only, under 40 min.
              </p>
            </div>
          )}
          {activeFilter === "sort" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {SORT_OPTIONS.map(o => (
                <button key={o.id} onClick={() => { setSortBy(prev => prev === o.id ? null : o.id); setActiveFilter(null); }}
                  style={{
                    padding: "10px 14px", borderRadius: "10px", textAlign: "left",
                    border: sortBy === o.id ? "2px solid #3a6b2a" : "2px solid #ddd",
                    background: sortBy === o.id ? "#eaf4e0" : "#fff",
                    fontSize: "14px", cursor: "pointer", fontWeight: sortBy === o.id ? 700 : 400,
                  }}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recipe grid */}
      <div style={{ padding: "0 16px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🍳</div>
            <p>Finding great recipes…</p>
          </div>
        )}
        {error && (
          <div style={{ padding: "16px", background: "#fee2e2", borderRadius: "12px", color: "#991b1b", fontSize: "13px" }}>
            {error}
          </div>
        )}
        {!loading && !error && (
          <>
            {myRecipes.length > 0 && (
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1a2e10", margin: "0 0 12px" }}>My Recipes</h3>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {allDisplayed.map(recipe => {
                const score = recipe._score ?? scoreRecipe(recipe);
                const isFav = favorites.some(f => f.id === recipe.id);
                const hasExpiring = pantry.some(p => (p.status === "soon" || p.status === "expired") && recipe.name.toLowerCase().includes((p.name ?? "").toLowerCase()));
                const hasDeals = WEEKLY_DEALS.some(d => recipe.name.toLowerCase().includes(d.name.toLowerCase()));
                return (
                  <div
                    key={recipe.id}
                    onClick={() => setSelected(recipe)}
                    style={{
                      background: "#fff", borderRadius: "14px", overflow: "hidden",
                      boxShadow: "0 1px 6px rgba(0,0,0,0.08)", cursor: "pointer", position: "relative",
                    }}
                  >
                    {recipe.image ? (
                      <img src={recipe.image} alt={recipe.name} style={{ width: "100%", height: "120px", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "120px", background: "#eaf4e0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>🍽️</div>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); onToggleFavorite(recipe); }}
                      style={{
                        position: "absolute", top: "8px", right: "8px",
                        background: "rgba(255,255,255,0.85)", border: "none",
                        borderRadius: "50%", width: "28px", height: "28px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "14px", cursor: "pointer",
                      }}
                    >
                      {isFav ? "❤️" : "🤍"}
                    </button>
                    {recipe._isMyRecipe && (
                      <span style={{
                        position: "absolute", top: "8px", left: "8px",
                        background: "#3a6b2a", color: "#fff", borderRadius: "8px",
                        fontSize: "9px", fontWeight: 700, padding: "2px 6px",
                      }}>My Recipe</span>
                    )}
                    <div style={{ padding: "8px" }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#1a2e10", margin: "0 0 4px", lineHeight: 1.3 }}>
                        {recipe.name}
                      </p>
                      <div style={{ display: "flex", gap: "8px", fontSize: "11px", color: "#888", marginBottom: "4px" }}>
                        <span>⏱ {recipe.time}</span>
                        <span>👤 {recipe.servings}</span>
                      </div>
                      {recipe.pricePerServing && (
                        <p style={{ fontSize: "12px", color: "#3a6b2a", fontWeight: 700, margin: "0 0 4px" }}>
                          ${(recipe.pricePerServing / 100).toFixed(2)}/serving
                        </p>
                      )}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {hasExpiring && (
                          <span style={{ fontSize: "10px", background: "#fff7ed", color: "#c2410c", borderRadius: "6px", padding: "2px 6px", fontWeight: 600 }}>
                            🥕 Expiring items
                          </span>
                        )}
                        {hasDeals && (
                          <span style={{ fontSize: "10px", background: "#f0fdf4", color: "#15803d", borderRadius: "6px", padding: "2px 6px", fontWeight: 600 }}>
                            💸 On sale
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Import recipe */}
      <div style={{ margin: "24px 16px 0", padding: "16px", background: "#fff", borderRadius: "14px", border: "1.5px solid #e0e8d8" }}>
        <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a2e10", marginBottom: "10px" }}>Import a Recipe</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={importUrl}
            onChange={e => setImportUrl(e.target.value)}
            placeholder="Paste recipe URL…"
            style={{ flex: 1, padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #ddd", fontSize: "13px", outline: "none" }}
          />
          <button
            onClick={handleImport}
            disabled={importing}
            style={{
              padding: "10px 14px", background: "#3a6b2a", color: "#fff",
              border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer",
            }}
          >
            {importing ? "…" : "Import"}
          </button>
        </div>
        {importMsg && <p style={{ marginTop: "8px", fontSize: "13px", color: importMsg.startsWith("✅") ? "#15803d" : "#dc2626" }}>{importMsg}</p>}
      </div>

      {/* Detail sheet */}
      {selected && (
        <RecipeDetailSheet
          recipe={selected}
          favorites={favorites}
          onClose={() => setSelected(null)}
          onAddToQueue={onAddToQueue}
          onToggleFavorite={onToggleFavorite}
          krogerLocationId={krogerLocationId}
        />
      )}
    </div>
  );
}
