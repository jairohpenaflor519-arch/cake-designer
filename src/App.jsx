import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Layout from "./components/Layout";
import PanelSection from "./components/PanelSection";
import ShapeSelector from "./components/ShapeSelector";
import TextureSelector from "./components/TextureSelector";
import LayerSlider from "./components/LayerSlider";
import ColorPalette from "./components/ColorPalette";
import DecorationPanel from "./components/DecorationPanel";
import OccasionSelector from "./components/OccasionSelector";
import SaveDesignModal from "./components/SaveDesignModal";
import CakeScanModal from "./components/CakeScanModal";

const AC = "#C97B3A";
const AL = "#FDF3E7";

// Pre-generated star data — fixed at module level to avoid Math.random() during render
const STAR_DATA = Array.from({ length: 100 }, () => ({
  size: 0.012 + Math.random() * 0.018,
  hsl: [0.1 + Math.random() * 0.1, 0.3, 0.7 + Math.random() * 0.3],
  th: Math.random() * Math.PI * 2,
  ph: Math.random() * Math.PI * 0.4 + 0.05,
  rr: 8 + Math.random() * 6,
}));

const DEFAULTS = {
  Birthday: "Happy Birthday!",
  Wedding: "Happy Wedding!",
  Anniversary: "Happy Anniversary!",
  Graduation: "Congratulations!",
  Custom: "",
};


function makeSwirledTex() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");
  x.fillStyle = "#fff";
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) {
    x.beginPath();
    x.arc(128, 128, 10 + i * 5, 0, (Math.PI * 2 * i) / 40);
    x.strokeStyle = `rgba(180,155,130,${0.1 + i * 0.005})`;
    x.lineWidth = 3;
    x.stroke();
  }
  return new THREE.CanvasTexture(c);
}

function makeCrumbTex() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");
  x.fillStyle = "#c8924a";
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    const l = Math.random();
    x.beginPath();
    x.arc(Math.random() * 256, Math.random() * 256, Math.random() * 3 + 0.5, 0, Math.PI * 2);
    x.fillStyle = `rgba(${(140 + l * 60) | 0},${(70 + l * 40) | 0},${(20 + l * 30) | 0},0.6)`;
    x.fill();
  }
  return new THREE.CanvasTexture(c);
}



