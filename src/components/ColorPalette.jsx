const PRESETS = [
  "#FFFFFF", "#FFF5E6", "#FFD1DC", "#FFB347",
  "#C8A2C8", "#87CEEB", "#98FB98", "#F4C2A1",
  "#D2691E", "#8B4513", "#FF6B6B", "#4ECDC4",
  "#2C3E50", "#E91E63", "#9C27B0", "#3F51B5",
];

export default function ColorPalette({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full border-2 border-border shadow-sm"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border-none bg-transparent p-0"
          />
        </div>
      </div>
      <div className="grid grid-cols-8 gap-1.5">
        {PRESETS.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-full aspect-square rounded-lg border-2 transition-all duration-150 hover:scale-110 ${
              value === color ? "border-foreground scale-110 shadow-md" : "border-transparent"
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}