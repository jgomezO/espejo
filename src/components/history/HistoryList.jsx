import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getReflections } from "../../services/storageService.js";
import { EMOTIONS } from "../../utils/emotions.js";
import ReflectionDetail from "./ReflectionDetail.jsx";
import PatternAnalysis from "./PatternAnalysis.jsx";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function HistoryList() {
  const [selected, setSelected] = useState(null);
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReflections()
      .then((data) => setReflections(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (selected) {
    return (
      <ReflectionDetail
        reflection={selected}
        onBack={() => setSelected(null)}
        onDelete={(id) => {
          setReflections((prev) => prev.filter((r) => r.id !== id));
          setSelected(null);
        }}
      />
    );
  }

  return (
    <div className="history-screen">
      <div className="history-header">
        <h1 className="screen-title">Historial</h1>
        <p className="screen-subtitle">
          {!loading && reflections.length > 0
            ? `${reflections.length} reflexión${reflections.length !== 1 ? "es" : ""}`
            : ""}
        </p>
      </div>

      {!loading && <PatternAnalysis reflections={reflections} />}

      {loading ? (
        <div className="history-empty">
          <p style={{ fontStyle: "italic", color: "var(--color-text-soft)" }}>Cargando...</p>
        </div>
      ) : reflections.length === 0 ? (
        <div className="history-empty">
          <p>Aún no tienes reflexiones guardadas.</p>
          <p className="history-empty-sub">Cuando completes una, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="history-list">
          <AnimatePresence>
            {reflections.map((r, i) => {
              const emotionId = r.layers.emotion.selected?.[0]?.id ?? r.layers.emotion.primary;
              const emotion = EMOTIONS.find((e) => e.id === emotionId);
              return (
                <motion.button
                  key={r.id}
                  className="history-item"
                  onClick={() => setSelected(r)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  aria-label={`Reflexión del ${formatDate(r.createdAt)}`}
                >
                  <div className="history-item-left">
                    {emotion && (
                      <span
                        className="history-emotion-dot"
                        style={{ background: emotion.color }}
                        aria-hidden="true"
                      >
                        <emotion.Icon size={18} color="white" strokeWidth={1.8} />
                      </span>
                    )}
                  </div>
                  <div className="history-item-content">
                    <div className="history-item-top">
                      <span className="history-date">{formatDate(r.createdAt)}</span>
                      {emotion && (
                        <span className="history-emotion-label" style={{ color: emotion.color }}>
                          {emotion.label}
                        </span>
                      )}
                    </div>
                    <p className="history-narrative">
                      {((r.layers.narrative.whatBringsYou || r.layers.narrative.situation || "").slice(0, 90))}
                      {(r.layers.narrative.whatBringsYou || r.layers.narrative.situation || "").length > 90 ? "..." : ""}
                    </p>
                  </div>
                  <span className="history-arrow">›</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
