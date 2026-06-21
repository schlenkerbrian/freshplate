import { useState } from "react";
import { ALL_STORES } from "../groceryStores";

const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo", "Halal", "Kosher", "None"];
const GOAL_OPTIONS    = ["Lose Weight", "Build Muscle", "Eat Healthier", "Save Money", "Reduce Food Waste"];
const EQUIPMENT_OPTIONS = ["Stovetop", "Oven", "Air Fryer", "Instant Pot", "Blender", "Microwave", "Rice Cooker", "Grill"];
const QUICK_AVOID = ["Peanuts", "Shellfish", "Mushrooms", "Gluten", "Soy", "Tree Nuts"];

const Chip = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "7px 14px", borderRadius: "20px",
      border: selected ? "2px solid #3a6b2a" : "2px solid #ddd",
      background: selected ? "#eaf4e0" : "#fff",
      color: selected ? "#2d3a1e" : "#666",
      fontSize: "13px", fontWeight: selected ? 700 : 400,
      cursor: "pointer", whiteSpace: "nowrap",
    }}
  >
    {label}
  </button>
);

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <p style={{
        fontSize: "11px", fontWeight: 700, color: "#888",
        textTransform: "uppercase", letterSpacing: "0.07em",
        marginBottom: "10px",
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function SaveBanner({ show }) {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)",
      background: "#3a6b2a", color: "#fff", borderRadius: "12px",
      padding: "10px 20px", fontSize: "14px", fontWeight: 700,
      zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    }}>
      ✓ Preferences saved
    </div>
  );
}

