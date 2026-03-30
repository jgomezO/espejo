import { useState, useMemo } from "react";
import { EMOTIONS } from "../../utils/emotions.js";
import IsometricPlant, { GROWTH_LABELS } from "./IsometricPlant.jsx";
import ZoomableCanvas from "./ZoomableCanvas.jsx";

const TILE_W = 72;
const TILE_H = 36;
const SIDE_PAD = 22;
const TOP_PAD = 16;
const PLANT_AREA = 96;

// Compute SVG dimensions and grid origin
function computeLayout(gridSize) {
  const originX = (gridSize - 1) * (TILE_W / 2) + TILE_W / 2 + SIDE_PAD;
  const svgW = originX * 2;
  const originY = PLANT_AREA + TOP_PAD;
  const svgH = originY + (gridSize - 1) * TILE_H + TILE_H / 2 + TOP_PAD + 8;
  return { originX, originY, svgW, svgH };
}

function isoToScreen(row, col, originX, originY) {
  return {
    x: originX + (col - row) * (TILE_W / 2),
    y: originY + (col + row) * (TILE_H / 2),
  };
}

function tilePath(x, y) {
  return `M ${x},${y - TILE_H / 2} L ${x + TILE_W / 2},${y} L ${x},${y + TILE_H / 2} L ${x - TILE_W / 2},${y} Z`;
}

function TileDecorations({ x, y, row, col }) {
  const seed = row * 7 + col * 13;
  const hasPebble = seed % 3 === 0;
  const hasGrass = seed % 5 === 1;
  const px = x + ((seed % 5) - 2) * 2;
  return (
    <>
      {hasPebble && (
        <ellipse cx={px} cy={y + 3} rx="2.5" ry="1.4" fill="#B8A892" opacity="0.7" />
      )}
      {hasGrass && (
        <>
          <line
            x1={x - 3} y1={y + 3}
            x2={x - 5} y2={y - 3}
            stroke="#8A9A6A" strokeWidth="1" strokeLinecap="round" opacity="0.6"
          />
          <line
            x1={x + 5} y1={y + 2}
            x2={x + 7} y2={y - 4}
            stroke="#8A9A6A" strokeWidth="1" strokeLinecap="round" opacity="0.6"
          />
        </>
      )}
    </>
  );
}

