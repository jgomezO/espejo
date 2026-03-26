import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import { LEGAL, CRISIS_RESOURCES } from "../../utils/legalTexts.js";

export default function CrisisModal({ isOpen, onClose, userCountry = null }) {
  const resources = userCountry
    ? CRISIS_RESOURCES.filter((r) => r.country === userCountry || r.country === "Internacional")
    : CRISIS_RESOURCES;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="crisis-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="crisis-modal"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <h2 className="crisis-title">{LEGAL.crisisTitle}</h2>
            <p className="crisis-body">{LEGAL.crisisBody}</p>

            <div className="crisis-resources">
              {resources.map((r) => (
                <div key={r.name} className="crisis-resource-item">
                  <div className="crisis-resource-info">
                    <p className="crisis-resource-name">{r.name}</p>
                    <p className="crisis-resource-country">{r.country} · {r.available}</p>
                  </div>
                  <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="crisis-resource-phone">
                    <Phone size={14} strokeWidth={2} /> {r.phone}
                  </a>
                </div>
              ))}
            </div>

            <p className="crisis-emergency">{LEGAL.crisisEmergency}</p>

            <div className="crisis-actions">
              <button className="btn-crisis-continue" onClick={onClose}>
                Entendido, quiero seguir con mi reflexión
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
