const PRESETS = [
  "#FFFFFF", "#FFF5E6", "#FFD1DC", "#FFB347",
  "#C8A2C8", "#87CEEB", "#98FB98", "#F4C2A1",
  "#D2691E", "#8B4513", "#FF6B6B", "#4ECDC4",
  "#2C3E50", "#E91E63", "#9C27B0", "#3F51B5",
];

export default function ColorPalette({ label, value, onChange }) {
  return (
    <div style={{
      background: "var(--white,#fff)",
      borderRadius: 14,
      padding: "14px",
      border: "1.5px solid var(--border,#F0DFD0)",
      boxShadow: "0 1px 4px rgba(45,31,14,0.06)",
      marginBottom: 10,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text,#2D1F0E)" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Current color swatch */}
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: value,
            border: "2px solid var(--border,#F0DFD0)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }} />
          {/* Color picker */}
          <label style={{
            width: 32, height: 32, borderRadius: 8,
            border: "1.5px solid var(--border,#F0DFD0)",
            overflow: "hidden", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--cream,#FFF8F2)",
            fontSize: 14,
          }}>
            🎨
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
            />
          </label>
        </div>
      </div>

      {/* Preset grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 6 }}>
        {PRESETS.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            title={color}
            style={{
              aspectRatio: "1",
              borderRadius: 8,
              background: color,
              border: value === color
                ? "2.5px solid var(--text,#2D1F0E)"
                : "1.5px solid rgba(0,0,0,0.08)",
              cursor: "pointer",
              transform: value === color ? "scale(1.15)" : "scale(1)",
              boxShadow: value === color ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
              transition: "all 0.15s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}