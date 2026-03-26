import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useReflection } from "../../hooks/useReflection.js";
import { useUserContext } from "../../context/UserContext.jsx";
import { useReflectionContext } from "../../context/ReflectionContext.jsx";
import { callClaude, generateLayerQuestions } from "../../services/anthropicService.js";
import { LAYER_QUESTIONS_SYSTEM_PROMPT } from "../../utils/prompts.js";
import { FALLBACK_QUESTIONS } from "../../utils/fallbackQuestions.js";
import ProgressIndicator from "./ProgressIndicator.jsx";
import LayerNarrative from "./LayerNarrative.jsx";
import LayerEmotion from "./LayerEmotion.jsx";
import AdaptiveLayerCard from "./AdaptiveLayerCard.jsx";
import AdaptiveNudge from "./AdaptiveNudge.jsx";
import MirrorSummary from "./MirrorSummary.jsx";
import SafetyDisclaimer from "../safety/SafetyDisclaimer.jsx";

const SESSION_KEY = "espejo_layer_questions";
const LAYER_KEYS = ["narrative", "emotion", "resonance", "pattern", "relationship", "insight"];
const ADAPTIVE_LAYERS = ["resonance", "pattern", "relationship", "insight"];
const NUDGE_KEYS = ["afterNarrative", "afterEmotion", "afterResonance", "afterPattern", "afterRelationship"];
const GENERATION_TIMEOUT_MS = 15000;

function getCachedQuestions() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}

function buildAIContext(layers) {
  const ctx = {};
  if (layers.narrative?.situation) ctx.narrative = layers.narrative;
  if (layers.emotion?.primary) ctx.emotion = layers.emotion;
  ["resonance", "pattern", "relationship"].forEach((k) => {
    const l = layers[k];
    if (l?._answers && Object.keys(l._answers).length > 0) ctx[k] = l._answers;
  });
  return ctx;
}

