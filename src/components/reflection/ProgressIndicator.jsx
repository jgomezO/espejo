import { motion } from "framer-motion";

const LAYER_LABELS = ["Narrativa", "Emoción", "Resonancia", "Patrón", "Relación", "Insight"];

export default function ProgressIndicator({ currentLayer, total = 6 }) {
  const progress = ((currentLayer) / total) * 100;

  return (
    <div className="progress-indicator">
      <div className="progress-bar-track">
        <motion.div
          className="progress-bar-fill"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        />
      </div>
      <div className="progress-labels">
        {LAYER_LABELS.map((label, i) => (
          <span
            key={label}
            className={`progress-dot ${i < currentLayer ? "done" : ""} ${i === currentLayer ? "current" : ""}`}
            aria-label={label}
          />
        ))}
      </div>
      <p className="progress-step">
        {currentLayer < total ? `${LAYER_LABELS[currentLayer]} · ${currentLayer + 1} de ${total}` : "Resumen"}
      </p>
    </div>
  );
}
