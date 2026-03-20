import { useState } from "react";

const AC = "#C97B3A";
const AL = "#FDF3E7";

const SHAPE_ICON = { circle: "○", square: "□", rectangle: "▭" };
const TEXTURE_ICON = { smooth: "✨", swirled: "🌀", crumb: "🍞" };

export default function SaveDesignModal({ config, onClose, onSaved }) {
  const [name, setName] = useState(`${config.occasion} Cake`);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    console.log("Design saved:", { ...config, name: name.trim() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      onSaved?.();
      onClose();
    }, 800);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#fff", borderRadius: 20,
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
          width: "100%", maxWidth: 380,
          overflow: "hidden",
          animation: "slideUp 0.2s ease",
        }}
      >
        <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

        {/* Header */}
        <div style={{ background: AC, padding: "20px 20px 16px", position: "relative" }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>💾</div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Save Your Design</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>
            Give your cake a name to save it
          </div>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16,
              background: "rgba(255,255,255,0.2)", border: "none",
              color: "#fff", borderRadius: "50%", width: 30, height: 30,
              cursor: "pointer", fontSize: 16, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "20px 20px 24px" }}>

          {/* Name input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#bba", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Design Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mia's Birthday Cake"
              autoFocus
              style={{
                width: "100%", padding: "12px 14px",
                borderRadius: 12, border: `2px solid ${name.trim() ? AC : "#e8ddd0"}`,
                fontSize: 15, fontWeight: 600, outline: "none",
                color: "#333", background: name.trim() ? AL : "#fff",
                transition: "all .2s",
              }}
              onFocus={(e) => { e.target.style.borderColor = AC; e.target.style.background = AL; }}
              onBlur={(e) => { if (!name.trim()) { e.target.style.borderColor = "#e8ddd0"; e.target.style.background = "#fff"; } }}
            />
          </div>

          {/* Design summary */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#bba", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
              Design Summary
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { icon: SHAPE_ICON[config.shape] || "○", label: "Shape", value: config.shape.charAt(0).toUpperCase() + config.shape.slice(1) },
                { icon: "🎂", label: "Tiers", value: `${config.layers} tier${config.layers > 1 ? "s" : ""}` },
                { icon: TEXTURE_ICON[config.texture] || "✨", label: "Texture", value: config.texture.charAt(0).toUpperCase() + config.texture.slice(1) },
                { icon: "🎁", label: "Decorations", value: `${config.decorations.length} item${config.decorations.length !== 1 ? "s" : ""}` },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "#fff8f2", borderRadius: 12,
                    padding: "12px 14px", border: "1.5px solid #f0e0d0",
                    display: "flex", alignItems: "center", gap: 10,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>{value}</div>
                    <div style={{ fontSize: 10, color: "#bba", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Color preview */}
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#fff8f2", borderRadius: 12, border: "1.5px solid #f0e0d0" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: config.frostColor, border: "2px solid #e8ddd0", flexShrink: 0 }} title="Frosting" />
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: config.accentColor, border: "2px solid #e8ddd0", flexShrink: 0 }} title="Accent" />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>Color Scheme</div>
              <div style={{ fontSize: 10, color: "#bba" }}>Frosting · Accent</div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: AC, background: AL, padding: "4px 10px", borderRadius: 20 }}>
              {config.occasion}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            style={{
              width: "100%", padding: "14px 0", borderRadius: 12,
              background: saved ? "#4caf50" : !name.trim() ? "#e0d4c8" : AC,
              color: !name.trim() ? "#bba" : "#fff",
              border: "none", fontSize: 15, fontWeight: 700,
              cursor: saving || !name.trim() ? "not-allowed" : "pointer",
              transition: "all .3s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {saved ? (
              <><span>✓</span> Saved!</>
            ) : saving ? (
              <>
                <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Saving...
              </>
            ) : (
              <><span>💾</span> Save Design</>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </button>

          {/* Cancel link */}
          <button
            onClick={onClose}
            style={{ width: "100%", marginTop: 10, padding: "8px 0", background: "none", border: "none", fontSize: 13, color: "#bba", cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}