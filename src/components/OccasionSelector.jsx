const OCCASIONS = [
  { id: "Birthday", emoji: "🎂" },
  { id: "Wedding", emoji: "💍" },
  { id: "Anniversary", emoji: "❤️" },
  { id: "Graduation", emoji: "🎓" },
  { id: "Custom", emoji: "✏️" },
];

export default function OccasionSelector({ value, onChange, customName, onCustomNameChange }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {OCCASIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
              value === o.id
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-foreground hover:border-primary/50"
            }`}
          >
            <span>{o.emoji}</span>
            <span>{o.id}</span>
          </button>
        ))}
      </div>

      {value === "Custom" && (
        <div className="space-y-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            ✏️ Type Your Custom Message
          </p>
          <input
            type="text"
            value={customName || ""}
            onChange={(e) => onCustomNameChange?.(e.target.value)}
            placeholder="e.g. Happy 18th Sarah!"
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-primary/30 bg-card text-sm font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-xs text-muted-foreground">
            This will appear as the banner on your cake
          </p>
        </div>
      )}
    </div>
  );
}
