const TEXTURES = [
  { id: "smooth", label: "Smooth", desc: "Silky fondant", emoji: "✨" },
  { id: "swirled", label: "Swirled", desc: "Piped frosting", emoji: "🌀" },
  { id: "crumb", label: "Crumb", desc: "Naked cake", emoji: "🍞" },
];

export default function TextureSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {TEXTURES.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 text-center ${
            value === t.id
              ? "border-primary bg-primary/10"
              : "border-border bg-card hover:border-primary/40"
          }`}
        >
          <span className="text-2xl">{t.emoji}</span>
          <span className={`text-xs font-semibold ${value === t.id ? "text-primary" : "text-foreground"}`}>
            {t.label}
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight">{t.desc}</span>
        </button>
      ))}
    </div>
  );
}