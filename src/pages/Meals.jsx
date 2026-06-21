import { useState } from "react";
import { getRecipeDetails } from "../spoonacular";

const MEAL_COLORS = {
  Dinner: "#3b82f6",
  Lunch: "#22c55e",
  Breakfast: "#eab308",
};

function MakeModal({ item, pantry, onClose, onCooked }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useState(() => {
    getRecipeDetails(item.recipe.id)
      .then(d => { setDetails(d); setLoading(false); })
      .catch(() => setLoading(false));
  });

  const pantryNames = pantry.map(p => (p.name ?? "").toLowerCase());

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400, background: "#fff", overflowY: "auto", fontFamily: "-apple-system, Arial, sans-serif" }}>
      <div style={{ position: "relative" }}>
        {item.recipe.image ? (
          <img src={item.recipe.image} alt={item.recipe.name} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "200px", background: "#2d3a1e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>🍽️</div>
        )}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
          padding: "40px 16px 16px",
        }}>
          <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: 800, margin: 0 }}>{item.recipe.name}</h2>
        </div>
        <button onClick={onClose} style={{
          position: "absolute", top: "16px", left: "16px",
          background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%",
          width: "34px", height: "34px", color: "#fff", fontSize: "18px", cursor: "pointer",
        }}>←</button>
      </div>

      <div style={{ padding: "16px" }}>
        {loading ? (
          <p style={{ color: "#888", textAlign: "center" }}>Loading recipe…</p>
        ) : (
          <>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1a2e10", marginBottom: "10px" }}>Ingredients</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
              {(details?.ingredients ?? []).map((ing, i) => {
                const inPantry = pantryNames.some(p => p.includes(ing.name?.toLowerCase() ?? ""));
                return (
                  <span key={i} style={{
                    padding: "5px 10px",
                    background: inPantry ? "#eaf4e0" : "#fff7ed",
                    color: inPantry ? "#15803d" : "#c2410c",
                    border: `1.5px solid ${inPantry ? "#bbf7d0" : "#fed7aa"}`,
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}>
                    {ing.amount} {ing.unit} {ing.name}
                  </span>
                );
              })}
            </div>
            {details?.ingredients?.some(ing => !pantryNames.some(p => p.includes(ing.name?.toLowerCase() ?? ""))) && (
              <p style={{ fontSize: "12px", color: "#888", marginBottom: "16px" }}>
                🟠 Orange items are not in your pantry — add to grocery list before cooking.
              </p>
            )}

            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1a2e10", marginBottom: "10px" }}>Instructions</h3>
            {details?.instructions?.length ? (
              <ol style={{ paddingLeft: "18px", margin: 0, display: "flex", flexDirection: "column", gap: "12px", marginBottom: "100px" }}>
                {details.instructions.map((step, i) => (
                  <li key={i} style={{ fontSize: "14px", lineHeight: 1.6, color: "#333" }}>
                    {typeof step === "string" ? step : step.step}
                  </li>
                ))}
              </ol>
            ) : (
              <p style={{ color: "#888", fontSize: "13px", marginBottom: "100px" }}>No instructions available.</p>
            )}
          </>
        )}
      </div>

      {/* Sticky bottom buttons */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: "430px",
        background: "#fff", padding: "12px 16px 24px",
        borderTop: "1px solid #e0e8d8", display: "flex", flexDirection: "column", gap: "10px",
      }}>
        <button onClick={onClose} style={{
          padding: "14px", borderRadius: "12px",
          border: "2px solid #3a6b2a", background: "#fff",
          color: "#3a6b2a", fontWeight: 700, fontSize: "15px", cursor: "pointer",
        }}>
          Did Not Make Meal
        </button>
        <button onClick={() => { onCooked(item); onClose(); }} style={{
          padding: "14px", borderRadius: "12px", border: "none",
          background: "#3a6b2a", color: "#fff", fontWeight: 700, fontSize: "15px", cursor: "pointer",
        }}>
          Cooked Meal ✓
        </button>
      </div>
    </div>
  );
}

