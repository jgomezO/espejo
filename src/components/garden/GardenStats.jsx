import { calculateGrowth } from "./IsometricGarden.jsx";

export default function GardenStats({ reflections, totalSlots }) {
  const planted = reflections.length;
  const bloomed = reflections.filter((r) => calculateGrowth(r) === 3).length;
  const free = totalSlots - planted;

  const stats = [
    { value: `${planted}/${totalSlots}`, label: "Plantadas" },
    { value: `${bloomed}/${planted || 1}`, label: "Florecidas" },
    { value: `${Math.max(0, free)}`, label: "Espacios libres" },
  ];

  return (
    <div style={{ display: "flex", gap: 10, padding: "0 16px" }}>
      {stats.map(({ value, label }) => (
        <div
          key={label}
          style={{
            flex: 1,
            background: "#FFFFFF",
            borderRadius: 14,
            padding: "12px 8px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(26,40,60,0.07)",
            border: "1px solid #E2EBF4",
          }}
        >
          <div
            style={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#1A2435",
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {value}
          </div>
          <div
            style={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 10,
              color: "#94A3B8",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
