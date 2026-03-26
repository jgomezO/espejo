import { motion } from "framer-motion";

export default function LayerCard({ title, subtitle, children, onNext, onBack, disableNext }) {
  return (
    <motion.div
      className="layer-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="layer-card-content">
        <h1 className="layer-title">{title}</h1>
        <p className="layer-subtitle">{subtitle}</p>
        <div className="layer-fields">{children}</div>
      </div>
      <div className="layer-actions">
        {onBack && (
          <button className="btn-back" onClick={onBack} aria-label="Atrás">
            ← Atrás
          </button>
        )}
        <button
          className="btn-continue"
          onClick={onNext}
          disabled={disableNext}
          aria-label="Continuar"
        >
          Continuar →
        </button>
      </div>
    </motion.div>
  );
}
