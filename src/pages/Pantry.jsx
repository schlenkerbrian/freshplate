import { useState } from "react";

const STATUS_COLOR = { expired: "#dc2626", soon: "#d97706", ok: "#16a34a" };
const STATUS_BG    = { expired: "#fee2e2", soon: "#fff7ed", ok: "#f0fdf4" };
const STATUS_LABEL = { expired: "Expired", soon: "Expiring soon", ok: "Good" };
const STATUS_ORDER = { expired: 0, soon: 1, ok: 2 };

const ITEM_EMOJIS = {
  chicken: "🍗", beef: "🥩", pork: "🥩", fish: "🐟", shrimp: "🍤",
  egg: "🥚", milk: "🥛", cheese: "🧀", butter: "🧈", yogurt: "🫙",
  bread: "🍞", rice: "🍚", pasta: "🍝", potato: "🥔", tomato: "🍅",
  onion: "🧅", garlic: "🧄", carrot: "🥕", broccoli: "🥦", spinach: "🥬",
  apple: "🍎", banana: "🍌", lemon: "🍋", lime: "🍋", orange: "🍊",
  oil: "🛢️", salt: "🧂", pepper: "🌶️",
};

function getEmoji(name) {
  const lower = (name ?? "").toLowerCase();
  for (const [key, emoji] of Object.entries(ITEM_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return "🛒";
}

export default function Pantry({ pantry, onAdd, onRemove }) {
  const [inputVal, setInputVal] = useState("");

  function handleAdd() {
    const name = inputVal.trim();
    if (!name) return;
    onAdd([{
      id: crypto.randomUUID(),
      name,
      emoji: getEmoji(name),
      qty: 1,
      unit: "item",
      status: "ok",
      expiry: "Unknown",
      datePurchased: new Date().toISOString().split("T")[0],
    }]);
    setInputVal("");
  }

  const sorted = [...pantry].sort((a, b) => (STATUS_ORDER[a.status] ?? 2) - (STATUS_ORDER[b.status] ?? 2));

  return (
    <div style={{ fontFamily: "-apple-system, Arial, sans-serif", paddingBottom: "80px" }}>
      <div style={{ padding: "20px 16px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1a2e10", margin: 0 }}>🍞 My Pantry</h1>
          <p style={{ color: "#888", fontSize: "13px", marginTop: "2px" }}>{pantry.length} item{pantry.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", padding: "0 16px 16px" }}>
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Add an item…"
          style={{
            flex: 1, padding: "12px 14px", borderRadius: "12px",
            border: "1.5px solid #ddd", fontSize: "14px", outline: "none", background: "#fff",
          }}
        />
        <button onClick={handleAdd} style={{
          padding: "12px 16px", background: "#3a6b2a", color: "#fff",
          border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer",
        }}>Add</button>
        <button style={{
          padding: "12px 14px", background: "#fff",
          border: "1.5px solid #ddd", borderRadius: "12px",
          fontSize: "18px", cursor: "pointer",
        }}>📷</button>
      </div>

      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🍽️</div>
          <p>Your pantry is empty.</p>
          <p style={{ fontSize: "13px" }}>Add items or send your grocery list here.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "0 16px" }}>
          {sorted.map(item => {
            const color = STATUS_COLOR[item.status] ?? STATUS_COLOR.ok;
            const bg    = STATUS_BG[item.status]    ?? STATUS_BG.ok;
            return (
              <div key={String(item.id)} style={{
                background: "#fff", borderRadius: "14px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                overflow: "hidden", position: "relative",
              }}>
                <div style={{ height: "6px", background: color }} />
                <button
                  onClick={() => onRemove(item.id)}
                  style={{
                    position: "absolute", top: "10px", right: "8px",
                    background: "none", border: "none", fontSize: "16px",
                    cursor: "pointer", color: "#ccc", lineHeight: 1,
                  }}
                >×</button>
                <div style={{ padding: "12px 10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: "36px", marginBottom: "6px" }}>{item.emoji ?? getEmoji(item.name)}</div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#1a2e10", margin: "0 0 2px" }}>{item.name}</p>
                  <p style={{ fontSize: "12px", color: "#888", margin: "0 0 6px" }}>{item.qty} {item.unit}</p>
                  <span style={{ fontSize: "11px", fontWeight: 700, color, background: bg, borderRadius: "8px", padding: "3px 8px" }}>
                    {STATUS_LABEL[item.status] ?? "Good"}
                  </span>
                  {item.expiry && item.expiry !== "Unknown" && (
                    <p style={{ fontSize: "11px", color, margin: "4px 0 0" }}>Exp: {item.expiry}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
