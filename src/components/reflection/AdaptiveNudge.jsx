import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { callClaude } from "../../services/anthropicService.js";
import { NUDGE_SYSTEM_PROMPT, buildNudgePrompt } from "../../utils/prompts.js";

const TIMEOUT_MS = 3000;
const BREATH_DURATION = 30; // seconds

export default function AdaptiveNudge({ layerName, layerData, previousLayers, onContinue, onSkip }) {
  const [question, setQuestion] = useState(null);
  const [displayed, setDisplayed] = useState("");
  const [breathing, setBreathing] = useState(false);
  const [breathSeconds, setBreathSeconds] = useState(BREATH_DURATION);
  const timeoutRef = useRef(null);
  const breathRef = useRef(null);

  useEffect(() => {
    // Auto-skip if API takes too long
    timeoutRef.current = setTimeout(() => {
      if (!question) onSkip();
    }, TIMEOUT_MS);

    callClaude({
      system: NUDGE_SYSTEM_PROMPT,
      userMessage: buildNudgePrompt(layerName, layerData, previousLayers),
      maxTokens: 80,
    }).then((text) => {
      clearTimeout(timeoutRef.current);
      if (!text) { onSkip(); return; }
      setQuestion(text.trim());
    });

    return () => clearTimeout(timeoutRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Typing effect for the question
  useEffect(() => {
    if (!question) return;
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(question.slice(0, i + 1));
      i++;
      if (i >= question.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [question]);

  // Breathing countdown
  useEffect(() => {
    if (!breathing) return;
    setBreathSeconds(BREATH_DURATION);
    breathRef.current = setInterval(() => {
      setBreathSeconds((s) => {
        if (s <= 1) {
          clearInterval(breathRef.current);
          setBreathing(false);
          onContinue();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(breathRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breathing]);

  if (!question) {
    return (
      <div className="nudge-loading">
        <motion.div
          className="nudge-loading-dot"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="nudge-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="nudge-content">
        <p className="nudge-label">Un momento antes de continuar</p>
        <p className="nudge-question" aria-live="polite">{displayed}</p>
      </div>

      <AnimatePresence mode="wait">
        {breathing ? (
          <motion.div
            key="breath"
            className="nudge-breath"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="nudge-breath-circles">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="nudge-breath-circle"
                  animate={{ scale: [1, 1.3 + i * 0.15, 1], opacity: [0.6, 0.2, 0.6] }}
                  transition={{ repeat: Infinity, duration: 4, delay: i * 0.4, ease: "easeInOut" }}
                />
              ))}
              <span className="nudge-breath-count">{breathSeconds}</span>
            </div>
            <p className="nudge-breath-label">Respira</p>
            <button className="btn-back" onClick={() => { setBreathing(false); onContinue(); }}>
              Continuar
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            className="nudge-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              className="btn-nudge-breath"
              onClick={() => setBreathing(true)}
            >
              Quiero pensarlo un momento
            </button>
            <button className="btn-nudge-skip" onClick={onContinue}>
              Continuar →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
