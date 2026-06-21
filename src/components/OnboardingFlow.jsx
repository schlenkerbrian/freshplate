import { useState } from "react";
import { ALL_STORES } from "../groceryStores";

const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo", "Halal", "Kosher", "None"];
const GOAL_OPTIONS = ["Lose Weight", "Build Muscle", "Eat Healthier", "Save Money", "Reduce Food Waste"];
const HOUSEHOLD_OPTIONS = [
  { label: "Just Me", value: 1 },
  { label: "2 People", value: 2 },
  { label: "3–4 People", value: 3 },
  { label: "5+ People", value: 5 },
];
const QUICK_AVOID = ["Peanuts", "Shellfish", "Mushrooms", "Gluten", "Soy", "Tree Nuts"];
const EQUIPMENT_OPTIONS = ["Stovetop", "Oven", "Air Fryer", "Instant Pot", "Blender", "Microwave", "Rice Cooker", "Grill"];

const BtnPrimary = ({ children, onClick, style = {} }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      padding: "16px",
      background: "#3a6b2a",
      color: "#fff",
      border: "none",
      borderRadius: "14px",
      fontSize: "16px",
      fontWeight: 700,
      cursor: "pointer",
      ...style,
    }}
  >
    {children}
  </button>
);

const Chip = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "8px 16px",
      borderRadius: "20px",
      border: selected ? "2px solid #3a6b2a" : "2px solid #ddd",
      background: selected ? "#eaf4e0" : "#fff",
      color: selected ? "#2d3a1e" : "#666",
      fontSize: "14px",
      fontWeight: selected ? 700 : 400,
      cursor: "pointer",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </button>
);

