import { useState, useEffect, useRef } from "react";
import { Input } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { EMOTIONS } from "../../utils/emotions.js";
import LayerCard from "./LayerCard.jsx";
import { generateBodyLocationQuestion } from "../../services/anthropicService.js";

const FALLBACK_LABEL = "¿Dónde lo sientes en tu cuerpo?";

export default function LayerEmotion({ initialData, onNext, onBack }) {
  const [selectedIds, setSelectedIds] = useState(() => {
    if (initialData?.selected?.length) return initialData.selected.map((e) => e.id);
    if (initialData?.primary) return [initialData.primary, ...(initialData.secondary || [])];
    return [];
  });
  const [intensities, setIntensities] = useState(() => {
    if (initialData?.selected?.length) {
      return Object.fromEntries(initialData.selected.map((e) => [e.id, e.intensity]));
    }
    if (initialData?.primary) {
      const result = { [initialData.primary]: initialData.intensity || 5 };
      (initialData.secondary || []).forEach((id) => { result[id] = 5; });
      return result;
    }
    return {};
  });
  const [bodyLocation, setBodyLocation] = useState(initialData?.bodyLocation || "");
  const [bodyQuestion, setBodyQuestion] = useState(null);
  const [bodyQuestionLoading, setBodyQuestionLoading] = useState(false);
  const lastPrimaryRef = useRef(null);
  const debounceRef = useRef(null);

  const primaryId = selectedIds[0];

  useEffect(() => {
    if (!primaryId || primaryId === lastPrimaryRef.current) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      lastPrimaryRef.current = primaryId;
      const primaryEmotion = EMOTIONS.find((e) => e.id === primaryId)?.label;
      if (!primaryEmotion) return;
      const secondaryEmotions = selectedIds.slice(1)
        .map((id) => EMOTIONS.find((e) => e.id === id)?.label)
        .filter(Boolean);
      setBodyQuestionLoading(true);
      const question = await generateBodyLocationQuestion(primaryEmotion, secondaryEmotions);
      setBodyQuestionLoading(false);
      if (question) setBodyQuestion(question);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [primaryId]);

  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((e) => e !== id));
      setIntensities((prev) => { const { [id]: _, ...rest } = prev; return rest; });
    } else {
      setSelectedIds((prev) => [...prev, id]);
      setIntensities((prev) => ({ ...prev, [id]: 5 }));
    }
  };

  const handleNext = () => {
    const selected = selectedIds
      .map((id) => ({ id, intensity: intensities[id] ?? 5 }))
      .sort((a, b) => b.intensity - a.intensity);
    onNext({ selected, bodyLocation });
  };

  return (
    <LayerCard
      title="¿Qué sientes?"
      subtitle="Selecciona todas las que reconozcas en ti, aunque sean contradictorias."
      onNext={handleNext}
      onBack={onBack}
      disableNext={selectedIds.length === 0 || !bodyLocation.trim()}
    >
      <div className="emotions-grid">
        {EMOTIONS.map((emotion, i) => {
          const isSelected = selectedIds.includes(emotion.id);
          return (
            <motion.button
              key={emotion.id}
              className={`emotion-chip${isSelected ? " selected" : ""}`}
              style={{ "--emotion-color": emotion.color }}
              onClick={() => toggle(emotion.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              aria-pressed={isSelected}
            >
              <span className="emotion-icon"><emotion.Icon size={18} strokeWidth={1.8} /></span>
              <span className="emotion-label">{emotion.label}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="emotion-sliders-section"
          >
            <p className="field-hint">Ajusta la intensidad de cada emoción</p>
            <AnimatePresence>
              {selectedIds.map((id, i) => {
                const emotion = EMOTIONS.find((e) => e.id === id);
                if (!emotion) return null;
                const value = intensities[id] ?? 5;
                const pct = `${((value - 1) / 9) * 100}%`;
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="emotion-intensity-row"
                    style={{ "--emotion-color": emotion.color }}
                  >
                    <div className="emotion-intensity-info">
                      <emotion.Icon size={15} strokeWidth={1.8} style={{ color: emotion.color, flexShrink: 0 }} />
                      <span className="emotion-intensity-label">{emotion.label}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={value}
                      onChange={(e) =>
                        setIntensities((prev) => ({ ...prev, [id]: Number(e.target.value) }))
                      }
                      className="emotion-slider"
                      style={{ "--pct": pct }}
                      aria-label={`Intensidad de ${emotion.label}`}
                    />
                    <span className="emotion-intensity-value">{value}/10</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bodyQuestionLoading && (
          <motion.p
            className="body-question-loading"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Personalizando pregunta...
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={bodyQuestion || "fallback"}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Input
            label={bodyQuestion || FALLBACK_LABEL}
            placeholder="Pecho, garganta, estómago, manos, cabeza..."
            value={bodyLocation}
            onChange={(e) => setBodyLocation(e.target.value)}
            classNames={{ inputWrapper: "field-wrapper", label: "field-label" }}
          />
        </motion.div>
      </AnimatePresence>
    </LayerCard>
  );
}
