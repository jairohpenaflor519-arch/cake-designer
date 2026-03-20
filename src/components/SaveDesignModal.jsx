import { useState } from "react";

const SHAPE_ICON   = { circle: "○", square: "□", rectangle: "▭" };
const TEXTURE_ICON = { smooth: "✨", swirled: "🌀", crumb: "🍞" };

export default function SaveDesignModal({ config, onClose, onSaved }) {
  const [name, setName]     = useState(`${config.occasion} Cake`);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    console.log("Design saved:", { ...config, name: name.trim() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { onSaved?.(); onClose(); }, 900);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 400,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        background: "rgba(45,31,14,0.55)", backdropFilter: "blur(6px)",
        padding: 16,
      }}
    >
      <div style={{
        background: "#fff",
        borderRadius: "24px 24px 16px 16px",
        width: "100%", maxWidth: 420,
        overflow: "hidden",
        animation: "slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: "0 -8px 40px rgba(45,31,14,0.2)",
      }}>
        <style>{`
          @keyframes slideUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
          @keyframes spin    { to { transform: rotate(360deg); } }
          @keyframes bounceIn { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        `}</style>

        {/* Handle bar */}
        <div style={{ padding: "12px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: "#E8DDD0" }} />
        </div>

        {/* Header */}
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{
                fontFamily: "var(--font-display,'Playfair Display',Georgia,serif)",
                fontSize: 22, fontWeight: 700,
                color: "var(--text,#2D1F0E)", marginBottom: 2,
              }}>
                Save Design 💾
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-light,#BBA890)" }}>
                Give your masterpiece a name
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 34, height: 34, borderRadius: "50%",
                border: "1.5px solid var(--border,#F0DFD0)",
                background: "var(--cream,#FFF8F2)",
                cursor: "pointer", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-muted,#8B7355)",
              }}
            >✕</button>
          </div>
        </div>

        <div style={{ padding: "16px 20px 24px" }}>
          {/* Name input */}
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mia's Birthday Cake"
              autoFocus
              style={{
                width: "100%", padding: "14px 16px",
                borderRadius: 14,
                border: `2px solid ${name.trim() ? "var(--amber,#C97B3A)" : "var(--border,#F0DFD0)"}`,
                background: name.trim() ? "var(--amber-light,#FDF3E7)" : "#fff",
                fontSize: 15, fontWeight: 600,
                color: "var(--text,#2D1F0E)",
                outline: "none",
                transition: "all 0.2s",
                fontFamily: "var(--font-body,'DM Sans',system-ui,sans-serif)",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--amber,#C97B3A)"; e.target.style.background = "var(--amber-light,#FDF3E7)"; }}
              onBlur={(e)  => { if (!name.trim()) { e.target.style.borderColor = "var(--border,#F0DFD0)"; e.target.style.background = "#fff"; } }}
            />
          </div>

          {/* Design summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { icon: SHAPE_ICON[config.shape] || "○",  label: "Shape",       value: config.shape.charAt(0).toUpperCase() + config.shape.slice(1) },
              { icon: "🎂",                             label: "Tiers",       value: `${config.layers} tier${config.layers > 1 ? "s" : ""}` },
              { icon: TEXTURE_ICON[config.texture]||"✨",label: "Texture",     value: config.texture.charAt(0).toUpperCase() + config.texture.slice(1) },
              { icon: "🎁",                             label: "Decorations", value: `${config.decorations.length} item${config.decorations.length !== 1 ? "s" : ""}` },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{
                background: "var(--cream,#FFF8F2)", borderRadius: 12,
                padding: "11px 13px",
                border: "1.5px solid var(--border,#F0DFD0)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text,#2D1F0E)" }}>{value}</div>
                  <div style={{ fontSize: 10, color: "var(--text-light,#BBA890)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Color preview */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", marginBottom: 16,
            background: "var(--cream,#FFF8F2)", borderRadius: 12,
            border: "1.5px solid var(--border,#F0DFD0)",
          }}>
            <div style={{ display: "flex", gap: -4 }}>
              {(config.tierColors || [config.frostColor]).slice(0, 4).map((c, i) => (
                <div key={i} style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: c, border: "2px solid #fff",
                  marginLeft: i > 0 ? -6 : 0,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }} />
              ))}
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: config.accentColor, border: "2px solid #fff",
                marginLeft: -6, boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              }} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text,#2D1F0E)" }}>Color Palette</div>
              <div style={{ fontSize: 10, color: "var(--text-light,#BBA890)" }}>Tier colors · Accent</div>
            </div>
            <div style={{
              marginLeft: "auto", fontSize: 11, fontWeight: 700,
              color: "var(--amber,#C97B3A)",
              background: "rgba(201,123,58,0.1)",
              padding: "4px 10px", borderRadius: 20,
            }}>
              {config.occasion}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || saved}
            style={{
              width: "100%", padding: "15px 0",
              borderRadius: 14,
              background: saved
                ? "linear-gradient(135deg, #43a047, #2e7d32)"
                : !name.trim()
                  ? "var(--border,#F0DFD0)"
                  : "linear-gradient(135deg, var(--amber,#C97B3A), var(--amber-mid,#E8913F))",
              color: !name.trim() ? "var(--text-light,#BBA890)" : "#fff",
              border: "none", fontSize: 15, fontWeight: 700,
              cursor: saving || !name.trim() ? "not-allowed" : "pointer",
              boxShadow: !name.trim() || saved ? "none" : "0 4px 16px rgba(201,123,58,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.3s",
            }}
          >
            {saved ? (
              <><span style={{ animation: "bounceIn 0.4s ease" }}>✓</span> Saved!</>
            ) : saving ? (
              <>
                <span style={{
                  width: 16, height: 16, border: "2px solid rgba(255,255,255,0.35)",
                  borderTop: "2px solid #fff", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite", display: "inline-block",
                }} />
                Saving...
              </>
            ) : (
              <><span>💾</span> Save Design</>
            )}
          </button>

          <button
            onClick={onClose}
            style={{
              width: "100%", marginTop: 10, padding: "9px 0",
              background: "none", border: "none",
              fontSize: 13, color: "var(--text-light,#BBA890)",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}