function buildCake(cfg) {
  const group = new THREE.Group();
  const { layers, shape } = cfg;
  const tierH = 0.55;
  const bumpMap = cfg.texture === "swirled" ? makeSwirledTex() : cfg.texture === "crumb" ? makeCrumbTex() : null;
  const rough = cfg.texture === "smooth" ? 0.28 : cfg.texture === "swirled" ? 0.52 : 0.88;
  const metal = cfg.texture === "smooth" ? 0.06 : 0.01;

  for (let i = 0; i < layers; i++) {
    const centerY = i * tierH + tierH / 2;
    const s = 1 - i * 0.14;
    let geom;
    if (shape === "circle") geom = new THREE.CylinderGeometry(1.0 * s, 1.02 * s, tierH, 64);
    else if (shape === "square") geom = new THREE.BoxGeometry(1.9 * s, tierH, 1.9 * s);
    else geom = new THREE.BoxGeometry(2.2 * s, tierH, 1.6 * s);
    const col = new THREE.Color(cfg.tierColors?.[i] ?? cfg.frostColor);
    const mat = new THREE.MeshStandardMaterial({ color: col, roughness: rough, metalness: metal, ...(bumpMap ? { bumpMap, bumpScale: cfg.texture === "swirled" ? 0.012 : 0.025 } : {}) });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.y = centerY; mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh);

    const ringY = i * tierH + tierH;
    if (shape !== "circle") {
      const ew = shape === "square" ? 1.9 * s : 2.2 * s;
      const ed = shape === "square" ? 1.9 * s : 1.6 * s;
      const trimMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(cfg.accentColor), roughness: 0.28 });
      [
        { pos: [0, ringY, ed / 2], rot: [0, 0, 0], w: ew },
        { pos: [0, ringY, -ed / 2], rot: [0, Math.PI, 0], w: ew },
        { pos: [ew / 2, ringY, 0], rot: [0, Math.PI / 2, 0], w: ed },
        { pos: [-ew / 2, ringY, 0], rot: [0, -Math.PI / 2, 0], w: ed },
      ].forEach(({ pos, rot, w }) => {
        const em = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.06), trimMat);
        em.position.set(...pos); em.rotation.set(...rot); group.add(em);
      });
    }
  }

  const plateY = -0.07;
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.09, 64), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.06, metalness: 0.8 }));
  plate.position.y = plateY; plate.castShadow = true; plate.receiveShadow = true; group.add(plate);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.08, 14, 64), new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.1, metalness: 0.7 }));
  rim.position.y = plateY; rim.rotation.x = Math.PI / 2; group.add(rim);

  const topY = layers * tierH + 0.05;
  const topScale = 1 - (layers - 1) * 0.14;

  cfg.decorations.forEach((dec, di) => {
    const ang = (di / Math.max(cfg.decorations.length, 1)) * Math.PI * 2;
    const r = 0.58 * topScale;
    const dx = Math.cos(ang) * r;
    const dz = Math.sin(ang) * r;

    if (dec.type === "candles") {
      [[-0.35, 0], [0.35, 0], [0, 0]].forEach(([cx2, cz2]) => {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.42, 12), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.9, 0.65), roughness: 0.3 }));
        body.position.set(cx2 * topScale, topY + 0.21, cz2 * topScale); body.castShadow = true; group.add(body);
        const flame = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 3, roughness: 0 }));
        flame.scale.y = 1.8; flame.position.set(cx2 * topScale, topY + 0.48, cz2 * topScale); group.add(flame);
        const gl = new THREE.PointLight(0xffaa00, 1.2, 2.5);
        gl.position.set(cx2 * topScale, topY + 0.5, cz2 * topScale); group.add(gl);
      });
    } else if (dec.type === "sprinkles") {
      for (let s2 = 0; s2 < 50; s2++) {
        const sm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.95, 0.6), roughness: 0.3 }));
        const a2 = Math.random() * Math.PI * 2;
        const r2 = Math.random() * 0.82 * topScale;
        sm.position.set(Math.cos(a2) * r2, topY + 0.05, Math.sin(a2) * r2);
        sm.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        sm.castShadow = true; group.add(sm);
      }
    } else if (dec.type === "strawberry") {
      const sg = new THREE.SphereGeometry(0.14, 12, 12); sg.scale(0.9, 1.2, 0.9);
      const sm = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.55 }));
      sm.position.set(dx, topY + 0.14, dz); sm.castShadow = true; group.add(sm);
    } else if (dec.type === "macarons") {
      const cols = [0xf48fb1, 0xc5e1a5, 0xffe082, 0xb39ddb, 0x80deea];
      [0, 1, 2].forEach((mi) => {
        const a2 = (mi / 3) * Math.PI * 2;
        const r2 = 0.6 * topScale;
        const mat2 = new THREE.MeshStandardMaterial({ color: cols[mi % cols.length], roughness: 0.4 });
        [0.035, 0.105].forEach((yy) => {
          const mb = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.07, 20), mat2);
          mb.position.set(Math.cos(a2) * r2, topY + yy, Math.sin(a2) * r2); mb.castShadow = true; group.add(mb);
        });
      });
    } else if (dec.type === "cherries") {
      [0, 1, 2, 3].forEach((ci) => {
        const a2 = (ci / 4) * Math.PI * 2;
        const ch = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.3, metalness: 0.15 }));
        ch.position.set(Math.cos(a2) * 0.65 * topScale, topY + 0.09, Math.sin(a2) * 0.65 * topScale); ch.castShadow = true; group.add(ch);
      });
    } else if (dec.type === "gold_pearls") {
      for (let pi = 0; pi < 18; pi++) {
        const a2 = (pi / 18) * Math.PI * 2;
        const pm = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.04 }));
        pm.position.set(Math.cos(a2) * 0.95 * topScale, topY + 0.055, Math.sin(a2) * 0.95 * topScale); pm.castShadow = true; group.add(pm);
      }
    } else if (dec.type === "marshmallows") {
      for (let mi = 0; mi < 6; mi++) {
        const a2 = (mi / 6) * Math.PI * 2;
        const mm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 12), new THREE.MeshStandardMaterial({ color: 0xfff5f5, roughness: 0.12 }));
        mm.position.set(Math.cos(a2) * 0.65 * topScale, topY + 0.06, Math.sin(a2) * 0.65 * topScale); mm.castShadow = true; group.add(mm);
      }
    } else if (dec.type === "oreos") {
      for (let oi = 0; oi < 6; oi++) {
        const a2 = (oi / 6) * Math.PI * 2;
        const om = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 20), new THREE.MeshStandardMaterial({ color: 0x1a0a00, roughness: 0.5 }));
        om.position.set(Math.cos(a2) * 0.7 * topScale, topY + 0.03, Math.sin(a2) * 0.7 * topScale); om.castShadow = true; group.add(om);
        const ow = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 20), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
        ow.position.set(Math.cos(a2) * 0.7 * topScale, topY + 0.065, Math.sin(a2) * 0.7 * topScale); group.add(ow);
      }
    } else if (dec.type === "choc_chips") {
      for (let ci = 0; ci < 20; ci++) {
        const a2 = Math.random() * Math.PI * 2;
        const r2 = Math.random() * 0.8 * topScale;
        const cc = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), new THREE.MeshStandardMaterial({ color: 0x3d1a00, roughness: 0.7 }));
        cc.position.set(Math.cos(a2) * r2, topY + 0.055, Math.sin(a2) * r2); cc.castShadow = true; group.add(cc);
      }
    } else if (dec.type === "fondant_roses") {
      [0, 1, 2, 3].forEach((ri) => {
        const a2 = (ri / 4) * Math.PI * 2;
        const rose = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshStandardMaterial({ color: 0xe91e63, roughness: 0.6 }));
        rose.position.set(Math.cos(a2) * 0.62 * topScale, topY + 0.1, Math.sin(a2) * 0.62 * topScale); rose.castShadow = true; group.add(rose);
      });
    } else if (dec.type === "kiwi") {
      const km = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 16), new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.7 }));
      km.position.set(dx, topY + 0.03, dz); km.castShadow = true; group.add(km);
    } else if (dec.type === "gold_leaf") {
      for (let gi = 0; gi < 10; gi++) {
        const a2 = Math.random() * Math.PI * 2;
        const r2 = Math.random() * 0.8 * topScale;
        const gm = new THREE.Mesh(new THREE.PlaneGeometry(0.14 + Math.random() * 0.1, 0.09 + Math.random() * 0.07), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.04, side: THREE.DoubleSide }));
        gm.position.set(Math.cos(a2) * r2, topY + 0.01, Math.sin(a2) * r2);
        gm.rotation.set(-Math.PI / 2 + (Math.random() - 0.5) * 0.3, Math.random() * Math.PI, 0);
        group.add(gm);
      }
    }
  });

  const bannerText = cfg.occasion === "Custom" && cfg.customName ? cfg.customName : cfg.bannerText;
  if (cfg.showBanner && bannerText) {
    // Use accent color for the topper
    const topperColor = new THREE.Color(cfg.accentColor);

    // Two pointed sticks going DOWN into the cake
    const stickMat = new THREE.MeshStandardMaterial({ color: topperColor, roughness: 0.3, metalness: 0.1 });
    const stickH = 0.7;
    const stickR = 0.028;
    const stickSpacing = 0.58;

    [-stickSpacing, stickSpacing].forEach((sx) => {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(stickR, stickR * 0.3, stickH, 8), stickMat);
      stick.position.set(sx * topScale, topY + 0.02, 0);
      stick.castShadow = true; group.add(stick);
    });

    // Acrylic topper canvas — transparent bg, bold colored text arched upward
    const W = 1024, H = 420;
    const fc = document.createElement("canvas"); fc.width = W; fc.height = H;
    const fx = fc.getContext("2d");
    fx.clearRect(0, 0, W, H);

    const label = bannerText.length > 18 ? bannerText.slice(0, 16) + "…" : bannerText;

    // Parse accent color to CSS
    const r = Math.round(topperColor.r * 255);
    const g = Math.round(topperColor.g * 255);
    const b = Math.round(topperColor.b * 255);
    const colorStr = `rgb(${r},${g},${b})`;

    // Draw bold text along an arc path
    const words = label.split(" ");
    const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
    const line2 = words.slice(Math.ceil(words.length / 2)).join(" ");

    // Fit font size
    let fontSize = 148;
    fx.font = `900 ${fontSize}px system-ui, Arial Black, sans-serif`;
    const maxW = W - 40;
    const longestLine = line1.length >= line2.length ? line1 : line2;
    while (fx.measureText(longestLine).width > maxW && fontSize > 40) {
      fontSize -= 4;
      fx.font = `900 ${fontSize}px system-ui, Arial Black, sans-serif`;
    }

    const drawLine = (text, cy) => {
      // Dark outline for depth
      fx.strokeStyle = `rgba(${Math.max(0,r-60)},${Math.max(0,g-60)},${Math.max(0,b-60)},0.9)`;
      fx.lineWidth = fontSize * 0.12;
      fx.lineJoin = "round";
      fx.strokeText(text, W / 2, cy);
      // Main fill
      fx.fillStyle = colorStr;
      fx.fillText(text, W / 2, cy);
    };

    fx.textAlign = "center";
    fx.textBaseline = "middle";

    if (line2) {
      // Two lines — line1 slightly arched up, line2 slightly smaller below
      drawLine(line1, H * 0.32);
      let fontSize2 = Math.round(fontSize * 0.88);
      fx.font = `900 ${fontSize2}px system-ui, Arial Black, sans-serif`;
      while (fx.measureText(line2).width > maxW && fontSize2 > 30) {
        fontSize2 -= 4;
        fx.font = `900 ${fontSize2}px system-ui, Arial Black, sans-serif`;
      }
      drawLine(line2, H * 0.68);
    } else {
      drawLine(line1, H / 2);
    }

    const ft = new THREE.CanvasTexture(fc);
    const topperW = stickSpacing * 2 * topScale + 0.55;
    const topperH = topperW * (H / W);
    const fp = new THREE.Mesh(
      new THREE.PlaneGeometry(topperW, topperH),
      new THREE.MeshBasicMaterial({ map: ft, transparent: true, side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.05 })
    );
    fp.position.set(0, topY + topperH * 0.52, 0.01);
    group.add(fp);
  }

  group.position.y = 0.07;
  group._pedestalOffset = 0.38; // used by AR to lift cake onto pedestal
  return group;
}

