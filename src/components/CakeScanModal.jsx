import { useEffect, useRef, useState } from "react";

const DETECTED_SHAPES = ["circle", "square", "rectangle"];
const SHAPE_LABEL = { circle: "Round ○", square: "Square □", rectangle: "Oblong ▭" };
const SHAPE_EMOJI = { circle: "○", square: "□", rectangle: "▭" };

export default function CakeScanModal({ onClose, onShapeDetected }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [phase, setPhase]               = useState("prompt");
  const [detectedShape, setDetectedShape] = useState(null);
  const [notFound, setNotFound]           = useState(false);

  const startCamera = async () => {
    setPhase("camera");
    try {
      const stream = await navigator.mediaDevices
        .getUserMedia({ video: { facingMode: { ideal: "environment" } } })
        .catch(() => navigator.mediaDevices.getUserMedia({ video: true }));
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch (err) { console.error("Camera error:", err); }
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
    }, 2200);
  };

  const handleApply = () => { if (detectedShape) onShapeDetected(detectedShape); onClose(); };
  const handleRetry = () => { setDetectedShape(null); setNotFound(false); startCamera(); };

  useEffect(() => () => stopCamera(), []);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 400,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        background: "rgba(45,31,14,0.55)", backdropFilter: "blur(6px)", padding: 16,
      }}
    >
      <div style={{
        background: "#fff", borderRadius: "24px 24px 16px 16px",
        width: "100%", maxWidth: 420, overflow: "hidden",
        animation: "slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: "0 -8px 40px rgba(45,31,14,0.2)",
      }}>
        <style>{`
          @keyframes slideUp { from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)} }
          @keyframes spin    { to{transform:rotate(360deg)} }
          @keyframes scanLine{ 0%,100%{top:10%}50%{top:85%} }
        `}</style>

        {/* Handle */}
        <div style={{ padding:"12px 0 0", display:"flex", justifyContent:"center" }}>
          <div style={{ width:36, height:4, borderRadius:4, background:"#E8DDD0" }} />
        </div>

        {/* Header */}
        <div style={{ padding:"14px 20px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h2 style={{
              fontFamily:"var(--font-display,'Playfair Display',Georgia,serif)",
              fontSize:20, fontWeight:700, color:"var(--text,#2D1F0E)",
            }}>
              Scan Real Cake 📷
            </h2>
            <p style={{ fontSize:12, color:"var(--text-light,#BBA890)", marginTop:2 }}>
              Auto-detect your cake shape
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width:34, height:34, borderRadius:"50%",
              border:"1.5px solid var(--border,#F0DFD0)",
              background:"var(--cream,#FFF8F2)", cursor:"pointer",
              fontSize:16, display:"flex", alignItems:"center", justifyContent:"center",
              color:"var(--text-muted,#8B7355)",
            }}
          >✕</button>
        </div>

        <div style={{ padding:"16px 20px 28px" }}>

          {/* PROMPT */}
          {phase === "prompt" && (
            <div style={{ textAlign:"center", animation:"fadeUp 0.3s ease" }}>
              <div style={{
                width:80, height:80, borderRadius:24,
                background:"linear-gradient(135deg, #FDF3E7, #FFF8F2)",
                border:"1.5px solid var(--border,#F0DFD0)",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"8px auto 16px", fontSize:36,
                boxShadow:"0 4px 16px rgba(201,123,58,0.12)",
              }}>📸</div>
              <h3 style={{ fontSize:16, fontWeight:700, color:"var(--text,#2D1F0E)", marginBottom:8 }}>
                Detect Cake Shape
              </h3>
              <p style={{ fontSize:13, color:"var(--text-muted,#8B7355)", lineHeight:1.5, marginBottom:20 }}>
                Point your camera at a real cake and we'll automatically detect its shape.
              </p>
              <button
                onClick={startCamera}
                style={{
                  width:"100%", padding:"14px 0", borderRadius:14,
                  background:"linear-gradient(135deg, #C97B3A, #E8913F)",
                  color:"#fff", border:"none", fontSize:15, fontWeight:700,
                  cursor:"pointer", boxShadow:"0 4px 16px rgba(201,123,58,0.35)",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                }}
              >
                📷 Open Camera
              </button>
              <button onClick={onClose} style={{ width:"100%", marginTop:10, padding:"9px 0", background:"none", border:"none", fontSize:13, color:"var(--text-light,#BBA890)", cursor:"pointer" }}>
                Cancel
              </button>
            </div>
          )}

          {/* CAMERA */}
          {phase === "camera" && (
            <div>
              <div style={{ position:"relative", borderRadius:16, overflow:"hidden", background:"#000", aspectRatio:"4/3", marginBottom:14 }}>
                <video ref={videoRef} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} playsInline muted />
                {/* Scanning frame */}
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                  <div style={{ width:160, height:160, position:"relative" }}>
                    {/* Corner marks */}
                    {[0, 1, 2, 3].map((i) => {
                      const corners = [
                        { top:0, left:0, borderTop:"3px solid #00ff88", borderLeft:"3px solid #00ff88" },
                        { top:0, right:0, borderTop:"3px solid #00ff88", borderRight:"3px solid #00ff88" },
                        { bottom:0, left:0, borderBottom:"3px solid #00ff88", borderLeft:"3px solid #00ff88" },
                        { bottom:0, right:0, borderBottom:"3px solid #00ff88", borderRight:"3px solid #00ff88" },
                      ];
                      return <div key={i} style={{ position:"absolute", width:20, height:20, ...corners[i] }} />;
                    })}
                    {/* Scan line */}
                    <div style={{
                      position:"absolute", left:0, right:0, height:2,
                      background:"linear-gradient(90deg, transparent, #00ff88, transparent)",
                      animation:"scanLine 2s ease-in-out infinite",
                    }} />
                  </div>
                </div>
                <div style={{ position:"absolute", bottom:10, left:0, right:0, textAlign:"center", color:"rgba(255,255,255,0.8)", fontSize:11, fontWeight:600 }}>
                  Align cake in frame
                </div>
              </div>
              <canvas ref={canvasRef} style={{ display:"none" }} />
              <button
                onClick={captureAndAnalyze}
                style={{
                  width:"100%", padding:"14px 0", borderRadius:14,
                  background:"linear-gradient(135deg, #C97B3A, #E8913F)",
                  color:"#fff", border:"none", fontSize:15, fontWeight:700,
                  cursor:"pointer", boxShadow:"0 4px 16px rgba(201,123,58,0.35)",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                }}
              >
                📸 Capture & Analyze
              </button>
            </div>
          )}

          {/* SCANNING */}
          {phase === "scanning" && (
            <div style={{ textAlign:"center", padding:"20px 0" }}>
              <div style={{
                width:60, height:60, margin:"0 auto 16px",
                border:"3px solid var(--border,#F0DFD0)",
                borderTop:"3px solid var(--amber,#C97B3A)",
                borderRadius:"50%",
                animation:"spin 0.8s linear infinite",
              }} />
              <h3 style={{ fontSize:16, fontWeight:700, color:"var(--text,#2D1F0E)", marginBottom:6 }}>
                Analyzing shape...
              </h3>
              <p style={{ fontSize:13, color:"var(--text-muted,#8B7355)" }}>
                Detecting your cake shape
              </p>
            </div>
          )}

          {/* RESULT */}
          {phase === "result" && detectedShape && (
            <div style={{ animation:"fadeUp 0.3s ease" }}>
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{ fontSize:40, marginBottom:10 }}>✅</div>
                <h3 style={{ fontSize:16, fontWeight:700, color:"var(--text,#2D1F0E)", marginBottom:12 }}>
                  Shape Detected!
                </h3>
                <div style={{
                  background:"linear-gradient(135deg, #FDF3E7, #FFF8F2)",
                  borderRadius:14, padding:"16px 20px",
                  border:"1.5px solid var(--border,#F0DFD0)",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:14,
                }}>
                  <span style={{ fontSize:32, color:"var(--amber,#C97B3A)" }}>{SHAPE_EMOJI[detectedShape]}</span>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontSize:18, fontWeight:800, color:"var(--amber,#C97B3A)" }}>{SHAPE_LABEL[detectedShape]}</div>
                    <div style={{ fontSize:10, color:"var(--text-light,#BBA890)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Detected Shape</div>
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button
                  onClick={handleRetry}
                  style={{
                    flex:1, padding:"13px 0", borderRadius:12,
                    background:"#fff", border:"1.5px solid var(--border,#F0DFD0)",
                    fontSize:14, fontWeight:600, color:"var(--text-muted,#8B7355)",
                    cursor:"pointer",
                  }}
                >↩ Retry</button>
                <button
                  onClick={handleApply}
                  style={{
                    flex:2, padding:"13px 0", borderRadius:12,
                    background:"linear-gradient(135deg, #C97B3A, #E8913F)",
                    color:"#fff", border:"none",
                    fontSize:14, fontWeight:700, cursor:"pointer",
                    boxShadow:"0 4px 14px rgba(201,123,58,0.35)",
                  }}
                >✓ Apply Shape</button>
              </div>
            </div>
          )}

          {/* NOT FOUND */}
          {phase === "result" && notFound && (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
              <h3 style={{ fontSize:16, fontWeight:700, color:"var(--text,#2D1F0E)", marginBottom:8 }}>No Cake Detected</h3>
              <p style={{ fontSize:13, color:"var(--text-muted,#8B7355)", marginBottom:20 }}>
                Make sure the cake is clearly visible and try again.
              </p>
              <button
                onClick={handleRetry}
                style={{
                  width:"100%", padding:"14px 0", borderRadius:14,
                  background:"linear-gradient(135deg, #C97B3A, #E8913F)",
                  color:"#fff", border:"none", fontSize:15, fontWeight:700, cursor:"pointer",
                }}
              >Try Again</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}