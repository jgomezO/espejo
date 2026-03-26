import { useState } from "react";
import { Textarea, Button } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import LayerCard from "./LayerCard.jsx";

export default function LayerPattern({ initialData, questions, onNext, onBack }) {
  const [hasBefore, setHasBefore] = useState(initialData?.hasHappenedBefore ?? null);
  const [data, setData] = useState({
    when: initialData?.when || "",
    commonThread: initialData?.commonThread || "",
  });

  const update = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));

  const handleNext = () => {
    onNext({
      hasHappenedBefore: hasBefore,
      when: hasBefore ? data.when : "",
      commonThread: hasBefore ? data.commonThread : "",
    });
  };

  return (
    <LayerCard
      title="¿Esto te ha pasado antes?"
      subtitle="Los patrones nos muestran dónde hay algo pendiente."
      onNext={handleNext}
      onBack={onBack}
      disableNext={hasBefore === null}
    >
      <div className="toggle-group">
        <Button
          className={`toggle-btn ${hasBefore === true ? "active" : ""}`}
          onPress={() => setHasBefore(true)}
          variant={hasBefore === true ? "solid" : "bordered"}
          aria-pressed={hasBefore === true}
        >
          Sí, me ha pasado antes
        </Button>
        <Button
          className={`toggle-btn ${hasBefore === false ? "active" : ""}`}
          onPress={() => setHasBefore(false)}
          variant={hasBefore === false ? "solid" : "bordered"}
          aria-pressed={hasBefore === false}
        >
          No reconozco un patrón
        </Button>
      </div>

      <AnimatePresence>
        {hasBefore && (
          <motion.div
            className="layer-fields"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            style={{ overflow: "hidden" }}
          >
            <Textarea
              label="¿Cuándo ha pasado algo similar?"
              placeholder="Describe cuándo o cómo recuerdas haberlo vivido..."
              description={questions?.when || 'Ej: "Con mi ex también sentía que nunca era suficiente", "de niño me pasaba lo mismo cuando mi mamá se enojaba conmigo"'}
              value={data.when}
              onChange={update("when")}
              minRows={5}
              classNames={{ inputWrapper: "field-wrapper", label: "field-label", description: "field-description" }}
            />
            <Textarea
              label="¿Qué tienen en común esas situaciones?"
              placeholder="¿Qué elemento se repite? ¿Qué emoción, persona o dinámica?"
              description={questions?.commonThread || 'Ej: "Siempre hay alguien que me hace sentir que decepciono", "en todas me cierro en lugar de hablar"'}
              value={data.commonThread}
              onChange={update("commonThread")}
              minRows={5}
              classNames={{ inputWrapper: "field-wrapper", label: "field-label", description: "field-description" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </LayerCard>
  );
}