function disposeCake(cake, scene) {
  if (!cake || !scene) return;
  scene.remove(cake);
  cake.traverse((c) => {
    if (c.geometry) c.geometry.dispose();
    if (c.material) {
      if (Array.isArray(c.material)) c.material.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
      else { if (c.material.map) c.material.map.dispose(); c.material.dispose(); }
    }
  });
}

function addLights(scene, dark) {
  if (dark) {
    // Warm studio / AR-style lighting — bright, clean
    scene.add(new THREE.AmbientLight(0xfff8f0, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(4, 10, 6); key.castShadow = true;
    key.shadow.mapSize.width = 2048; key.shadow.mapSize.height = 2048;
    key.shadow.camera.near = 0.1; key.shadow.camera.far = 40;
    key.shadow.camera.left = -6; key.shadow.camera.right = 6;
    key.shadow.camera.top = 8; key.shadow.camera.bottom = -2;
    key.shadow.bias = -0.001; scene.add(key);
    const fill = new THREE.DirectionalLight(0xffe8d8, 0.8);
    fill.position.set(-5, 5, -3); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffd0b0, 0.5);
    rim.position.set(0, 3, -6); scene.add(rim);
    const bottom = new THREE.DirectionalLight(0xfff0e8, 0.25);
    bottom.position.set(0, -3, 2); scene.add(bottom);
  } else {
    scene.add(new THREE.AmbientLight(dark ? 0x445588 : 0xfff8f0, dark ? 0.65 : 0.75));
    const d = new THREE.DirectionalLight(0xffffff, dark ? 2.2 : 1.5);
    d.position.set(4, 9, 5); d.castShadow = true;
    d.shadow.mapSize.width = 2048; d.shadow.mapSize.height = 2048;
    d.shadow.camera.near = 0.1; d.shadow.camera.far = 40;
    d.shadow.camera.left = -6; d.shadow.camera.right = 6;
    d.shadow.camera.top = 8; d.shadow.camera.bottom = -2;
    d.shadow.bias = -0.001; scene.add(d);
    const f = new THREE.DirectionalLight(dark ? 0x5577ff : 0xffe8d0, dark ? 0.6 : 0.4);
    f.position.set(-5, 4, -3); scene.add(f);
  }
}

const goldBtn = { width: 34, height: 34, borderRadius: "50%", border: "none", background: AC, color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const plainBtn = { width: 34, height: 34, borderRadius: "50%", border: "1.5px solid #e8ddd0", background: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };

export default function App() {
  const [cfg, setCfg] = useState({
    shape: "circle", layers: 2, frostColor: "#FFD1DC", accentColor: "#C8A2C8",
    texture: "smooth", decorations: [], bannerText: "Happy Birthday!", occasion: "Birthday", customName: "", showBanner: true,
    tierColors: ["#FFD1DC", "#C8F0C8", "#C8E0FF", "#FFF0C8"],
  });
  const [tab, setTab] = useState("Shape");
  const [arOpen, setArOpen] = useState(false);
  const [arLoading, setArLoading] = useState(false);
  const [arMode, setArMode] = useState("move"); // "move" | "rotate"
  const [saveOpen, setSaveOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const mainWrapRef = useRef(null);
  const mainCanvasRef = useRef(null);
  const mainSceneRef = useRef(null);
  const mainRendererRef = useRef(null);
  const mainCameraRef = useRef(null);
  const mainCakeRef = useRef(null);
  const mainAnimRef = useRef(null);

  const arBodyRef = useRef(null);
  const arCanvasRef = useRef(null);
  const arSceneRef = useRef(null);
  const arRendererRef = useRef(null);
  const arCameraRef = useRef(null);
  const arCakeRef = useRef(null);
  const arAnimRef = useRef(null);
  const arReadyRef = useRef(false);
  const arRotYRef = useRef(0.4);
  const arRotXRef = useRef(0.22);
  const arZoomRef = useRef(4.5);
  const arPanXRef = useRef(0);
  const arPanYRef = useRef(0);
  const arModeRef = useRef("move"); // "move" | "rotate"
  const isDragRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const pinchDistRef = useRef(0);
  // Camera feed for AR background
  const arVideoRef = useRef(null);
  const arCamStreamRef = useRef(null);
  // WebXR surface detection refs
  const xrSessionRef = useRef(null);
  const xrHitTestSourceRef = useRef(null);
  const xrReticleRef = useRef(null);
  const xrCakePlacedRef = useRef(false);
  const [xrSupported, setXrSupported] = useState(false);
  const [xrMode, setXrMode] = useState(false);
  const [xrPlaced, setXrPlaced] = useState(false);

  // Init main 3D scene
  useEffect(() => {
    const timer = setTimeout(() => {
      const wrap = mainWrapRef.current;
      const canvas = mainCanvasRef.current;
      if (!wrap || !canvas) return;
      const W = wrap.offsetWidth || 420;
      const H = wrap.offsetHeight || 280;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#F5ECD7");
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
      camera.position.set(0, 2.2, 5.5); camera.lookAt(0, 0.8, 0);
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
      renderer.setSize(W, H, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      addLights(scene, false);
      const cake = buildCake(cfg);
      scene.add(cake);
      mainSceneRef.current = scene;
      mainRendererRef.current = renderer;
      mainCameraRef.current = camera;
      mainCakeRef.current = cake;

      let mDrag = false, mLX = 0, mLY = 0, mRY = 0.3, mRX = 0.15;
      canvas.addEventListener("mousedown", (e) => { mDrag = true; mLX = e.clientX; mLY = e.clientY; canvas.style.cursor = "grabbing"; });
      window.addEventListener("mousemove", (e) => {
        if (!mDrag) return;
        mRY += (e.clientX - mLX) * 0.01;
        mRX = Math.max(-0.2, Math.min(0.6, mRX + (e.clientY - mLY) * 0.008));
        mLX = e.clientX; mLY = e.clientY;
        if (mainCakeRef.current) { mainCakeRef.current.rotation.y = mRY; mainCakeRef.current.rotation.x = mRX; }
      });
      window.addEventListener("mouseup", () => { mDrag = false; canvas.style.cursor = "grab"; });
      const loop = () => {
        mainAnimRef.current = requestAnimationFrame(loop);
        if (!mDrag && mainCakeRef.current) mainCakeRef.current.rotation.y += 0.004;
        renderer.render(scene, camera);
      };
      loop();
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  // Rebuild cake when config changes
  useEffect(() => {
    if (!mainSceneRef.current) return;
    disposeCake(mainCakeRef.current, mainSceneRef.current);
    const cake = buildCake(cfg);
    mainSceneRef.current.add(cake);
    mainCakeRef.current = cake;
  }, [cfg]);

  // Check WebXR hit-test support
  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-ar").then((supported) => {
        setXrSupported(supported);
      }).catch(() => setXrSupported(false));
    }
  }, []);

  const startWebXR = async () => {
    if (!navigator.xr) return;
    try {
      const canvas = arCanvasRef.current;
      const scene = arSceneRef.current;
      const renderer = arRendererRef.current;
      if (!canvas || !scene || !renderer) return;

      // Enable WebXR on renderer
      renderer.xr.enabled = true;

      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay"],
        domOverlay: { root: document.getElementById("ar-overlay") },
      });
      xrSessionRef.current = session;
      renderer.xr.setSession(session);

      // Build reticle ring to show surface detection
      const reticleGeo = new THREE.RingGeometry(0.12, 0.16, 32).rotateX(-Math.PI / 2);
      const reticleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
      const reticle = new THREE.Mesh(reticleGeo, reticleMat);
      reticle.visible = false;
      scene.add(reticle);
      xrReticleRef.current = reticle;
      xrCakePlacedRef.current = false;
      setXrPlaced(false);

      // Get hit test source
      const viewerSpace = await session.requestReferenceSpace("viewer");
      const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
      xrHitTestSourceRef.current = hitTestSource;

      setXrMode(true);

      // XR render loop
      renderer.setAnimationLoop((timestamp, frame) => {
        if (!frame) return;
        const refSpace = renderer.xr.getReferenceSpace();
        const hitResults = frame.getHitTestResults(hitTestSource);
        if (hitResults.length > 0) {
          const hit = hitResults[0];
          const pose = hit.getPose(refSpace);
          if (pose) {
            reticle.visible = true;
            reticle.matrix.fromArray(pose.transform.matrix);
            reticle.matrix.decompose(reticle.position, reticle.quaternion, reticle.scale);
          }
        } else {
          reticle.visible = false;
        }
        renderer.render(scene, renderer.xr.getCamera());
      });

      // Tap to place cake on surface
      session.addEventListener("select", () => {
        if (xrReticleRef.current?.visible) {
          if (arSceneRef.current && xrCakePlacedRef.current === false) {
            const cake = buildCake(cfg);
            cake.position.copy(xrReticleRef.current.position);
            cake.scale.setScalar(0.4); // scale down for real world
            arSceneRef.current.add(cake);
            xrCakePlacedRef.current = true;
            setXrPlaced(true);
          }
        }
      });

      session.addEventListener("end", () => {
        setXrMode(false);
        setXrPlaced(false);
        xrHitTestSourceRef.current = null;
        xrSessionRef.current = null;
        renderer.setAnimationLoop(null);
        renderer.xr.enabled = false;
        if (xrReticleRef.current) {
          scene.remove(xrReticleRef.current);
          xrReticleRef.current = null;
        }
      });
    } catch (err) {
      console.error("WebXR error:", err);
    }
  };

  const stopWebXR = () => {
    if (xrSessionRef.current) {
      xrSessionRef.current.end().catch(() => {});
    }
  };

  const stopArCamera = () => {
    arCamStreamRef.current?.getTracks().forEach((t) => t.stop());
    arCamStreamRef.current = null;
  };

  const openAR = () => {
    setArOpen(true);
    setArLoading(true);
    arReadyRef.current = false;
    isDragRef.current = false;
    cancelAnimationFrame(arAnimRef.current);
    // Start rear camera feed
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: "environment" } } })
      .catch(() => navigator.mediaDevices.getUserMedia({ video: true }))
      .then((stream) => {
        arCamStreamRef.current = stream;
        if (arVideoRef.current) {
          arVideoRef.current.srcObject = stream;
          arVideoRef.current.play().catch(() => {});
        }
      })
      .catch((err) => console.warn("Camera denied:", err))
      .finally(() => setTimeout(() => tryInitAR(0), 300));
  };

  const tryInitAR = (attempt) => {
    const body = arBodyRef.current;
    const canvas = arCanvasRef.current;
    if (!body || !canvas) {
      if (attempt < 15) { setTimeout(() => tryInitAR(attempt + 1), 100); return; }
      setArLoading(false); return;
    }
    const W = body.offsetWidth;
    const H = body.offsetHeight;
    if (W < 10 || H < 10) {
      if (attempt < 15) { setTimeout(() => tryInitAR(attempt + 1), 100); return; }
      setArLoading(false); return;
    }
    try {
      if (arRendererRef.current) {
        try { arRendererRef.current.dispose(); } catch (e) { console.error(e); }
      }

      // Three.js scene — transparent so live camera shows through
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
      camera.position.set(0, 0, arZoomRef.current);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setSize(W, H, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = false;
      renderer.setClearColor(0x000000, 0); // fully transparent

      // Lights
      scene.add(new THREE.AmbientLight(0xfff8f0, 1.1));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(4, 10, 6); scene.add(key);
      const fill = new THREE.DirectionalLight(0xffe8d8, 0.7); fill.position.set(-4, 5, -3); scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffd0b0, 0.4); rim.position.set(0, 3, -5); scene.add(rim);

      // Build cake — centered, floating above camera surface
      const shadowDisc = new THREE.Mesh(
        new THREE.CircleGeometry(1.3, 48),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18, depthWrite: false })
      );
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.set(0, -1.05, 0);
      scene.add(shadowDisc);

      const cake = buildCake(cfg);
      cake.position.set(arPanXRef.current, arPanYRef.current, 0);
      scene.add(cake);

      arSceneRef.current = scene;
      arRendererRef.current = renderer;
      arCameraRef.current = camera;
      arCakeRef.current = cake;
      arReadyRef.current = true;

      // ── Interactions ──
      // Mouse: drag moves or rotates cake depending on mode
      canvas.addEventListener("mousedown", (e) => {
        isDragRef.current = true;
        lastXRef.current = e.clientX; lastYRef.current = e.clientY;
        canvas.style.cursor = "grabbing"; e.preventDefault();
      });
      window.addEventListener("mousemove", (e) => {
        if (!isDragRef.current) return;
        const dx = e.clientX - lastXRef.current;
        const dy = e.clientY - lastYRef.current;
        if (arModeRef.current === "rotate") {
          arRotYRef.current += dx * 0.014;
          arRotXRef.current += dy * 0.01;
          arRotXRef.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 2.5, arRotXRef.current));
        } else {
          // Move cake in world space relative to zoom distance
          const scale = arZoomRef.current * 0.003;
          arPanXRef.current += dx * scale;
          arPanYRef.current -= dy * scale;
        }
        lastXRef.current = e.clientX; lastYRef.current = e.clientY;
      });
      window.addEventListener("mouseup", () => { isDragRef.current = false; canvas.style.cursor = "grab"; });

      // Scroll zoom
      canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        arZoomRef.current = Math.max(2.0, Math.min(9, arZoomRef.current + e.deltaY * 0.005));
        arCameraRef.current.position.set(0, 0, arZoomRef.current);
        arCameraRef.current.lookAt(0, 0, 0);
      }, { passive: false });

      // Touch: single finger moves or rotates, two-finger pinch zooms
      canvas.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
          isDragRef.current = true;
          lastXRef.current = e.touches[0].clientX; lastYRef.current = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
          isDragRef.current = false;
          pinchDistRef.current = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      }, { passive: true });
      canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragRef.current) {
          const dx = e.touches[0].clientX - lastXRef.current;
          const dy = e.touches[0].clientY - lastYRef.current;
          if (arModeRef.current === "rotate") {
            arRotYRef.current += dx * 0.014;
            arRotXRef.current += dy * 0.01;
            arRotXRef.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 2.5, arRotXRef.current));
          } else {
            const scale = arZoomRef.current * 0.003;
            arPanXRef.current += dx * scale;
            arPanYRef.current -= dy * scale;
          }
          lastXRef.current = e.touches[0].clientX; lastYRef.current = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
          const d = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          arZoomRef.current = Math.max(2.0, Math.min(9, arZoomRef.current - (d - pinchDistRef.current) * 0.018));
          pinchDistRef.current = d;
          arCameraRef.current.position.set(0, 0, arZoomRef.current);
          arCameraRef.current.lookAt(0, 0, 0);
        }
      }, { passive: false });
      canvas.addEventListener("touchend", () => { isDragRef.current = false; });

      setArLoading(false);
      cancelAnimationFrame(arAnimRef.current);
      const loop = () => {
        if (!arReadyRef.current) return;
        arAnimRef.current = requestAnimationFrame(loop);
        if (arCakeRef.current) {
          arCakeRef.current.rotation.y = arRotYRef.current;
          arCakeRef.current.rotation.x = arRotXRef.current;
          arCakeRef.current.position.x = arPanXRef.current;
          arCakeRef.current.position.y = arPanYRef.current;
        }
        try { renderer.render(scene, camera); } catch (e) { console.error(e); }
      };
      loop();
    } catch (initErr) {
      console.error("AR init error:", initErr);
      if (attempt < 6) setTimeout(() => tryInitAR(attempt + 1), 150);
      else setArLoading(false);
    }
  };

  const resetArPosition = () => {
    arPanXRef.current = 0;
    arPanYRef.current = 0;
    arRotYRef.current = 0;
    arRotXRef.current = 0;
  };

  const closeAR = () => {
    stopWebXR();
    stopArCamera();
    setArOpen(false);
    setArMode("move");
    setXrMode(false);
    setXrPlaced(false);
    cancelAnimationFrame(arAnimRef.current);
    isDragRef.current = false;
    arReadyRef.current = false;
    arPanXRef.current = 0;
    arPanYRef.current = 0;
    arModeRef.current = "move";
  };

  const resetAll = () => {
    setCfg({ shape: "circle", layers: 2, frostColor: "#FFD1DC", accentColor: "#C8A2C8", texture: "smooth", decorations: [], bannerText: "Happy Birthday!", occasion: "Birthday", customName: "", showBanner: true, tierColors: ["#FFD1DC", "#C8F0C8", "#C8E0FF", "#FFF0C8"] });
    arReadyRef.current = false;
    if (arRendererRef.current) {
      try { arRendererRef.current.dispose(); } catch (disposeErr) { console.error(disposeErr); }
      arRendererRef.current = null;
    }
  };

  const setOcc = (id) => {
    setCfg((prev) => ({ ...prev, occasion: id, ...(id !== "Custom" ? { bannerText: DEFAULTS[id] || "", customName: "" } : {}) }));
  };

  const bannerDisplay = cfg.occasion === "Custom" ? cfg.customName : cfg.bannerText;
  const occasionLabel = cfg.occasion === "Custom" && cfg.customName ? cfg.customName : cfg.occasion;

  return (
    <Layout>
      <div style={{ maxWidth: 420, width: "100%", background: "#fff8f2", minHeight: 600, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", borderRadius: 16, border: "1px solid #f0e0d0", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #f0e0d0", background: "#fff", flexShrink: 0 }}>
          <div style={{ fontSize: 22 }}>🎂</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setScanOpen(true)} style={plainBtn} title="Scan Cake">📷</button>
            <button onClick={openAR} style={goldBtn} title="3D View">👓</button>
            <button onClick={resetAll} style={plainBtn} title="Reset">↩️</button>
            <button onClick={() => setSaveOpen(true)} style={goldBtn} title="Save">💾</button>
          </div>
        </div>

        {/* 3D Canvas */}
        <div ref={mainWrapRef} style={{ position: "relative", height: 280, overflow: "hidden", background: "#F5ECD7", flexShrink: 0 }}>
          <canvas ref={mainCanvasRef} style={{ width: "100%", height: "100%", display: "block", cursor: "grab" }} />
          <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.85)", borderRadius: 20, padding: "5px 12px", fontSize: 12, color: "#888", pointerEvents: "none" }}>
            Drag to rotate · Scroll to zoom
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1.5px solid #f0e0d0", padding: "0 4px", flexShrink: 0, background: "#fff" }}>
          {["Shape", "Colors", "Decor", "Occasion"].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "11px 2px", border: "none", background: "none", fontSize: 12, cursor: "pointer", borderBottom: tab === t ? `2.5px solid ${AC}` : "2.5px solid transparent", marginBottom: -1.5, color: tab === t ? AC : "#888", fontWeight: tab === t ? 700 : 500 }}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", background: "#fff8f2" }}>
          {tab === "Shape" && (
            <>
              <PanelSection title="Cake Shape">
                <ShapeSelector value={cfg.shape} onChange={(v) => setCfg((p) => ({ ...p, shape: v }))} />
              </PanelSection>
              <PanelSection title="Tiers">
                <LayerSlider value={cfg.layers} onChange={(v) => setCfg((p) => ({ ...p, layers: v }))} />
              </PanelSection>
              <PanelSection title="Texture">
                <TextureSelector value={cfg.texture} onChange={(v) => setCfg((p) => ({ ...p, texture: v }))} />
              </PanelSection>
            </>
          )}
          {tab === "Colors" && (
            <>
              <PanelSection title="Tier Colors">
                {Array.from({ length: cfg.layers }).map((_, i) => (
                  <ColorPalette
                    key={i}
                    label={`Tier ${i + 1}${i === 0 ? " (Bottom)" : i === cfg.layers - 1 ? " (Top)" : ""}`}
                    value={cfg.tierColors?.[i] ?? cfg.frostColor}
                    onChange={(v) => {
                      const next = [...(cfg.tierColors ?? ["#FFD1DC","#C8F0C8","#C8E0FF","#FFF0C8"])];
                      next[i] = v;
                      setCfg((p) => ({ ...p, tierColors: next }));
                    }}
                  />
                ))}
              </PanelSection>
              <div style={{ marginTop: 8 }}>
                <ColorPalette label="Accent Color" value={cfg.accentColor} onChange={(v) => setCfg((p) => ({ ...p, accentColor: v }))} />
              </div>
            </>
          )}
          {tab === "Decor" && (
            <PanelSection title="Decorations">
              <DecorationPanel value={cfg.decorations} onChange={(v) => setCfg((p) => ({ ...p, decorations: v }))} />
            </PanelSection>
          )}
          {tab === "Occasion" && (
            <PanelSection title="Occasion">
              <OccasionSelector
                value={cfg.occasion}
                onChange={setOcc}
                bannerText={cfg.bannerText}
                onBannerTextChange={(v) => setCfg((p) => ({ ...p, bannerText: v }))}
                customName={cfg.customName}
                onCustomNameChange={(v) => setCfg((p) => ({ ...p, customName: v }))}
              />
              {/* Banner toggle */}
              <div style={{ marginTop: 16, padding: "14px", background: "#fff", borderRadius: 14, border: "1.5px solid #f0e0d0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: cfg.showBanner ? 12 : 0 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>🎀 Cake Banner</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Stick banner on top of cake</div>
                  </div>
                  {/* Toggle switch */}
                  <div
                    onClick={() => setCfg((p) => ({ ...p, showBanner: !p.showBanner }))}
                    style={{
                      width: 44, height: 24, borderRadius: 12, cursor: "pointer", position: "relative", transition: "background 0.2s",
                      background: cfg.showBanner ? AC : "#ddd",
                    }}
                  >
                    <div style={{
                      position: "absolute", top: 3, left: cfg.showBanner ? 23 : 3,
                      width: 18, height: 18, borderRadius: "50%", background: "#fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s",
                    }} />
                  </div>
                </div>
                {cfg.showBanner && (
                  <input
                    type="text"
                    value={cfg.occasion === "Custom" ? cfg.customName || "" : cfg.bannerText}
                    onChange={(e) => cfg.occasion === "Custom"
                      ? setCfg((p) => ({ ...p, customName: e.target.value }))
                      : setCfg((p) => ({ ...p, bannerText: e.target.value }))
                    }
                    placeholder="Banner text..."
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 10,
                      border: `1.5px solid ${AC}50`, background: AL,
                      fontSize: 13, fontWeight: 600, color: "#333",
                      outline: "none", fontStyle: "italic",
                    }}
                  />
                )}
              </div>
            </PanelSection>
          )}
        </div>

        {/* Bottom Bar */}
        <div style={{ padding: "10px 14px", borderTop: "1px solid #f0e0d0", background: "#fff", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ padding: "3px 8px", borderRadius: 20, fontSize: 10, background: AL, color: AC, fontWeight: 600 }}>{occasionLabel}</span>
            {[
              `${cfg.layers} tier`,
              cfg.shape,
              cfg.texture,
              bannerDisplay ? `"${bannerDisplay.slice(0, 12)}${bannerDisplay.length > 12 ? "…" : ""}"` : null,
              cfg.decorations.length > 0 ? `${cfg.decorations.length} decos` : null,
            ].filter(Boolean).map((p, i) => (
              <span key={i} style={{ padding: "3px 8px", borderRadius: 20, fontSize: 10, background: "#f5f5f5", color: "#555" }}>{p}</span>
            ))}
          </div>
          <button onClick={() => setSaveOpen(true)} style={{ width: "100%", padding: 11, borderRadius: 10, background: AC, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            💾 Save Design
          </button>
        </div>

        {/* AR Screen */}
        {arOpen && (
          <div style={{ position: "absolute", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", background: "#000", borderRadius: 16 }}>
            {/* Top bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
              <button onClick={closeAR} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#fff" }}>✕ Exit</button>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>✨ 3D View</div>
              <button onClick={resetArPosition} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#fff" }}>⟳ Reset</button>
            </div>

            {/* 3D canvas */}
            <div ref={arBodyRef} style={{ flex: 1, position: "relative", overflow: "hidden", background: "#000" }}>
              {/* Live camera feed — always visible as background */}
              <video
                ref={arVideoRef}
                autoPlay
                playsInline
                muted
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
              />
              {/* Three.js canvas — transparent, cake renders on top of camera */}
              <canvas ref={arCanvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", cursor: "grab", touchAction: "none", zIndex: 2 }} />

              {/* WebXR DOM overlay — shown during XR session */}
              <div id="ar-overlay" style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
                {xrMode && (
                  <div style={{ position: "absolute", bottom: 100, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, pointerEvents: "auto" }}>
                    {!xrPlaced ? (
                      <div style={{ background: "rgba(0,0,0,0.6)", borderRadius: 20, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
                        📡 Move phone slowly to detect surface<br/>
                        <span style={{ fontSize: 11, opacity: 0.7 }}>Tap when the ring appears to place your cake</span>
                      </div>
                    ) : (
                      <div style={{ background: "rgba(0,0,0,0.6)", borderRadius: 20, padding: "10px 20px", color: "#4caf50", fontSize: 13, fontWeight: 700 }}>
                        ✅ Cake placed on surface!
                      </div>
                    )}
                    <button
                      onClick={stopWebXR}
                      style={{ background: "rgba(201,123,58,0.9)", border: "none", borderRadius: 20, padding: "10px 24px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                    >Exit Surface AR</button>
                  </div>
                )}
              </div>

              {/* WebXR launch button — only if supported */}
              {xrSupported && !xrMode && !arLoading && (
                <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 8 }}>
                  <button
                    onClick={startWebXR}
                    style={{
                      background: "linear-gradient(135deg, #C97B3A, #e8913f)",
                      border: "none", borderRadius: 24, padding: "12px 28px",
                      color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      boxShadow: "0 4px 20px rgba(201,123,58,0.5)",
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>🌐</span> Place on Surface
                  </button>
                </div>
              )}

              {arLoading && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", zIndex: 15 }}>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>🎂</div>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Starting camera...</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 6 }}>Point at a flat surface</div>
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div style={{ padding: "10px 14px 14px", background: "rgba(0,0,0,0.4)", borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
              {/* Move / Rotate toggle */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 10 }}>
                {[{ id: "move", label: "✋ Move" }, { id: "rotate", label: "🔄 Rotate" }].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => { setArMode(id); arModeRef.current = id; }}
                    style={{
                      flex: 1, padding: "8px 0", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
                      background: arMode === id ? AC : "rgba(255,255,255,0.1)",
                      color: arMode === id ? "#fff" : "rgba(255,255,255,0.55)",
                      transition: "all 0.2s",
                    }}
                  >{label}</button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
                {xrSupported
                  ? (arMode === "move" ? "Drag to move · Scroll/Pinch to zoom · Tap 🌐 for surface AR" : "Drag to rotate 360° · Scroll / Pinch to zoom")
                  : (arMode === "move" ? "Drag to move cake · Scroll / Pinch to zoom" : "Drag to rotate 360° · Scroll / Pinch to zoom")
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {saveOpen && <SaveDesignModal config={cfg} onClose={() => setSaveOpen(false)} onSaved={() => setSaveOpen(false)} />}
      {scanOpen && <CakeScanModal onClose={() => setScanOpen(false)} onShapeDetected={(shape) => { setCfg((p) => ({ ...p, shape })); setScanOpen(false); }} />}
    </Layout>
  );
}