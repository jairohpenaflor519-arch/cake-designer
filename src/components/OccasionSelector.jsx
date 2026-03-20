const OCCASIONS = [
  { id: "Birthday",    emoji: "🎂", color: "#FFD1DC" },
  { id: "Wedding",     emoji: "💍", color: "#F0E6FF" },
  { id: "Anniversary", emoji: "❤️", color: "#FFE4E4" },
  { id: "Graduation",  emoji: "🎓", color: "#E4F0FF" },
  { id: "Custom",      emoji: "✏️", color: "#FFF0E4" },
];

export default function OccasionSelector({ value, onChange, customName, onCustomNameChange }) {
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {OCCASIONS.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 14px",
                borderRadius: 24,
                border: active ? "2px solid var(--amber,#C97B3A)" : "1.5px solid var(--border,#F0DFD0)",
                background: active
                  ? `linear-gradient(135deg, ${o.color}, #FFF8F2)`
                  : "var(--white,#fff)",
                cursor: "pointer",
                fontSize: 13, fontWeight: 600,
                color: active ? "var(--amber-dark,#A05E22)" : "var(--text,#2D1F0E)",
                boxShadow: active ? "0 3px 12px rgba(201,123,58,0.2)" : "0 1px 3px rgba(45,31,14,0.05)",
                transform: active ? "translateY(-1px)" : "none",
              }}
            >
              <span style={{ fontSize: 16 }}>{o.emoji}</span>
              <span>{o.id}</span>
            </button>
          );
        })}
      </div>

      {value === "Custom" && (
        <div style={{
          padding: 14,
          borderRadius: 14,
          background: "linear-gradient(135deg, #FDF3E7, #FFF8F2)",
          border: "1.5px solid rgba(201,123,58,0.25)",
          animation: "fadeUp 0.2s ease forwards",
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--amber,#C97B3A)",
            marginBottom: 8,
          }}>✏️ Custom Message</p>
          <input
            type="text"
            value={customName || ""}
            onChange={(e) => onCustomNameChange?.(e.target.value)}
            placeholder="e.g. Happy 18th Sarah!"
            autoFocus
            style={{
              width: "100%", padding: "11px 14px",
              borderRadius: 10,
              border: "1.5px solid rgba(201,123,58,0.3)",
              background: "#fff",
              fontSize: 13, fontWeight: 500,
              color: "var(--text,#2D1F0E)",
              outline: "none",
              fontFamily: "var(--font-body,'DM Sans',system-ui,sans-serif)",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--amber,#C97B3A)"; e.target.style.boxShadow = "0 0 0 3px rgba(201,123,58,0.1)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "rgba(201,123,58,0.3)"; e.target.style.boxShadow = "none"; }}
          />
          <p style={{ fontSize: 11, color: "var(--text-light,#BBA890)", marginTop: 6 }}>
            This will appear as the banner text on your cake
          </p>
        </div>
      )}
    </div>
  );
}