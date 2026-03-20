const TEXTURES = [
  { id: "smooth",  label: "Smooth",  desc: "Silky fondant",  emoji: "✨" },
  { id: "swirled", label: "Swirled", desc: "Piped frosting", emoji: "🌀" },
  { id: "crumb",   label: "Naked",   desc: "Crumb coat",     emoji: "🍞" },
];

export default function TextureSelector({ value, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
      {TEXTURES.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              padding: "14px 6px",
              borderRadius: 14,
              border: active ? "2px solid var(--amber, #C97B3A)" : "2px solid var(--border, #F0DFD0)",
              background: active
                ? "linear-gradient(135deg, #FDF3E7, #FFF8F2)"
                : "var(--white, #fff)",
              cursor: "pointer",
              textAlign: "center",
              boxShadow: active ? "0 4px 16px rgba(201,123,58,0.18)" : "0 1px 4px rgba(45,31,14,0.06)",
              transform: active ? "translateY(-1px)" : "none",
            }}
          >
            <span style={{ fontSize: 22 }}>{t.emoji}</span>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: active ? "var(--amber, #C97B3A)" : "var(--text, #2D1F0E)",
            }}>
              {t.label}
            </span>
            <span style={{ fontSize: 10, color: "var(--text-light, #BBA890)", lineHeight: 1.3 }}>
              {t.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}