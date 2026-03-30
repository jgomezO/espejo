import { EMOTIONS } from "../../utils/emotions.js";

export const GROWTH_LABELS = ["Brote", "Creciendo", "Madura", "Florecida"];

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        Math.min(255, Math.max(0, Math.round(v)))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

export function lightenColor(hex, amount = 40) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
}

function toStemColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  // Shift toward olive green (#6A7A4A = 106,122,74)
  return rgbToHex(
    Math.round(r * 0.25 + 106 * 0.75),
    Math.round(g * 0.25 + 122 * 0.75),
    Math.round(b * 0.25 + 74 * 0.75)
  );
}

// Growth 0: Brote — short stem, two tiny emerging leaves
function SproutPlant({ stemColor }) {
  return (
    <>
      <line x1="0" y1="0" x2="0" y2="-18" stroke={stemColor} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 0,-10 Q -7,-14 -4,-18" fill="none" stroke={stemColor} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 0,-10 Q 7,-14 4,-18" fill="none" stroke={stemColor} strokeWidth="1.5" strokeLinecap="round" />
    </>
  );
}

// Growth 1: Creciendo — taller curved stem, 2 leaves, closed bud
function GrowingPlant({ color, stemColor }) {
  return (
    <>
      <path d="M 0,0 Q 3,-18 0,-36" stroke={stemColor} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 0,-14 Q -10,-20 -8,-28" fill={stemColor} fillOpacity="0.45" stroke={stemColor} strokeWidth="0.8" />
      <path d="M 1,-22 Q 10,-28 8,-35" fill={stemColor} fillOpacity="0.45" stroke={stemColor} strokeWidth="0.8" />
      <ellipse cx="1" cy="-40" rx="3.5" ry="6" fill={color} />
      <ellipse cx="1" cy="-43" rx="2" ry="3" fill={lightenColor(color, 30)} />
    </>
  );
}

// Growth 2: Madura — tall stem, 3 leaves with veins, 5-petal opening flower
function MaturePlant({ color, lightColor, stemColor }) {
  return (
    <>
      <path d="M 0,0 Q 4,-28 1,-56" stroke={stemColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Leaves */}
      <path d="M 0,-18 Q -11,-26 -9,-36" fill={stemColor} fillOpacity="0.55" stroke={stemColor} strokeWidth="0.7" />
      <line x1="-4" y1="-22" x2="-7" y2="-26" stroke={stemColor} strokeOpacity="0.4" strokeWidth="0.6" />
      <path d="M 1,-30 Q 11,-38 9,-48" fill={stemColor} fillOpacity="0.55" stroke={stemColor} strokeWidth="0.7" />
      <line x1="5" y1="-34" x2="7" y2="-40" stroke={stemColor} strokeOpacity="0.4" strokeWidth="0.6" />
      <path d="M 0,-24 Q -13,-30 -11,-42" fill={stemColor} fillOpacity="0.45" stroke={stemColor} strokeWidth="0.6" />
      {/* 5-petal flower */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`rotate(${i * 72}, 1, -60)`}>
          <ellipse cx="1" cy="-70" rx="5" ry="9" fill={color} opacity="0.85" />
        </g>
      ))}
      <circle cx="1" cy="-60" r="4.5" fill={lightColor} />
      <circle cx="1" cy="-60" r="2.5" fill={lightenColor(color, 60)} />
    </>
  );
}

