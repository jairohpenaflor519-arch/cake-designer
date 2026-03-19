const SHAPES = [
  { id: "circle", label: "Round", icon: "○" },
  { id: "square", label: "Square", icon: "□" },
  { id: "rectangle", label: "Rectangle", icon: "▭" },
];

export default function ShapeSelector({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {SHAPES.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-2 transition-all duration-200 ${
            value === s.id
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:border-primary/40"
          }`}
        >
          <span className="text-xl leading-none">{s.icon}</span>
          <span className="text-xs font-medium">{s.label}</span>
        </button>
      ))}
    </div>
  );
}