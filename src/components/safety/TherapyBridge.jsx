import { useState } from "react";
import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import { LEGAL } from "../../utils/legalTexts.js";

const SESSION_KEY = "espejo_therapyBridgeSeen";

export default function TherapyBridge() {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true"
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "true");
    setDismissed(true);
  };

  return (
    <motion.div
      className="therapy-bridge"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <div className="therapy-bridge-header">
        <Sprout size={20} strokeWidth={2} />
        <h3 className="therapy-bridge-title">{LEGAL.therapyBridgeTitle}</h3>
      </div>
      <p className="therapy-bridge-body">{LEGAL.therapyBridgeBody}</p>
      <div className="therapy-bridge-actions">
        <button className="btn-therapy-export" disabled>
          Exportar reflexión · Próximamente
        </button>
        <button className="btn-therapy-dismiss" onClick={handleDismiss}>
          Ahora no
        </button>
      </div>
    </motion.div>
  );
}