function Tooltip({ reflection, emotion, growth, x, y, svgW, zoom = 1 }) {
  if (!reflection || !emotion) return null;
  const W = 170;
  const H = 86;
  // Clamp horizontally
  let tx = Math.max(4, Math.min(svgW - W - 4, x - W / 2));
  let ty = y - PLANT_AREA - 8;

  const snippet = (
    reflection.layers?.narrative?.whatBringsYou ||
    reflection.layers?.narrative?.situation ||
    ""
  ).slice(0, 60);

  const date = new Date(reflection.createdAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });

  const scaledW = W * zoom;
  const scaledH = (H + 20) * zoom;

  return (
    <foreignObject x={tx} y={ty} width={scaledW} height={scaledH}>
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        style={{
          transform: `scale(${1 / zoom})`,
          transformOrigin: "top left",
          width: W,
          background: "rgba(255,255,255,0.97)",
          border: "1px solid #E2EBF4",
          borderRadius: 14,
          padding: "10px 12px",
          boxShadow: "0 4px 20px rgba(26,40,60,0.13)",
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 12,
          lineHeight: 1.4,
          color: "#1A2435",
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: emotion.color,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <strong style={{ color: emotion.color, fontSize: 12 }}>{emotion.label}</strong>
          <span style={{ color: "#94A3B8", marginLeft: "auto", fontSize: 11 }}>{date}</span>
        </div>
        {snippet && (
          <p style={{ margin: "0 0 4px", color: "#4A5568", fontSize: 11 }}>
            {snippet}{snippet.length >= 60 ? "…" : ""}
          </p>
        )}
        <span
          style={{
            fontSize: 10,
            color: "#8B7CF8",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {GROWTH_LABELS[growth]}
        </span>
      </div>
    </foreignObject>
  );
}

export default function IsometricGarden({ reflections }) {
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(1);

  const gridSize = useMemo(
    () => Math.max(5, Math.ceil(Math.sqrt(reflections.length + 5))),
    [reflections.length]
  );

  const { originX, originY, svgW, svgH } = useMemo(
    () => computeLayout(gridSize),
    [gridSize]
  );

  // Build grid: assign reflections in row-major order
  const cells = useMemo(() => {
    const all = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const idx = row * gridSize + col;
        const reflection = idx < reflections.length ? reflections[idx] : null;
        const { x, y } = isoToScreen(row, col, originX, originY);
        all.push({ row, col, x, y, reflection });
      }
    }
    // Sort by row+col for correct iso depth order
    all.sort((a, b) => a.row + a.col - (b.row + b.col));
    return all;
  }, [gridSize, reflections, originX, originY]);

  // Find selected cell
  const selectedCell = cells.find(
    (c) => c.reflection?.id === selectedId
  );

  const selectedEmotion = selectedCell
    ? EMOTIONS.find(
        (e) =>
          e.id ===
          (selectedCell.reflection.layers?.emotion?.selected?.[0]?.id ??
            selectedCell.reflection.layers?.emotion?.primary)
      ) ?? null
    : null;

  const selectedGrowth = selectedCell
    ? calculateGrowth(selectedCell.reflection)
    : 0;

  // Stagger delay per planted cell (in order of reflections)
  const plantDelays = useMemo(() => {
    const map = {};
    let idx = 0;
    // Walk cells in order of assignment (row-major) to match reflection index
    const ordered = [...cells].sort(
      (a, b) => a.row * gridSize + a.col - (b.row * gridSize + b.col)
    );
    for (const cell of ordered) {
      if (cell.reflection) {
        map[cell.reflection.id] = idx * 0.08;
        idx++;
      }
    }
    return map;
  }, [cells, gridSize]);

  function handleTileClick(cell) {
    if (cell.reflection) {
      setSelectedId(cell.reflection.id === selectedId ? null : cell.reflection.id);
    } else {
      setSelectedId(null);
    }
  }

  return (
    <ZoomableCanvas
      viewBox={`0 0 ${svgW} ${svgH}`}
      minZoom={1}
      maxZoom={3}
      onZoomChange={setZoom}
    >
      <defs>
        {/* Soil background gradient */}
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EAE4D8" />
          <stop offset="100%" stopColor="#D5CCBC" />
        </linearGradient>
        {/* Ambient light overlay */}
        <radialGradient id="lightGrad" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor="rgba(255,252,245,0.22)" />
          <stop offset="100%" stopColor="rgba(255,252,245,0)" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width={svgW} height={svgH} fill="url(#bgGrad)" rx="0" />
      <rect x="0" y="0" width={svgW} height={svgH} fill="url(#lightGrad)" />

      {/* Render all tiles (sorted by row+col) */}
      {cells.map(({ row, col, x, y, reflection }) => {
        const isPlanted = !!reflection;
        const isSelected = reflection?.id === selectedId;

        return (
          <g
            key={`${row}-${col}`}
            style={{ cursor: isPlanted ? "pointer" : "default" }}
            onClick={() => handleTileClick({ row, col, x, y, reflection })}
          >
            {/* Tile face */}
            <path
              d={tilePath(x, y)}
              fill={isPlanted ? "#C8BB9F" : "#D8CEBD"}
              opacity={isPlanted ? 0.88 : 0.62}
              stroke={isPlanted ? "#B8A892" : "#C8BFB0"}
              strokeWidth="0.5"
            />

            {/* Decorations on empty tiles */}
            {!isPlanted && <TileDecorations x={x} y={y} row={row} col={col} />}

            {/* Dirt patch on planted tiles */}
            {isPlanted && (
              <ellipse cx={x} cy={y} rx="14" ry="7" fill="#B8A892" opacity="0.5" />
            )}

            {/* Empty tile hint text */}
            {!isPlanted && (
              <text
                x={x}
                y={y + 3}
                textAnchor="middle"
                fontSize="7"
                fill="#A09080"
                opacity="0"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                Próxima reflexión
              </text>
            )}
          </g>
        );
      })}

      {/* Render plants (same order = on top of their tiles, behind forward tiles) */}
      {cells
        .filter((c) => c.reflection)
        .map(({ row, col, x, y, reflection }) => {
          const emotionId =
            reflection.layers?.emotion?.selected?.[0]?.id ??
            reflection.layers?.emotion?.primary ??
            "tristeza";
          const growth = calculateGrowth(reflection);
          const isSelected = reflection.id === selectedId;
          const delay = plantDelays[reflection.id] ?? 0;

          return (
            <g
              key={`plant-${reflection.id}`}
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedId(reflection.id === selectedId ? null : reflection.id)}
            >
              <IsometricPlant
                emotion={emotionId}
                growth={growth}
                screenX={x}
                screenY={y}
                isSelected={isSelected}
                delay={delay}
              />
            </g>
          );
        })}

      {/* Tooltip for selected plant */}
      {selectedCell && (
        <Tooltip
          reflection={selectedCell.reflection}
          emotion={selectedEmotion}
          growth={selectedGrowth}
          x={selectedCell.x}
          y={selectedCell.y}
          svgW={svgW}
          zoom={zoom}
        />
      )}
    </ZoomableCanvas>
  );
}

export function calculateGrowth(reflection) {
  if (!reflection) return 0;
  let score = 0;
  const layers = reflection.layers || {};

  // Count completed layers (max 6)
  let layerCount = 0;
  if (layers.narrative?.whatBringsYou?.trim()) layerCount++;
  if ((layers.emotion?.selected?.length ?? 0) > 0) layerCount++;
  for (const key of ["resonance", "pattern", "relationship", "insight"]) {
    const l = layers[key];
    if (
      l?._answers &&
      Object.values(l._answers).some((v) => v && String(v).trim())
    )
      layerCount++;
  }

  if (layerCount >= 6) score += 2;
  else if (layerCount >= 3) score += 1;

  if (reflection.aiSummary) score += 1;
  if (reflection.hasChat) score += 1;

  // 0-1 → brote(0), 2 → creciendo(1), 3 → madura(2), 4+ → florecida(3)
  return Math.min(3, Math.max(0, score - 1));
}
