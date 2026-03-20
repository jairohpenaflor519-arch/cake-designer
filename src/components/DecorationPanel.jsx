const DECORATIONS = [
  { type: "sprinkles",     label: "Sprinkles",     emoji: "🎊" },
  { type: "strawberry",    label: "Strawberry",    emoji: "🍓" },
  { type: "choc_chips",    label: "Choc Chips",    emoji: "🍫" },
  { type: "candles",       label: "Candles",       emoji: "🕯️" },
  { type: "kiwi",          label: "Kiwi",          emoji: "🥝" },
  { type: "oreos",         label: "Oreos",         emoji: "🍪" },
  { type: "marshmallows",  label: "Marshmallows",  emoji: "☁️" },
  { type: "macarons",      label: "Macarons",      emoji: "🫐" },
  { type: "gold_leaf",     label: "Gold Leaf",     emoji: "✨" },
  { type: "fondant_roses", label: "Roses",         emoji: "🌹" },
  { type: "cherries",      label: "Cherries",      emoji: "🍒" },
  { type: "gold_pearls",   label: "Gold Pearls",   emoji: "🟡" },
  { type: "silver_pearls", label: "Silver Pearls", emoji: "⚪" },
];

export default function DecorationPanel({ value, onChange }) {
  const activeTypes = value.map((d) => d.type);
  const toggle = (dec) => {
    if (activeTypes.includes(dec.type)) {
      onChange(value.filter((d) => d.type !== dec.type));
    } else {
      onChange([...value, dec]);
    }
  };

  return (
    <div>
      {activeTypes.length > 0 && (
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12,
          padding: "10px 12px",
          background: "linear-gradient(135deg, #FDF3E7, #FFF8F2)",
          borderRadius: 12, border: "1.5px solid var(--border,#F0DFD0)",
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-light,#BBA890)", width: "100%", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Selected ({activeTypes.length})
          </span>
          {activeTypes.map((t) => {
            const dec = DECORATIONS.find(d => d.type === t);
            return (
              <span key={t} style={{
                fontSize: 11, fontWeight: 600,
                color: "var(--amber,#C97B3A)",
                background: "rgba(201,123,58,0.1)",
                borderRadius: 20, padding: "3px 10px",
                display: "flex", alignItems: "center", gap: 4,
                cursor: "pointer",
                border: "1px solid rgba(201,123,58,0.2)",
              }}
              onClick={() => toggle(dec)}
              >
                {dec?.emoji} {dec?.label} ✕
              </span>
            );
          })}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {DECORATIONS.map((dec) => {
          const active = activeTypes.includes(dec.type);
          return (
            <button
              key={dec.type}
              onClick={() => toggle(dec)}
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 5,
                padding: "12px 6px",
                borderRadius: 12,
                border: active
                  ? "2px solid var(--amber,#C97B3A)"
                  : "1.5px solid var(--border,#F0DFD0)",
                background: active
                  ? "linear-gradient(135deg, #FDF3E7, #FFF8F2)"
                  : "var(--white,#fff)",
                cursor: "pointer",
                position: "relative",
                boxShadow: active ? "0 4px 12px rgba(201,123,58,0.15)" : "0 1px 3px rgba(45,31,14,0.05)",
                transform: active ? "translateY(-1px)" : "none",
              }}
            >
              {active && (
                <div style={{
                  position: "absolute", top: 5, right: 5,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "var(--amber,#C97B3A)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: "#fff", fontWeight: 800,
                }}>✓</div>
              )}
              <span style={{ fontSize: 24 }}>{dec.emoji}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, textAlign: "center", lineHeight: 1.2,
                color: active ? "var(--amber,#C97B3A)" : "var(--text,#2D1F0E)",
              }}>
                {dec.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}