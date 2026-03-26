import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Sprout, MessageCircle, RefreshCw } from "lucide-react";
import { generateMirrorSummary, processAIResponse } from "../../services/anthropicService.js";
import { saveReflection } from "../../services/storageService.js";
import { useReflection } from "../../hooks/useReflection.js";
import { EMOTIONS } from "../../utils/emotions.js";
import MirrorChat from "./MirrorChat.jsx";
import SafetyDisclaimer from "../safety/SafetyDisclaimer.jsx";
import TherapyBridge from "../safety/TherapyBridge.jsx";
import CrisisModal from "../crisis/CrisisModal.jsx";

export default function MirrorSummary({ reflection }) {
  const { setAiSummary, reset } = useReflection();
  const navigate = useNavigate();

  const [mirror, setMirror] = useState(reflection.aiSummary || null);
  const [therapyQuestions, setTherapyQuestions] = useState(reflection.therapyQuestions || []);
  const [streamingText, setStreamingText] = useState(reflection.aiSummary || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [savedReflection, setSavedReflection] = useState(reflection);
  const [crisisOpen, setCrisisOpen] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setStreamingText("");
    setMirror(null);

    const result = await generateMirrorSummary(reflection, (chunk) => {
      // Try to extract mirror text from partial JSON for streaming display
      const match = chunk.match(/"mirror"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      if (match) setStreamingText(match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'));
    });

    setLoading(false);

    if (result) {
      const processed = processAIResponse(result.mirror);
      setMirror(processed.text);
      setStreamingText(processed.text);
      if (processed.triggerCrisisModal) setCrisisOpen(true);
      setTherapyQuestions(result.therapyQuestions);
      setAiSummary(processed.text);
      const updated = {
        ...reflection,
        aiSummary: processed.text,
        therapyQuestions: result.therapyQuestions,
        completed: true,
      };
      await saveReflection(updated);
      setSavedReflection(updated);
    } else {
      setError(true);
      await saveReflection({ ...reflection, completed: true });
    }
  };

  useEffect(() => {
    if (!mirror) generate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const primaryEmotion = EMOTIONS.find((e) => e.id === reflection.layers.emotion.primary);

  const handleFinish = () => {
    reset();
    navigate("/");
  };

  if (showChat) {
    return <MirrorChat reflection={savedReflection} onClose={handleFinish} />;
  }

  return (
    <motion.div
      className="mirror-summary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="mirror-header">
        <div className="mirror-icon"><Sparkles size={42} strokeWidth={1.5} /></div>
        <h1 className="mirror-title">Tu espejo</h1>
        <p className="mirror-subtitle">Lo que tu reflexión revela</p>
      </div>

      {primaryEmotion && (
        <div className="mirror-emotion-badge" style={{ "--emotion-color": primaryEmotion.color }}>
          <primaryEmotion.Icon size={14} strokeWidth={2} /> {primaryEmotion.label}
          <span className="mirror-intensity"> · {reflection.layers.emotion.intensity}/10</span>
        </div>
      )}

      <div className="mirror-content">
        {loading && !streamingText && (
          <div className="mirror-loading">
            <div className="mirror-breathing-circles">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="mirror-breath-circle"
                  animate={{ scale: [1, 1.4 + i * 0.15, 1], opacity: [0.5, 0.15, 0.5] }}
                  transition={{ repeat: Infinity, duration: 3.5, delay: i * 0.5, ease: "easeInOut" }}
                />
              ))}
            </div>
            <p>Tu espejo se está formando...</p>
          </div>
        )}

        {error && !mirror && (
          <div className="mirror-error">
            <p>No pudimos generar tu reflejo en este momento.</p>
            <p className="mirror-error-sub">Tu reflexión ha sido guardada. Puedes intentarlo de nuevo.</p>
            <button className="btn-retry" onClick={generate}><RefreshCw size={14} strokeWidth={2.5} /> Reintentar</button>
          </div>
        )}

        {streamingText && (
          <motion.div
            className="mirror-text ai-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            aria-live="polite"
          >
            {streamingText}
            {loading && <span className="mirror-cursor">▌</span>}
          </motion.div>
        )}
      </div>

      {!loading && mirror && <SafetyDisclaimer variant="A" />}
      {!loading && mirror && reflection.layers.emotion.intensity >= 8 && <TherapyBridge />}
      <CrisisModal isOpen={crisisOpen} onClose={() => setCrisisOpen(false)} />

      <AnimatePresence>
        {therapyQuestions.length > 0 && !loading && (
          <motion.div
            className="therapy-questions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="therapy-questions-header">
              <span className="therapy-questions-icon"><Sprout size={18} strokeWidth={2} /></span>
              <h2 className="therapy-questions-title">Para llevar a terapia</h2>
            </div>
            <p className="therapy-questions-subtitle">
              Preguntas que podrían ser fértiles explorar con tu terapeuta
            </p>
            <ol className="therapy-questions-list">
              {therapyQuestions.map((q, i) => (
                <motion.li
                  key={i}
                  className="therapy-question-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                >
                  <div className="therapy-question-body">
                    <span className="therapy-question-text">{q.question ?? q}</span>
                    {q.example && <span className="therapy-question-example">{q.example}</span>}
                  </div>
                </motion.li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && (mirror || error) && (
        <motion.div
          className="mirror-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {mirror && (
            <Button
              className="btn-chat"
              onPress={() => setShowChat(true)}
              size="lg"
              variant="bordered"
            >
              <MessageCircle size={18} strokeWidth={2} /> Conversar con mi reflejo
            </Button>
          )}
          <Button className="btn-continue" onPress={handleFinish} size="lg">
            Guardar y cerrar
          </Button>
          <button className="btn-back" onClick={() => navigate("/history")}>
            Ver historial
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
