import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { callClaude } from "../../services/anthropicService.js";
import { DAILY_PROMPT_SYSTEM_PROMPT, buildDailyPromptRequest } from "../../utils/prompts.js";
import { getDailyPrompt } from "../../utils/dailyPrompts.js";
import { getReflections } from "../../services/storageService.js";

const today = new Date().toISOString().slice(0, 10);
const CACHE_KEY = `espejo_dailyPrompt_${today}`;
const MAX_REGEN = 3;

function getCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); } catch { return null; }
}
function setCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

export default function DailyPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [regenCount, setRegenCount] = useState(0);

  const loadPrompt = async (force = false) => {
    const cache = getCache();
    if (!force && cache) {
      setPrompt(cache.text);
      setRegenCount(cache.regenCount || 0);
      return;
    }

    const reflections = await getReflections();
    const request = buildDailyPromptRequest(reflections);

    if (!request) {
      const fallback = getDailyPrompt();
      setPrompt(fallback);
      return;
    }

    const result = await callClaude({
      system: DAILY_PROMPT_SYSTEM_PROMPT,
      userMessage: request,
      maxTokens: 60,
    });

    const text = result?.trim() || getDailyPrompt();
    const newCount = force ? regenCount + 1 : 0;
    setPrompt(text);
    setRegenCount(newCount);
    setCache({ text, regenCount: newCount });
  };

  useEffect(() => { loadPrompt(); }, []);

  const handleRegen = () => {
    if (regenCount >= MAX_REGEN) return;
    loadPrompt(true);
  };

  if (!prompt) return <div className="daily-prompt daily-prompt-loading" />;

  return (
    <motion.div
      className="daily-prompt"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.8 }}
    >
      <p className="daily-prompt-label">Pregunta del día</p>
      <p className="daily-prompt-text">"{prompt}"</p>
      {regenCount < MAX_REGEN && (
        <button className="daily-prompt-regen" onClick={handleRegen} aria-label="Otra pregunta">
          <RefreshCw size={13} strokeWidth={2.5} /> Otra pregunta
        </button>
      )}
    </motion.div>
  );
}
