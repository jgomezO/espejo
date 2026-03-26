import { useState, useEffect, useRef } from "react";
import { Input } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { EMOTIONS } from "../../utils/emotions.js";
import LayerCard from "./LayerCard.jsx";
import { generateBodyLocationQuestion } from "../../services/anthropicService.js";

const FALLBACK_LABEL = "¿Dónde lo sientes en tu cuerpo?";

export default function LayerEmotion({ initialData, questions, onNext, onBack }) {
  const [selected, setSelected] = useState(initialData?.secondary
    ? [initialData.primary, ...initialData.secondary].filter(Boolean)
    : []
  );
  const [intensity, setIntensity] = useState(initialData?.intensity || 5);
  const [bodyLocation, setBodyLocation] = useState(initialData?.bodyLocation || "");
  const [bodyQuestion, setBodyQuestion] = useState(null);
  const [bodyQuestionLoading, setBodyQuestionLoading] = useState(false);
  const lastPrimaryRef = useRef(null);
  const debounceRef = useRef(null);

  const primaryId = selected[0];

  useEffect(() => {
    if (!primaryId || primaryId === lastPrimaryRef.current) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      lastPrimaryRef.current = primaryId;
      const primaryEmotion = EMOTIONS.find((e) => e.id === primaryId)?.label;
      if (!primaryEmotion) return;

      const secondaryEmotions = selected.slice(1)
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
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    onNext({
      primary: selected[0] || "",
      secondary: selected.slice(1),
      intensity,
      bodyLocation,
    });
  };

  return (
    <LayerCard
      title="¿Qué sentiste?"
      subtitle="Nombrar lo que sientes es el primer acto de consciencia."
      onNext={handleNext}
      onBack={onBack}
      disableNext={selected.length === 0}
    >
      <p className="field-hint">Selecciona las emociones que resonaron (la primera será la principal)</p>
      <div className="emotions-grid">
        {EMOTIONS.map((emotion, i) => {
          const isSelected = selected.includes(emotion.id);
          const isPrimary = selected[0] === emotion.id;
          return (
            <motion.button
              key={emotion.id}
              className={`emotion-chip ${isSelected ? "selected" : ""} ${isPrimary ? "primary" : ""}`}
              style={{ "--emotion-color": emotion.color }}
              onClick={() => toggle(emotion.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              aria-pressed={isSelected}
            >
              <span className="emotion-icon"><emotion.Icon size={18} strokeWidth={1.8} /></span>
              <span className="emotion-label">{emotion.label}</span>
              {isPrimary && <span className="emotion-primary-badge">principal</span>}
            </motion.button>
          );
        })}
      </div>

      <div className="intensity-field">
        <label className="field-label">
          Intensidad: <strong>{intensity}/10</strong>
        </label>
        <p className="field-description">Ej: 3 sería una incomodidad leve; 8 sería algo que te desbordó o no podías dejar de pensar</p>
        <input
          type="range"
          min="1"
          max="10"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="intensity-slider"
          style={{ "--value": `${(intensity - 1) / 9 * 100}%` }}
          aria-label="Intensidad emocional"
        />
        <div className="intensity-marks">
          <span>Suave</span>
          <span>Intensa</span>
        </div>
      </div>

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
            placeholder="Ej: pecho tenso, nudo en la garganta, presión en los hombros..."
            description='Ej: "Siento un peso en el pecho y tensión en los hombros", "me aprieta el estómago"'
            value={bodyLocation}
            onChange={(e) => setBodyLocation(e.target.value)}
            classNames={{ inputWrapper: "field-wrapper", label: "field-label", description: "field-description" }}
          />
        </motion.div>
      </AnimatePresence>
    </LayerCard>
  );
}
