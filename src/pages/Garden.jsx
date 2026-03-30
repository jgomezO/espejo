import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import { getReflections } from "../services/storageService.js";
import IsometricGarden, { calculateGrowth } from "../components/garden/IsometricGarden.jsx";
import GardenStats from "../components/garden/GardenStats.jsx";
import GrowthLegend from "../components/garden/GrowthLegend.jsx";
import GardenColors from "../components/garden/GardenColors.jsx";

function computeGridSize(n) {
  return Math.max(5, Math.ceil(Math.sqrt(n + 5)));
}

export default function Garden() {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const all = await getReflections();
        if (cancelled) return;
        const completed = [...all]
          .filter((r) => r.completed)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setReflections(completed);
      } catch {
        // fall through with empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const LIMIT = 50;
  const displayed = showAll ? reflections : reflections.slice(0, LIMIT);
  const gridSize = computeGridSize(displayed.length);
  const totalSlots = gridSize * gridSize;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        minHeight: "100%",
        paddingBottom: 24,
        background: "var(--gradient-bg)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 20px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "linear-gradient(135deg, #7BC87A 0%, #4A9A49 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Sprout size={20} color="white" strokeWidth={2} />
        </div>
        <div>
          <h1
            style={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--color-text)",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Tu jardín interior
          </h1>
          <p
            style={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 13,
              color: "var(--color-text-soft)",
              margin: 0,
            }}
          >
            Cada reflexión completa planta una semilla
          </p>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
            color: "var(--color-text-soft)",
            fontFamily: "'Quicksand', sans-serif",
            fontSize: 14,
          }}
        >
          Cargando jardín…
        </div>
      ) : reflections.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
          <h2
            style={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--color-text)",
              margin: "0 0 8px",
            }}
          >
            Tu jardín está esperando
          </h2>
          <p
            style={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 14,
              color: "var(--color-text-soft)",
              lineHeight: 1.6,
            }}
          >
            Completa tu primera reflexión para plantar la primera semilla.
          </p>
        </motion.div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Garden SVG */}
          <div
            style={{
              padding: "4px 12px 0",
            }}
          >
            <IsometricGarden reflections={displayed} />
          </div>

          {/* Stats */}
          <GardenStats reflections={displayed} totalSlots={totalSlots} />

          {/* Show more button */}
          {!showAll && reflections.length > LIMIT && (
            <div style={{ textAlign: "center", padding: "0 16px" }}>
              <button
                onClick={() => setShowAll(true)}
                style={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#4A9A49",
                  background: "none",
                  border: "1px solid #4A9A49",
                  borderRadius: 20,
                  padding: "8px 20px",
                  cursor: "pointer",
                }}
              >
                Ver jardín completo ({reflections.length} plantas)
              </button>
            </div>
          )}

          {/* Growth legend */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "16px 0",
              margin: "0 12px",
              boxShadow: "0 2px 8px rgba(26,40,60,0.07)",
            }}
          >
            <GrowthLegend />
          </div>

          {/* Emotion colors */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "16px 0",
              margin: "0 12px",
              boxShadow: "0 2px 8px rgba(26,40,60,0.07)",
            }}
          >
            <GardenColors reflections={reflections} />
          </div>

          {/* Footer note */}
          <p
            style={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 12,
              color: "#94A3B8",
              textAlign: "center",
              padding: "0 24px",
              lineHeight: 1.6,
            }}
          >
            Tu jardín crece automáticamente con cada reflexión completada. Es un reflejo de tu proceso interior.
          </p>
        </div>
      )}
    </motion.div>
  );
}