function ProgressDots({ step, total }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "32px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: "8px",
            width: i === step ? "24px" : "8px",
            borderRadius: "4px",
            background: i === step ? "#3a6b2a" : "#ccc",
            transition: "width 0.2s, background 0.2s",
          }}
        />
      ))}
    </div>
  );
}

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [dietary, setDietary] = useState([]);
  const [goals, setGoals] = useState([]);
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [avoid, setAvoid] = useState([]);
  const [avoidInput, setAvoidInput] = useState("");
  const [equipment, setEquipment] = useState([]);
  const [stores, setStores] = useState([]);
  const [zipCode, setZipCode] = useState("");

  function toggleArr(arr, setArr, val) {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  }

  function addAvoid(val) {
    const trimmed = val.trim();
    if (trimmed && !avoid.includes(trimmed)) setAvoid(prev => [...prev, trimmed]);
  }

  function handleComplete() {
    onComplete({ dietary, goals, adults, kids, servings: adults + kids, avoid, equipment, stores, zipCode: zipCode.trim() || null });
  }

  const stepContent = [
    // Step 0: Dietary
    <div key="dietary">
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1a2e10", marginBottom: "8px" }}>
        Dietary Restrictions
      </h2>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>
        Select all that apply
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "32px" }}>
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
      <BtnPrimary onClick={() => setStep(1)}>Continue →</BtnPrimary>
    </div>,

    // Step 1: Goals
    <div key="goals">
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1a2e10", marginBottom: "8px" }}>
        Health Goals
      </h2>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>
        What are you working toward?
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "32px" }}>
        {GOAL_OPTIONS.map(opt => (
          <Chip
            key={opt}
            label={opt}
            selected={goals.includes(opt)}
            onClick={() => toggleArr(goals, setGoals, opt)}
          />
        ))}
      </div>
      <BtnPrimary onClick={() => setStep(2)}>Continue →</BtnPrimary>
    </div>,

    // Step 2: Household size
    <div key="household">
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1a2e10", marginBottom: "8px" }}>
        Household Size
      </h2>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "28px" }}>
        How many people are you cooking for?
      </p>

      {[{ label: "Adults", emoji: "🧑", value: adults, set: setAdults },
        { label: "Kids",   emoji: "👶", value: kids,   set: setKids   }].map(row => (
        <div key={row.label} style={{
          background: "#fff", borderRadius: "14px", padding: "18px 20px",
          marginBottom: "14px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "28px" }}>{row.emoji}</span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#1a2e10" }}>{row.label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => row.set(v => Math.max(row.label === "Adults" ? 1 : 0, v - 1))}
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                border: "2px solid #d0ddc8", background: "#fff",
                fontSize: "20px", fontWeight: 700, color: "#3a6b2a",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >−</button>
            <span style={{ fontSize: "22px", fontWeight: 800, color: "#1a2e10", minWidth: "24px", textAlign: "center" }}>
              {row.value}
            </span>
            <button
              onClick={() => row.set(v => Math.min(10, v + 1))}
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                border: "none", background: "#3a6b2a",
                fontSize: "20px", fontWeight: 700, color: "#fff",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >+</button>
          </div>
        </div>
      ))}

      {kids > 0 && (
        <div style={{
          background: "#fff8e8", border: "1px solid #f5c842",
          borderRadius: "12px", padding: "12px 16px", marginBottom: "20px",
          fontSize: "13px", color: "#7a5500",
        }}>
          👶 Kid-friendly meal options will be included in your suggestions.
        </div>
      )}

      <div style={{ marginBottom: "32px" }} />
      <BtnPrimary onClick={() => setStep(3)}>Continue →</BtnPrimary>
    </div>,

    // Step 3: Foods to avoid
    <div key="avoid">
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1a2e10", marginBottom: "8px" }}>
        Foods to Avoid
      </h2>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "16px" }}>
        Allergies or foods you don't enjoy
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          value={avoidInput}
          onChange={e => setAvoidInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") { addAvoid(avoidInput); setAvoidInput(""); }
          }}
          placeholder="Type an ingredient..."
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1.5px solid #ddd",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <button
          onClick={() => { addAvoid(avoidInput); setAvoidInput(""); }}
          style={{
            padding: "12px 16px",
            background: "#3a6b2a",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>
      <p style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>Quick add:</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {QUICK_AVOID.map(opt => (
          <Chip
            key={opt}
            label={opt}
            selected={avoid.includes(opt)}
            onClick={() => toggleArr(avoid, setAvoid, opt)}
          />
        ))}
      </div>
      {avoid.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
          {avoid.map(item => (
            <span
              key={item}
              style={{
                padding: "6px 12px",
                background: "#fee2e2",
                color: "#991b1b",
                borderRadius: "20px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {item}
              <button
                onClick={() => setAvoid(prev => prev.filter(v => v !== item))}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#991b1b", fontSize: "14px" }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <BtnPrimary onClick={() => setStep(4)}>Continue →</BtnPrimary>
    </div>,

    // Step 4: Equipment + Stores
    <div key="equipment">
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1a2e10", marginBottom: "8px" }}>
        Kitchen & Stores
      </h2>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "20px" }}>
        What do you have to cook with?
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "28px" }}>
        {EQUIPMENT_OPTIONS.map(opt => (
          <Chip
            key={opt}
            label={opt}
            selected={equipment.includes(opt)}
            onClick={() => toggleArr(equipment, setEquipment, opt)}
          />
        ))}
      </div>
      <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a2e10", marginBottom: "12px" }}>
        Where do you shop?
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "32px" }}>
        {ALL_STORES.map(store => (
          <Chip
            key={store.id}
            label={`${store.logo} ${store.name}`}
            selected={stores.includes(store.id)}
            onClick={() => toggleArr(stores, setStores, store.id)}
          />
        ))}
      </div>
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a2e10", marginBottom: "8px" }}>
          📍 Zip Code <span style={{ fontWeight: 400, color: "#888" }}>(for nearby store locations & live prices)</span>
        </p>
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={zipCode}
          onChange={e => setZipCode(e.target.value.replace(/\D/g, ""))}
          placeholder="e.g. 30301"
          style={{
            width: "100%", padding: "12px 14px", borderRadius: "10px",
            border: "1.5px solid #ddd", fontSize: "16px", outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>
      <BtnPrimary onClick={handleComplete}>Let's Cook! 🎉</BtnPrimary>
    </div>,
  ];

  return (
    <div style={{ padding: "48px 24px 32px", fontFamily: "-apple-system, Arial, sans-serif", minHeight: "100vh", background: "#f4f6f0" }}>
      <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", padding: 0, color: "#3a6b2a" }}
          >
            ←
          </button>
        )}
        <div style={{ fontSize: "13px", color: "#888" }}>Step {step + 1} of 5</div>
      </div>
      <ProgressDots step={step} total={5} />
      {stepContent[step]}
    </div>
  );
}
