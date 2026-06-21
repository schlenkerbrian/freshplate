export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: "cookbook", label: "Cookbook", icon: "📖" },
    { id: "meals",    label: "Meals",    icon: "🍽️" },
    { id: "grocery",  label: "Grocery",  icon: "🧾" },
    { id: "pantry",   label: "Pantry",   icon: "🍞" },
    { id: "deals",    label: "Deals",    icon: "🏷️" },
    { id: "profile",  label: "Profile",  icon: "👤" },
  ];

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: "430px",
      background: "#fff",
      borderTop: "1px solid #e0e8d8",
      zIndex: 100,
      height: "65px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      padding: "0 4px",
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              background: isActive ? "#eaf4e0" : "transparent",
              border: "none",
              borderRadius: "16px",
              padding: "6px 10px",
              cursor: "pointer",
              minWidth: "56px",
            }}
          >
            <span style={{ fontSize: "20px", lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontSize: "10px",
              fontWeight: isActive ? 700 : 400,
              color: isActive ? "#3a6b2a" : "#aaa",
              letterSpacing: "0.01em",
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
