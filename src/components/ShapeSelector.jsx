const SHAPES = [
  { id: "circle",    label: "Round",  icon: "○", desc: "Classic" },
  { id: "square",    label: "Square", icon: "□", desc: "Modern"  },
  { id: "rectangle", label: "Rectangle", icon: "▭", desc: "Elegant" },
];

export default function ShapeSelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {SHAPES.map((s) => {
        const active = value === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "14px 8px",
              borderRadius: 14,
              border: active ? "2px solid var(--amber, #C97B3A)" : "2px solid var(--border, #F0DFD0)",
              background: active
                ? "linear-gradient(135deg, #FDF3E7, #FFF8F2)"
                : "var(--white, #fff)",
              cursor: "pointer",
              boxShadow: active
                ? "0 4px 16px rgba(201,123,58,0.18)"
                : "0 1px 4px rgba(45,31,14,0.06)",
              transform: active ? "translateY(-1px)" : "none",
            }}
          >
            <span style={{
              fontSize: 24,
              lineHeight: 1,
              color: active ? "var(--amber, #C97B3A)" : "var(--text-muted, #8B7355)",
              filter: active ? "none" : "opacity(0.5)",
            }}>
              {s.icon}
            </span>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: active ? "var(--amber, #C97B3A)" : "var(--text, #2D1F0E)",
            }}>
              {s.label}
            </span>
            <span style={{
              fontSize: 10,
              color: "var(--text-light, #BBA890)",
              fontWeight: 400,
            }}>
              {s.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}