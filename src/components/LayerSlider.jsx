const TIER_ICONS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];

export default function LayerSlider({ value, onChange }) {
  return (
    <div style={{ background: "var(--white,#fff)", borderRadius: 14, padding: "16px 16px 12px", border: "1.5px solid var(--border,#F0DFD0)", boxShadow: "0 1px 4px rgba(45,31,14,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text,#2D1F0E)" }}>
          Number of Tiers
        </span>
        <span style={{
          fontSize: 13, fontWeight: 800,
          color: "var(--white,#fff)",
          background: "var(--amber,#C97B3A)",
          borderRadius: 20,
          padding: "3px 12px",
          boxShadow: "0 2px 8px rgba(201,123,58,0.3)",
        }}>
          {value} {value === 1 ? "tier" : "tiers"}
        </span>
      </div>

      {/* Visual tier selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              flex: 1,
              padding: "10px 4px",
              borderRadius: 10,
              border: value === n ? "2px solid var(--amber,#C97B3A)" : "2px solid var(--border,#F0DFD0)",
              background: value === n ? "var(--amber-light,#FDF3E7)" : "var(--cream,#FFF8F2)",
              cursor: "pointer",
              fontSize: 18,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}
          >
            <span>{TIER_ICONS[n - 1]}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: value === n ? "var(--amber,#C97B3A)" : "var(--text-light,#BBA890)" }}>
              {n}
            </span>
          </button>
        ))}
      </div>

      <input
        type="range"
        min={1} max={4} step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--amber,#C97B3A)" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {[1,2,3,4].map(n => (
          <span key={n} style={{ fontSize: 10, color: "var(--text-light,#BBA890)", fontWeight: 500 }}>{n}</span>
        ))}
      </div>
    </div>
  );
}