import { GROWTH_LABELS } from "./IsometricPlant.jsx";

const STEM_COLOR = "#6A7A4A";
const BUD_COLOR = "#8B7CF8";
const FLOWER_COLOR = "#8B7CF8";
const LIGHT_COLOR = "#B4A8FF";

// Simplified static mini-plants for the legend (no animations)
function MiniSprout() {
  return (
    <svg width="28" height="40" viewBox="-14 -38 28 42" overflow="visible">
      <line x1="0" y1="0" x2="0" y2="-16" stroke={STEM_COLOR} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 0,-9 Q -5,-12 -3,-16" fill="none" stroke={STEM_COLOR} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M 0,-9 Q 5,-12 3,-16" fill="none" stroke={STEM_COLOR} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function MiniGrowing() {
  return (
    <svg width="28" height="52" viewBox="-14 -48 28 52" overflow="visible">
      <path d="M 0,0 Q 2,-14 0,-28" stroke={STEM_COLOR} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 0,-11 Q -7,-15 -5,-21" fill={STEM_COLOR} fillOpacity="0.45" stroke={STEM_COLOR} strokeWidth="0.7" />
      <path d="M 1,-17 Q 7,-21 6,-27" fill={STEM_COLOR} fillOpacity="0.45" stroke={STEM_COLOR} strokeWidth="0.7" />
      <ellipse cx="0" cy="-31" rx="3" ry="4.5" fill={BUD_COLOR} />
    </svg>
  );
}

function MiniMature() {
  return (
    <svg width="32" height="64" viewBox="-16 -60 32 64" overflow="visible">
      <path d="M 0,0 Q 3,-21 1,-42" stroke={STEM_COLOR} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 0,-14 Q -8,-20 -7,-28" fill={STEM_COLOR} fillOpacity="0.5" stroke={STEM_COLOR} strokeWidth="0.6" />
      <path d="M 1,-23 Q 8,-29 7,-37" fill={STEM_COLOR} fillOpacity="0.5" stroke={STEM_COLOR} strokeWidth="0.6" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`rotate(${i * 72}, 1, -45)`}>
          <ellipse cx="1" cy="-52" rx="4" ry="7" fill={FLOWER_COLOR} opacity="0.85" />
        </g>
      ))}
      <circle cx="1" cy="-45" r="3.5" fill={LIGHT_COLOR} />
    </svg>
  );
}

function MiniBloomed() {
  return (
    <svg width="36" height="80" viewBox="-18 -78 36 82" overflow="visible">
      <path d="M 0,0 Q 4,-30 2,-58" stroke={STEM_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 0,-14 Q -10,-22 -9,-32" fill={STEM_COLOR} fillOpacity="0.55" stroke={STEM_COLOR} strokeWidth="0.6" />
      <path d="M 1,-26 Q 10,-34 9,-44" fill={STEM_COLOR} fillOpacity="0.55" stroke={STEM_COLOR} strokeWidth="0.6" />
      <path d="M 0,-20 Q -11,-27 -10,-38" fill={STEM_COLOR} fillOpacity="0.45" stroke={STEM_COLOR} strokeWidth="0.6" />
      <circle cx="2" cy="-62" r="13" fill={FLOWER_COLOR} opacity="0.06" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i} transform={`rotate(${i * 45}, 2, -62)`}>
          <ellipse cx="2" cy="-71" rx="4" ry="8.5" fill={i % 2 === 0 ? FLOWER_COLOR : LIGHT_COLOR} opacity="0.9" />
        </g>
      ))}
      <circle cx="2" cy="-62" r="4" fill={LIGHT_COLOR} />
      <circle cx="2" cy="-62" r="2.2" fill="white" />
    </svg>
  );
}

const ITEMS = [
  { label: "Reflexión corta", Mini: MiniSprout },
  { label: "6 capas", Mini: MiniGrowing },
  { label: "Con chat", Mini: MiniMature },
  { label: "Completa", Mini: MiniBloomed },
];

export default function GrowthLegend() {
  return (
    <div style={{ padding: "0 16px" }}>
      <p
        style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          color: "#94A3B8",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          margin: "0 0 10px",
        }}
      >
        Estados de crecimiento
      </p>
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
        {ITEMS.map(({ label, Mini }, i) => (
          <div
            key={label}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
          >
            <Mini />
            <span
              style={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: 10,
                color: "#64748B",
                fontWeight: 600,
                textAlign: "center",
                maxWidth: 60,
                lineHeight: 1.3,
              }}
            >
              {GROWTH_LABELS[i]}
            </span>
            <span
              style={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: 9,
                color: "#94A3B8",
                textAlign: "center",
                maxWidth: 60,
                lineHeight: 1.2,
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
