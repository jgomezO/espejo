import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useUserContext } from "../../context/UserContext.jsx";
import { useReflection } from "../../hooks/useReflection.js";
import { getReflections } from "../../services/storageService.js";
import { EMOTIONS } from "../../utils/emotions.js";
import DailyPrompt from "./DailyPrompt.jsx";
import CrisisModal from "../crisis/CrisisModal.jsx";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function HomeScreen() {
  const { state: user } = useUserContext();
  const { start } = useReflection();
  const navigate = useNavigate();
  const reflections = getReflections();
  const [crisisOpen, setCrisisOpen] = useState(false);
  const last = reflections[0];
  const lastEmotionId = last?.layers.emotion.selected?.[0]?.id ?? last?.layers.emotion.primary;
  const lastEmotion = lastEmotionId ? EMOTIONS.find((e) => e.id === lastEmotionId) : null;

  const handleStart = () => {
    start();
    navigate("/reflect");
  };

  return (
    <div className="home-screen">
      <motion.div
        className="home-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="home-mirror-icon"><Sparkles size={44} strokeWidth={1.5} /></div>
        <h1 className="home-greeting">
          {user.name ? `Hola, ${user.name}` : "Hola"}
        </h1>
        <p className="home-tagline">¿Cómo estás en este momento?</p>
      </motion.div>

      {user.dailyPromptEnabled && <DailyPrompt />}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Button
          className="btn-start"
          size="lg"
          onPress={handleStart}
          aria-label="Iniciar reflexión"
        >
          Iniciar reflexión
        </Button>
      </motion.div>

      <motion.div
        className="home-stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {reflections.length > 0 && (
          <p className="home-count">
            {`Llevas ${reflections.length} reflexión${reflections.length !== 1 ? "es" : ""}`}
          </p>
        )}

        {last && (
          <div className="home-last-card" onClick={() => navigate("/history")} role="button" tabIndex={0}>
            <div className="home-last-date">{formatDate(last.createdAt)}</div>
            {lastEmotion && (
              <div className="home-last-emotion" style={{ "--emotion-color": lastEmotion.color }}>
                <lastEmotion.Icon size={14} strokeWidth={2} /> {lastEmotion.label}
              </div>
            )}
            <p className="home-last-narrative">{(last.layers.narrative.whatBringsYou || last.layers.narrative.situation || "").slice(0, 80)}...</p>
          </div>
        )}
      </motion.div>
      <button className="btn-crisis-link" onClick={() => setCrisisOpen(true)}>
        ¿Necesitas ayuda? Recursos de crisis
      </button>
      <CrisisModal isOpen={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </div>
  );
}