export default function ReflectionFlow() {
  const { current, isComplete, save } = useReflection();
  const { dispatch } = useReflectionContext();
  const { state: userPrefs } = useUserContext();
  const nudgesEnabled = userPrefs.nudgesEnabled !== false;

  const [step, setStep] = useState(0);
  const [pendingNudgeData, setPendingNudgeData] = useState(null);
  const [exampleQuestions, setExampleQuestions] = useState(getCachedQuestions);
  const [disclaimerSeen, setDisclaimerSeen] = useState(() => localStorage.getItem("espejo_disclaimerSeen") === "true");

  const [generatedQuestions, setGeneratedQuestions] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const generatedRef = useRef({});

  useEffect(() => { generatedRef.current = generatedQuestions; }, [generatedQuestions]);

  // Load example placeholders for layers 1–2
  useEffect(() => {
    if (exampleQuestions) return;
    callClaude({
      system: LAYER_QUESTIONS_SYSTEM_PROMPT,
      userMessage: "Genera un nuevo conjunto de ejemplos para los campos de reflexión.",
      maxTokens: 400,
    }).then((raw) => {
      try {
        const clean = (raw || "")
          .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
        const parsed = JSON.parse(clean);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
        setExampleQuestions(parsed);
      } catch {}
    }).catch(() => {});
  }, []);

  const prefetchLayer = (layerName, freshLayers) => {
    if (generatedRef.current[layerName]) return;
    setIsGenerating(true);
    const ctx = buildAIContext(freshLayers);
    const timeout = new Promise((resolve) => setTimeout(() => resolve(null), GENERATION_TIMEOUT_MS));

    Promise.race([generateLayerQuestions(layerName, ctx), timeout]).then((result) => {
      const questions = result || FALLBACK_QUESTIONS[layerName];
      setGeneratedQuestions((prev) => ({ ...prev, [layerName]: questions }));
      setIsGenerating(false);
    });
  };

  if (!current) return null;

  const isLayerStep = nudgesEnabled ? step % 2 === 0 : true;
  const layerIndex = nudgesEnabled ? Math.floor(step / 2) : step;
  const nudgeIndex = nudgesEnabled ? Math.floor((step - 1) / 2) : -1;
  const currentLayer = Math.min(layerIndex, 5);

  if (step >= (nudgesEnabled ? 11 : 6) || isComplete) {
    return (
      <div className="reflection-screen">
        <MirrorSummary reflection={current} />
      </div>
    );
  }

  const handleLayerNext = (layerKey, data) => {
    // Construir las capas con el dato fresco ANTES de despachar al contexto
    const freshLayers = {
      ...current.layers,
      [layerKey]: { ...current.layers[layerKey], ...data },
    };

    const updated = { ...current, layers: freshLayers };
    save(updated);
    dispatch({ type: "UPDATE_LAYER", layerKey, payload: data });
    dispatch({ type: "NEXT_LAYER" });

    // Pre-fetch inmediato del siguiente layer adaptativo con contexto fresco
    const currentIdx = LAYER_KEYS.indexOf(layerKey);
    const nextIdx = currentIdx + 1;
    if (nextIdx >= 2 && nextIdx <= 5) {
      prefetchLayer(LAYER_KEYS[nextIdx], freshLayers);
    }

    if (nudgesEnabled && layerIndex < 5) {
      const nudgeLayerData = ADAPTIVE_LAYERS.includes(layerKey) ? data._answers : data;
      setPendingNudgeData({ layerKey, layerData: nudgeLayerData });
      setStep(step + 1);
    } else {
      setStep(step + (nudgesEnabled ? 2 : 1));
    }
  };

  const handleNudgeDone = (nudgeQuestion) => {
    if (nudgeQuestion) {
      const key = NUDGE_KEYS[nudgeIndex];
      dispatch({ type: "SET_NUDGE", key, payload: nudgeQuestion });
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 0) return;
    dispatch({ type: "PREV_LAYER" });
    setStep(nudgesEnabled ? Math.max(0, step - 2) : Math.max(0, step - 1));
  };

  const layers = current.layers;

  const previousLayers = {};
  for (let i = 0; i < layerIndex && i < nudgeIndex + 1; i++) {
    previousLayers[LAYER_KEYS[i]] = layers[LAYER_KEYS[i]];
  }

  const renderAdaptiveLayer = (layerName) => (
    <AdaptiveLayerCard
      key={layerName}
      questions={generatedQuestions[layerName] || null}
      isLoading={isGenerating && !generatedQuestions[layerName]}
      onNext={(answers) =>
        handleLayerNext(layerName, {
          _questions: generatedQuestions[layerName],
          _answers: answers,
        })
      }
      onBack={handleBack}
    />
  );

  return (
    <div className="reflection-screen">
      {!disclaimerSeen && (
        <div className="reflection-disclaimer-screen">
          <SafetyDisclaimer variant="B" />
          <button className="btn-disclaimer-ok" onClick={() => {
            localStorage.setItem("espejo_disclaimerSeen", "true");
            setDisclaimerSeen(true);
          }}>
            Entendido, quiero comenzar
          </button>
        </div>
      )}
      {disclaimerSeen && (
      <>
      <ProgressIndicator currentLayer={currentLayer} total={6} />
      <AnimatePresence mode="wait">
        {nudgesEnabled && !isLayerStep ? (
          <AdaptiveNudge
            key={`nudge-${nudgeIndex}`}
            layerName={LAYER_KEYS[nudgeIndex]}
            layerData={pendingNudgeData?.layerData || layers[LAYER_KEYS[nudgeIndex]]}
            previousLayers={previousLayers}
            onContinue={() => handleNudgeDone(null)}
            onSkip={() => handleNudgeDone(null)}
          />
        ) : (
          <>
            {currentLayer === 0 && (
              <LayerNarrative
                key="narrative"
                initialData={layers.narrative}
                questions={exampleQuestions?.narrative}
                onNext={(data) => handleLayerNext("narrative", data)}
              />
            )}
            {currentLayer === 1 && (
              <LayerEmotion
                key="emotion"
                initialData={layers.emotion}
                questions={exampleQuestions?.emotion}
                onNext={(data) => handleLayerNext("emotion", data)}
                onBack={handleBack}
              />
            )}
            {currentLayer === 2 && renderAdaptiveLayer("resonance")}
            {currentLayer === 3 && renderAdaptiveLayer("pattern")}
            {currentLayer === 4 && renderAdaptiveLayer("relationship")}
            {currentLayer === 5 && renderAdaptiveLayer("insight")}
          </>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  );
}
