import { useState } from "react";
import { Textarea } from "@heroui/react";
import { motion } from "framer-motion";
import LayerCard from "./LayerCard.jsx";

export default function AdaptiveLayerCard({ questions, onNext, onBack, isLoading }) {
  const [answers, setAnswers] = useState({});

  const setAnswer = (id, value) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const isValid = questions?.questions?.every(
    (q) => !q.required || (answers[q.id] !== undefined && answers[q.id] !== "" && answers[q.id] !== null)
  ) ?? false;

  if (isLoading || !questions) {
    return (
      <LayerCard
        title=" "
        subtitle=" "
        onNext={() => {}}
        onBack={onBack}
        disableNext={true}
      >
        <div className="adaptive-loading">
          <motion.p
            className="adaptive-loading-text"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          >
            Preparando tus preguntas...
          </motion.p>
        </div>
      </LayerCard>
    );
  }

  return (
    <LayerCard
      title={questions.layerTitle}
      subtitle={questions.layerSubtitle}
      onNext={() => onNext(answers)}
      onBack={onBack}
      disableNext={!isValid}
    >
      {questions.questions.map((q, i) => (
        <motion.div
          key={q.id}

          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15, duration: 0.35 }}
        >
          {q.type === "textarea" && (
            <Textarea
              label={q.required ? q.question : `${q.question} (opcional)`}
              placeholder={q.placeholder || ""}
              value={answers[q.id] || ""}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              minRows={4}
              classNames={{
                inputWrapper: "field-wrapper",
                label: "field-label",
              }}
            />
          )}

          {q.type === "select" && (
            <div className="adaptive-select-field">
              <p className="field-label">{q.required ? q.question : `${q.question} (opcional)`}</p>
              <div className="adaptive-select-options">
                {q.options?.map((option) => (
                  <motion.button
                    key={option}
                    className={`adaptive-option-chip ${answers[q.id] === option ? "selected" : ""}`}
                    onClick={() => setAnswer(q.id, answers[q.id] === option ? "" : option)}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {q.type === "scale" && (
            <div className="intensity-field">
              <label className="field-label">
                {q.required ? q.question : `${q.question} (opcional)`}
                {answers[q.id] !== undefined && <strong> · {answers[q.id]}/10</strong>}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={answers[q.id] ?? 5}
                onChange={(e) => setAnswer(q.id, Number(e.target.value))}
                className="intensity-slider"
                style={{ "--pct": `${(((answers[q.id] ?? 5) - 1) / 9) * 100}%` }}
                aria-label={q.question}
              />
              {q.scaleLabel && (
                <div className="intensity-marks">
                  <span>{q.scaleLabel.low}</span>
                  <span>{q.scaleLabel.high}</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </LayerCard>
  );
}
