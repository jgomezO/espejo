import { EMOTIONS } from "../../utils/emotions.js";
import { calculateGrowth } from "./IsometricGarden.jsx";

const TILE_W = 18;
const TILE_H = 9;

function miniIsoToScreen(row, col, originX, originY) {
  return {
    x: originX + (col - row) * (TILE_W / 2),
    y: originY + (col + row) * (TILE_H / 2),
  };
}

function miniTilePath(x, y) {
  return `M ${x},${y - TILE_H / 2} L ${x + TILE_W / 2},${y} L ${x},${y + TILE_H / 2} L ${x - TILE_W / 2},${y} Z`;
}

export default function GardenMiniPreview({ reflections, width = 120 }) {
  const GRID = 5;
  const svgW = width;
  const originX = (GRID - 1) * (TILE_W / 2) + TILE_W / 2 + 4;
  const originY = 16;
  const svgH = originY + (GRID - 1) * TILE_H + TILE_H / 2 + 6;

  const cells = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const idx = row * GRID + col;
      const reflection = idx < reflections.length ? reflections[idx] : null;
      const { x, y } = miniIsoToScreen(row, col, originX, originY);
      cells.push({ row, col, x, y, reflection });
    }
  }
  cells.sort((a, b) => a.row + a.col - (b.row + b.col));

  return (
    <svg
      viewBox={`0 0 ${originX * 2} ${svgH}`}
      width={width}
      height={svgH * (width / (originX * 2))}
      style={{ display: "block" }}
    >
      {cells.map(({ row, col, x, y, reflection }) => {
        const planted = !!reflection;
        let dotColor = null;
        if (planted) {
          const emotionId =
            reflection.layers?.emotion?.selected?.[0]?.id ??
            reflection.layers?.emotion?.primary;
          const emotion = EMOTIONS.find((e) => e.id === emotionId);
          dotColor = emotion?.color ?? "#8B7CF8";
        }
        return (
          <g key={`${row}-${col}`}>
            <path
              d={miniTilePath(x, y)}
              fill={planted ? "#C8BB9F" : "#D8CEBD"}
              opacity={planted ? 0.9 : 0.55}
              stroke={planted ? "#B8A892" : "#C8BFB0"}
              strokeWidth="0.3"
            />
            {planted && dotColor && (
              <circle cx={x} cy={y - 5} r="3.5" fill={dotColor} opacity="0.9" />
            )}
          </g>
        );
      })}
    </svg>
  );
}
