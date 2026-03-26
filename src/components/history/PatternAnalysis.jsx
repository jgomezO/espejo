import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw } from "lucide-react";
import { callClaudeStream } from "../../services/anthropicService.js";
import { PATTERN_ANALYSIS_SYSTEM_PROMPT, buildPatternAnalysisPrompt } from "../../utils/prompts.js";
import SafetyDisclaimer from "../safety/SafetyDisclaimer.jsx";
import TherapyBridge from "../safety/TherapyBridge.jsx";

const CACHE_KEY = "espejo_patternAnalysis";

function getCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); } catch { return null; }
}
function setCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

export default function PatternAnalysis({ reflections }) {
  const completed = reflections.filter((r) => {
    if (!r.completed) return false;
    const insight = r.layers.insight;
    if (insight && "_answers" in insight) return Object.keys(insight._answers || {}).length > 0;
    return !!insight?.mirror;
  });
  if (completed.length < 3) {
    return (
      <div className="pattern-analysis">
        <div className="pattern-banner pattern-banner--disabled">
          <span className="pattern-banner-icon"><Search size={22} strokeWidth={2} /></span>
          <div className="pattern-banner-text">
            <p className="pattern-banner-title">Análisis de patrones</p>
            <p className="pattern-banner-sub">
              Disponible cuando tengas 3 reflexiones completas ({completed.length}/3)
            </p>
          </div>
          <button className="btn-pattern-open" disabled>Ver patrones</button>
        </div>
      </div>
    );
  }

  const cache = getCache();
  const cacheValid = cache && cache.lastCount === completed.length;

  const [open, setOpen] = useState(false);
  const [text, setText] = useState(cacheValid ? cache.text : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(false);
    setText("");

    const result = await callClaudeStream({
      system: PATTERN_ANALYSIS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPatternAnalysisPrompt(completed) }],
      maxTokens: 700,
      onChunk: (chunk) => setText(chunk),
    });

    setLoading(false);
    if (result) {
      setCache({ text: result, lastCount: completed.length, generatedAt: Date.now() });
    } else {
      setError(true);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (!cacheValid && !text) generate();
  };

  return (
    <div className="pattern-analysis">
      {!open ? (
        <motion.div
          className="pattern-banner"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="pattern-banner-icon"><Search size={22} strokeWidth={2} /></span>
          <div className="pattern-banner-text">
            <p className="pattern-banner-title">Tienes {completed.length} reflexiones</p>
            <p className="pattern-banner-sub">¿Quieres ver qué patrones ha encontrado tu espejo?</p>
          </div>
          <button className="btn-pattern-open" onClick={handleOpen}>
            Ver patrones
          </button>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            className="pattern-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="pattern-card-header">
              <h2 className="pattern-card-title"><Search size={18} strokeWidth={2} /> Patrones en tu historia</h2>
              <button className="btn-back" style={{ width: "auto" }} onClick={() => setOpen(false)}>
                Cerrar
              </button>
            </div>

            {loading && !text && (
              <div className="mirror-loading">
                <motion.div
                  className="mirror-loading-dot"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <p>Analizando tus reflexiones...</p>
              </div>
            )}

            {error && !text && (
              <div className="mirror-error">
                <p>No pudimos generar el análisis en este momento.</p>
                <button className="btn-retry" onClick={generate}><RefreshCw size={14} strokeWidth={2.5} /> Reintentar</button>
              </div>
            )}

            {text && (
              <motion.div
                className="pattern-text ai-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                aria-live="polite"
              >
                {text}
                {loading && <span className="mirror-cursor">▌</span>}
              </motion.div>
            )}

            {!loading && text && (
              <button className="btn-retry" style={{ marginTop: "16px" }} onClick={generate}>
                <RefreshCw size={14} strokeWidth={2.5} /> Regenerar análisis
              </button>
            )}
            {!loading && text && <SafetyDisclaimer variant="A" />}
            {!loading && text && <TherapyBridge />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