export default function Profile({ prefs, onUpdatePrefs, favorites, myRecipes, onRemoveMyRecipe }) {
  const [dietary,   setDietary]   = useState(prefs?.dietary   ?? []);
  const [goals,     setGoals]     = useState(prefs?.goals      ?? []);
  const [equipment, setEquipment] = useState(prefs?.equipment  ?? []);
  const [stores,    setStores]    = useState(prefs?.stores     ?? []);
  const [zipCode,   setZipCode]   = useState(prefs?.zipCode    ?? "");
  const [avoid,     setAvoid]     = useState(prefs?.avoid      ?? []);
  const [avoidInput, setAvoidInput] = useState("");
  const [adults,    setAdults]    = useState(prefs?.adults     ?? 2);
  const [kids,      setKids]      = useState(prefs?.kids       ?? 0);
  const [saved,     setSaved]     = useState(false);
  const [activeSection, setActiveSection] = useState("preferences");

  function toggleArr(arr, setArr, val) {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  }

  function addAvoid(val) {
    const trimmed = val.trim();
    if (trimmed && !avoid.includes(trimmed)) setAvoid(prev => [...prev, trimmed]);
  }

  function handleSave() {
    onUpdatePrefs({
      ...prefs,
      dietary, goals, equipment, stores, avoid,
      adults, kids, servings: adults + kids,
      zipCode: zipCode.trim() || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const TAB_STYLE = (active) => ({
    flex: 1, padding: "10px 0", background: "none", border: "none",
    borderBottom: active ? "2px solid #3a6b2a" : "2px solid transparent",
    fontWeight: active ? 700 : 400,
    color: active ? "#3a6b2a" : "#888",
    fontSize: "13px", cursor: "pointer",
  });

  return (
    <div style={{ fontFamily: "-apple-system, Arial, sans-serif", paddingBottom: "80px" }}>
      <SaveBanner show={saved} />

      {/* Header */}
      <div style={{ padding: "20px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "#eaf4e0", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "28px",
          }}>
            👤
          </div>
          <div>
            <p style={{ fontSize: "18px", fontWeight: 800, color: "#1a2e10", margin: 0 }}>My Profile</p>
            <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
              {stores.length} store{stores.length !== 1 ? "s" : ""} · {dietary.length || "No"} dietary restrictions
            </p>
          </div>
        </div>

        {/* Section tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e0e8d8" }}>
          {[
            { id: "preferences", label: "Preferences" },
            { id: "favorites",   label: `Favorites (${favorites.length})` },
            { id: "myrecipes",   label: `My Recipes (${myRecipes.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveSection(t.id)} style={TAB_STYLE(activeSection === t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preferences tab */}
      {activeSection === "preferences" && (
        <div style={{ padding: "20px 16px 0" }}>

          <Section title="Dietary Restrictions">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {DIETARY_OPTIONS.map(opt => (
                <Chip
                  key={opt}
                  label={opt}
                  selected={dietary.includes(opt)}
                  onClick={() => {
                    if (opt === "None") {
                      setDietary(dietary.includes("None") ? [] : ["None"]);
                    } else {
                      toggleArr(dietary, setDietary, opt);
                      setDietary(prev => prev.filter(v => v !== "None"));
                    }
                  }}
                />
              ))}
            </div>
          </Section>

          <Section title="Foods to Avoid">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
              {QUICK_AVOID.map(opt => (
                <Chip key={opt} label={opt} selected={avoid.includes(opt)} onClick={() => toggleArr(avoid, setAvoid, opt)} />
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input
                value={avoidInput}
                onChange={e => setAvoidInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { addAvoid(avoidInput); setAvoidInput(""); } }}
                placeholder="Add ingredient to avoid…"
                style={{ flex: 1, padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #ddd", fontSize: "14px", outline: "none" }}
              />
              <button onClick={() => { addAvoid(avoidInput); setAvoidInput(""); }}
                style={{ padding: "10px 14px", background: "#3a6b2a", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}>
                Add
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {avoid.filter(a => !QUICK_AVOID.includes(a)).map(item => (
                <span key={item} style={{ padding: "5px 10px", background: "#fee2e2", color: "#991b1b", borderRadius: "16px", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
                  {item}
                  <button onClick={() => setAvoid(prev => prev.filter(v => v !== item))}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#991b1b", fontSize: "14px" }}>×</button>
                </span>
              ))}
            </div>
          </Section>

          <Section title="Health Goals">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {GOAL_OPTIONS.map(opt => (
                <Chip key={opt} label={opt} selected={goals.includes(opt)} onClick={() => toggleArr(goals, setGoals, opt)} />
              ))}
            </div>
          </Section>

          <Section title="Household Size">
            {[
              { label: "Adults", emoji: "🧑", value: adults, set: setAdults, min: 1 },
              { label: "Kids",   emoji: "👶", value: kids,   set: setKids,   min: 0 },
            ].map(row => (
              <div key={row.label} style={{
                background: "#fff", borderRadius: "12px", padding: "14px 16px",
                marginBottom: "10px", border: "1.5px solid #e0e8d8",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "24px" }}>{row.emoji}</span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#1a2e10" }}>{row.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <button onClick={() => row.set(v => Math.max(row.min, v - 1))}
                    style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid #d0ddc8", background: "#fff", fontSize: "18px", fontWeight: 700, color: "#3a6b2a", cursor: "pointer" }}>
                    −
                  </button>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "#1a2e10", minWidth: "20px", textAlign: "center" }}>{row.value}</span>
                  <button onClick={() => row.set(v => Math.min(10, v + 1))}
                    style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "#3a6b2a", fontSize: "18px", fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </Section>

          <Section title="Kitchen Equipment">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {EQUIPMENT_OPTIONS.map(opt => (
                <Chip key={opt} label={opt} selected={equipment.includes(opt)} onClick={() => toggleArr(equipment, setEquipment, opt)} />
              ))}
            </div>
          </Section>

          <Section title="Grocery Stores">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
              {ALL_STORES.map(store => (
                <Chip
                  key={store.id}
                  label={`${store.logo} ${store.name}`}
                  selected={stores.includes(store.id)}
                  onClick={() => toggleArr(stores, setStores, store.id)}
                />
              ))}
            </div>
            <div style={{ marginTop: "12px" }}>
              <p style={{ fontSize: "13px", color: "#555", marginBottom: "6px" }}>
                📍 Zip Code <span style={{ color: "#888" }}>(for nearby store locations & live prices)</span>
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={zipCode}
                onChange={e => setZipCode(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 30301"
                style={{ width: "140px", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #ddd", fontSize: "16px", outline: "none" }}
              />
            </div>
          </Section>

          <button onClick={handleSave} style={{
            width: "100%", padding: "16px", background: "#3a6b2a", color: "#fff",
            border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 700,
            cursor: "pointer", marginTop: "8px",
          }}>
            Save Preferences
          </button>
        </div>
      )}

      {/* Favorites tab */}
      {activeSection === "favorites" && (
        <div style={{ padding: "16px" }}>
          {favorites.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>❤️</div>
              <p style={{ fontWeight: 700, color: "#1a2e10" }}>No favorites yet</p>
              <p style={{ fontSize: "13px" }}>Heart recipes in the Cookbook to save them here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {favorites.map(recipe => (
                <div key={recipe.id} style={{
                  background: "#fff", borderRadius: "14px", padding: "12px",
                  border: "1.5px solid #e0e8d8", display: "flex", gap: "12px", alignItems: "center",
                }}>
                  {recipe.image && (
                    <img src={recipe.image} alt={recipe.name} style={{ width: "56px", height: "56px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a2e10", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {recipe.name}
                    </p>
                    <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
                      {recipe.time} · {recipe.servings} servings
                    </p>
                  </div>
                  <span style={{ fontSize: "18px" }}>❤️</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Recipes tab */}
      {activeSection === "myrecipes" && (
        <div style={{ padding: "16px" }}>
          {myRecipes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📝</div>
              <p style={{ fontWeight: 700, color: "#1a2e10" }}>No recipes added yet</p>
              <p style={{ fontSize: "13px" }}>Add recipes from a URL in the Cookbook tab.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {myRecipes.map(recipe => (
                <div key={recipe.id} style={{
                  background: "#fff", borderRadius: "14px", padding: "12px",
                  border: "1.5px solid #e0e8d8", display: "flex", gap: "12px", alignItems: "center",
                }}>
                  {recipe.image && (
                    <img src={recipe.image} alt={recipe.name} style={{ width: "56px", height: "56px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a2e10", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {recipe.name}
                    </p>
                    {recipe.sourceUrl && (
                      <p style={{ fontSize: "11px", color: "#888", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {recipe.sourceUrl}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveMyRecipe(recipe.id)}
                    style={{ background: "#fee2e2", border: "none", borderRadius: "8px", padding: "6px 10px", color: "#991b1b", fontSize: "12px", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
