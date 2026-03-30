import { EMOTIONS } from "../../utils/emotions.js";

export default function GardenColors({ reflections }) {
  const plantedIds = new Set(
    reflections
      .map(
        (r) =>
          r.layers?.emotion?.selected?.[0]?.id ??
          r.layers?.emotion?.primary
      )
      .filter(Boolean)
  );

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
        Territorio explorado
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {EMOTIONS.map(({ id, label, color, Icon }) => {
          const active = plantedIds.has(id);
          return (
            <div
              key={id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 20,
                background: active ? `${color}1A` : "#F0F4F8",
                border: `1px solid ${active ? color + "55" : "#E2EBF4"}`,
                transition: "all 0.2s",
                opacity: active ? 1 : 0.55,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: active ? color : "#CBD5E0",
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  color: active ? color : "#94A3B8",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      {plantedIds.size === 0 && (
        <p
          style={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: 12,
            color: "#94A3B8",
            textAlign: "center",
            marginTop: 8,
          }}
        >
          Completa reflexiones para explorar emociones
        </p>
      )}
    </div>
  );
}