export default function Meals({ mealQueue, pantry, onRemoveFromQueue, onSendToGrocery, onCookedMeal, groceryList }) {
  const [makingItem, setMakingItem] = useState(null);
  const [sending, setSending] = useState(false);

  const sections = [
    { type: "Dinner", color: "#3b82f6" },
    { type: "Lunch",  color: "#22c55e" },
    { type: "Breakfast", color: "#eab308" },
  ];

  async function handleSendToGrocery() {
    setSending(true);
    await onSendToGrocery();
    setSending(false);
  }

  if (mealQueue.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: "12px", fontFamily: "-apple-system, Arial, sans-serif" }}>
        <span style={{ fontSize: "56px" }}>🍽️</span>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1a2e10", margin: 0 }}>No meals planned yet</h2>
        <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Browse the Cookbook to add meals</p>
      </div>
    );
  }

  const totalIngredients = mealQueue.reduce((acc, q) => acc + 4, 0); // rough estimate

  return (
    <div style={{ fontFamily: "-apple-system, Arial, sans-serif", paddingBottom: "140px" }}>
      <div style={{ padding: "20px 16px 12px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1a2e10", margin: 0 }}>Meal Plan</h1>
        <p style={{ color: "#888", fontSize: "14px", marginTop: "2px" }}>{mealQueue.length} meal{mealQueue.length !== 1 ? "s" : ""} queued</p>
      </div>

      {sections.map(({ type, color }) => {
        const items = mealQueue.filter(q => q.mealType === type);
        if (items.length === 0) return null;
        return (
          <div key={type} style={{ margin: "0 16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color }} />
              <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#1a2e10", margin: 0 }}>{type}</h2>
              <span style={{
                background: color, color: "#fff", borderRadius: "10px",
                fontSize: "11px", fontWeight: 700, padding: "1px 7px",
              }}>{items.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {items.map(item => (
                <div key={item.id} style={{
                  background: "#fff", borderRadius: "14px",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
                  borderLeft: `4px solid ${color}`,
                  padding: "12px",
                  display: "flex", alignItems: "center", gap: "12px",
                  position: "relative",
                }}>
                  {item.recipe.image ? (
                    <img src={item.recipe.image} alt={item.recipe.name} style={{ width: "56px", height: "56px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: "56px", height: "56px", borderRadius: "10px", background: "#eaf4e0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>🍽️</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a2e10", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.recipe.name}</p>
                    <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#888" }}>
                      <span>⏱ {item.recipe.time}</span>
                      {item.recipe.pricePerServing && <span>${(item.recipe.pricePerServing / 100).toFixed(2)}/serving</span>}
                    </div>
                    <button onClick={() => setMakingItem(item)} style={{
                      marginTop: "8px", padding: "5px 12px",
                      background: "#eaf4e0", border: "none", borderRadius: "8px",
                      color: "#3a6b2a", fontWeight: 700, fontSize: "12px", cursor: "pointer",
                    }}>
                      🍳 Make
                    </button>
                  </div>
                  <button
                    onClick={() => onRemoveFromQueue(item.id)}
                    style={{
                      position: "absolute", top: "8px", right: "8px",
                      background: "none", border: "none", fontSize: "18px",
                      cursor: "pointer", color: "#bbb", lineHeight: 1,
                    }}
                  >×</button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Send to grocery fixed button */}
      <div style={{
        position: "fixed", bottom: "65px", left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: "430px", padding: "10px 16px",
        background: "linear-gradient(transparent, #f4f6f0 40%)",
      }}>
        <button
          onClick={handleSendToGrocery}
          disabled={sending}
          style={{
            width: "100%", padding: "16px",
            background: sending ? "#a0c48a" : "#3a6b2a",
            color: "#fff", border: "none", borderRadius: "14px",
            fontSize: "16px", fontWeight: 700, cursor: sending ? "not-allowed" : "pointer",
          }}
        >
          {sending ? "Building list…" : `Send to Grocery List 🛒`}
        </button>
      </div>

      {makingItem && (
        <MakeModal
          item={makingItem}
          pantry={pantry}
          onClose={() => setMakingItem(null)}
          onCooked={onCookedMeal}
        />
      )}
    </div>
  );
}
