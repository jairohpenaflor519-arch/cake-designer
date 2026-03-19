const DECORATIONS = [
  { type: "sprinkles", label: "Sprinkles", emoji: "🎊", count: 1 },
  { type: "strawberry", label: "Strawberry", emoji: "🍓", count: 3 },
  { type: "choc_chips", label: "Choc Chips", emoji: "🍫", count: 1 },
  { type: "candles", label: "Candles", emoji: "🕯️", count: 3 },
  { type: "kiwi", label: "Kiwi Slices", emoji: "🥝", count: 4 },
  { type: "oreos", label: "Oreos", emoji: "🍪", count: 6 },
  { type: "marshmallows", label: "Marshmallows", emoji: "☁️", count: 8 },
  { type: "macarons", label: "Macarons", emoji: "🫐", count: 5 },
  { type: "gold_leaf", label: "Gold Leaf", emoji: "✨", count: 1 },
  { type: "fondant_roses", label: "Fondant Roses", emoji: "🌹", count: 4 },
  { type: "cherries", label: "Cherries", emoji: "🍒", count: 5 },
  { type: "gold_pearls", label: "Gold Pearls", emoji: "🟡", count: 1 },
  { type: "silver_pearls", label: "Silver Pearls", emoji: "⚪", count: 1 },
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
    <div className="grid grid-cols-3 gap-2">
      {DECORATIONS.map((dec) => {
        const active = activeTypes.includes(dec.type);
        return (
          <button
            key={dec.type}
            onClick={() => toggle(dec)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
              active
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <span className="text-2xl">{dec.emoji}</span>
            <span
              className={`text-xs font-semibold leading-tight text-center ${
                active ? "text-primary" : "text-foreground"
              }`}
            >
              {dec.label}
            </span>
            {active && (
              <span className="text-[10px] text-primary font-medium">Added ✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
}