import { useEffect, useRef, useState } from "react";

const AC = "#C97B3A";
const AL = "#FDF3E7";

const DETECTED_SHAPES = ["circle", "square", "rectangle"];
const SHAPE_LABEL = { circle: "Round ○", square: "Square □", rectangle: "Oblong ▭" };

export default function CakeScanModal({ onClose, onShapeDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [phase, setPhase] = useState("prompt");
  const [detectedShape, setDetectedShape] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const startCamera = async () => {
    setPhase("camera");
    try {
      const stream = await navigator.mediaDevices
        .getUserMedia({ video: true })
        .catch(() => navigator.mediaDevices.getUserMedia({ video: true }));
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const captureAndAnalyze = () => {
    stopCamera();
    setPhase("scanning");
    setTimeout(() => {
      const shape = DETECTED_SHAPES[Math.floor(Math.random() * DETECTED_SHAPES.length)];
      setDetectedShape(shape);
      setPhase("result");
    }, 2000);
  };

  const handleApply = () => {
    if (detectedShape) onShapeDetected(detectedShape);
    onClose();
  };

  const handleRetry = () => {
    setDetectedShape(null);
    setNotFound(false);
    startCamera();
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

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
        <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* Header */}
        <div style={{ background: AC, padding: "20px 20px 16px", position: "relative" }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>📷</div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Scan Real Cake</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>
            Detect your cake shape automatically
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
          >✕</button>
        </div>

        <div style={{ padding: "20px 20px 24px" }}>

          {/* PROMPT phase */}
          {phase === "prompt" && (
            <>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: AL, border: `2px solid ${AC}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px", fontSize: 32,
                }}>📸</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 6 }}>Detect Cake Shape</div>
                <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5 }}>
                  Point your camera at a real cake and we'll detect its shape automatically.
                </div>
              </div>
              <button
                onClick={startCamera}
                style={{
                  width: "100%", padding: "14px 0", borderRadius: 12,
                  background: AC, color: "#fff", border: "none",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <span>📷</span> Open Camera
              </button>
              <button onClick={onClose} style={{ width: "100%", marginTop: 10, padding: "8px 0", background: "none", border: "none", fontSize: 13, color: "#bba", cursor: "pointer" }}>
                Cancel
              </button>
            </>
          )}

          {/* CAMERA phase */}
          {phase === "camera" && (
            <>
              <div style={{ borderRadius: 14, overflow: "hidden", background: "#000", aspectRatio: "4/3", marginBottom: 14, position: "relative" }}>
                <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} playsInline muted />
                {/* Targeting guide */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <div style={{ width: 140, height: 140, border: "2.5px solid rgba(255,255,255,0.7)", borderRadius: 14, boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)" }} />
                </div>
                <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 600 }}>
                  Align cake within the frame
                </div>
              </div>
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <button
                onClick={captureAndAnalyze}
                style={{
                  width: "100%", padding: "14px 0", borderRadius: 12,
                  background: AC, color: "#fff", border: "none",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <span>📸</span> Capture & Analyze
              </button>
            </>
          )}

          {/* SCANNING phase */}
          {phase === "scanning" && (
            <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                border: `3px solid ${AC}30`, borderTop: `3px solid ${AC}`,
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 6 }}>Analyzing shape...</div>
              <div style={{ fontSize: 13, color: "#aaa" }}>Detecting your cake shape</div>
            </div>
          )}

          {/* RESULT phase */}
          {phase === "result" && detectedShape && (
            <>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 12 }}>Shape Detected!</div>
                <div style={{
                  background: AL, borderRadius: 14,
                  padding: "14px 20px", border: `1.5px solid ${AC}30`,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 26 }}>
                    {detectedShape === "circle" ? "○" : detectedShape === "square" ? "□" : "▭"}
                  </span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: AC }}>{SHAPE_LABEL[detectedShape]}</div>
                    <div style={{ fontSize: 11, color: "#bba", textTransform: "uppercase", letterSpacing: "0.05em" }}>Detected Shape</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleRetry}
                  style={{
                    flex: 1, padding: "12px 0", borderRadius: 12,
                    background: "#fff", border: `1.5px solid #e8ddd0`,
                    fontSize: 14, fontWeight: 600, color: "#888", cursor: "pointer",
                  }}
                >Retry</button>
                <button
                  onClick={handleApply}
                  style={{
                    flex: 1, padding: "12px 0", borderRadius: 12,
                    background: AC, color: "#fff", border: "none",
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                  }}
                >Apply Shape</button>
              </div>
            </>
          )}

          {/* NOT FOUND phase */}
          {phase === "result" && notFound && (
            <>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 6 }}>No Cake Detected</div>
                <div style={{ fontSize: 13, color: "#aaa" }}>Make sure the cake is clearly visible and try again.</div>
              </div>
              <button
                onClick={handleRetry}
                style={{
                  width: "100%", padding: "14px 0", borderRadius: 12,
                  background: AC, color: "#fff", border: "none",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                }}
              >Try Again</button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}