// Growth 3: Florecida — tall elegant stem, 5 rich leaves, 8-petal full flower + glow
function BloomedPlant({ color, lightColor, stemColor, delay }) {
  return (
    <>
      <path d="M 0,0 Q 5,-40 2,-78" stroke={stemColor} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* 5 rich leaves */}
      <path d="M 1,-18 Q -13,-28 -11,-40" fill={stemColor} fillOpacity="0.6" stroke={stemColor} strokeWidth="0.8" />
      <line x1="-5" y1="-24" x2="-8" y2="-30" stroke={stemColor} strokeOpacity="0.4" strokeWidth="0.7" />
      <path d="M 1,-32 Q 13,-42 11,-54" fill={stemColor} fillOpacity="0.6" stroke={stemColor} strokeWidth="0.8" />
      <line x1="6" y1="-38" x2="8" y2="-46" stroke={stemColor} strokeOpacity="0.4" strokeWidth="0.7" />
      <path d="M 0,-26 Q -14,-34 -12,-48" fill={stemColor} fillOpacity="0.5" stroke={stemColor} strokeWidth="0.7" />
      <path d="M 1,-50 Q 13,-60 11,-70" fill={stemColor} fillOpacity="0.55" stroke={stemColor} strokeWidth="0.7" />
      <line x1="6" y1="-55" x2="8" y2="-62" stroke={stemColor} strokeOpacity="0.35" strokeWidth="0.6" />
      <path d="M 0,-44 Q -14,-52 -12,-66" fill={stemColor} fillOpacity="0.45" stroke={stemColor} strokeWidth="0.6" />
      {/* Glow */}
      <circle cx="2" cy="-82" r="18" fill={color} opacity="0.07">
        <animate attributeName="opacity" values="0.07;0.14;0.07" dur="2.5s" repeatCount="indefinite" />
      </circle>
      {/* 8 petals, alternating colors */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i} transform={`rotate(${i * 45}, 2, -82)`}>
          <ellipse cx="2" cy="-93" rx="5" ry="11" fill={i % 2 === 0 ? color : lightColor} opacity="0.9">
            <animate
              attributeName="opacity"
              values="0;0.9"
              begin={`${delay + 0.5 + i * 0.06}s`}
              dur="0.3s"
              fill="freeze"
            />
          </ellipse>
        </g>
      ))}
      <circle cx="2" cy="-82" r="5.5" fill={lightColor} />
      <circle cx="2" cy="-82" r="3" fill={lightenColor(color, 70)} />
    </>
  );
}

export default function IsometricPlant({
  emotion,
  growth,
  screenX,
  screenY,
  isSelected,
  delay = 0,
}) {
  const emotionData = EMOTIONS.find((e) => e.id === emotion) ?? EMOTIONS[0];
  const color = emotionData.color;
  const lightColor = lightenColor(color, 40);
  const stemColor = toStemColor(color);

  // Deterministic sway speed per plant (3.5–5.5s)
  const swayDur = 3.5 + (((screenX * 7 + screenY * 13) % 20) / 10);
  const shadowRx = [6, 9, 12, 15][growth];
  const shadowRy = Math.round(shadowRx * 0.42);

  return (
    // Outer group: static position
    <g transform={`translate(${screenX}, ${screenY})`}>
      {/* Entrance wrapper: starts invisible, fades in + slides up */}
      <g opacity="0">
        <animate
          attributeName="opacity"
          values="0;1"
          begin={`${delay}s`}
          dur="0.5s"
          fill="freeze"
          calcMode="spline"
          keySplines="0.2 0 0.2 1"
          keyTimes="0;1"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          from="0,10"
          to="0,0"
          begin={`${delay}s`}
          dur="0.5s"
          fill="freeze"
          calcMode="spline"
          keySplines="0.2 0 0.2 1"
          keyTimes="0;1"
        />

        {/* Shadow at base */}
        <ellipse cx="0" cy="5" rx={shadowRx} ry={shadowRy} fill="black" opacity="0.09" />

        {/* Selection ring */}
        {isSelected && (
          <circle
            cx="0"
            cy="4"
            r={shadowRx + 5}
            fill="none"
            stroke="#8B7CF8"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.75"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-28"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* Swaying plant body */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 0 0;0.8 0 0;0 0 0;-0.6 0 0;0 0 0"
            begin={`${delay + 0.5}s`}
            dur={`${swayDur}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
            keyTimes="0;0.25;0.5;0.75;1"
          />
          {growth === 0 && <SproutPlant stemColor={stemColor} />}
          {growth === 1 && <GrowingPlant color={color} stemColor={stemColor} />}
          {growth === 2 && (
            <MaturePlant color={color} lightColor={lightColor} stemColor={stemColor} />
          )}
          {growth === 3 && (
            <BloomedPlant
              color={color}
              lightColor={lightColor}
              stemColor={stemColor}
              delay={delay}
            />
          )}
        </g>
      </g>
    </g>
  );
}
