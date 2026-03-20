export default function LayerSlider({ value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Layers
        </span>
        <span className="text-sm font-bold text-primary">
          {value} {value === 1 ? "tier" : "tiers"}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={4}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary h-2 rounded-full cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
        <span>1</span><span>2</span><span>3</span><span>4</span>
      </div>
    </div>
  );
}