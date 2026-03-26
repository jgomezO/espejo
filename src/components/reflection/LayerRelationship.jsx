import { useState } from "react";
import { Textarea } from "@heroui/react";
import { motion } from "framer-motion";
import LayerCard from "./LayerCard.jsx";

const STANCES = [
  { id: "aferrándome", label: "Aferrándome", description: "No puedo soltar lo que pasó. Vuelvo a ello una y otra vez." },
  { id: "evitando", label: "Evitando", description: "Prefiero no pensar en esto. Me alejo de la emoción." },
  { id: "resistiendo", label: "Resistiendo", description: "Me peleo con lo que siento. No quiero sentirlo." },
  { id: "observando", label: "Observando", description: "Puedo verlo con cierta distancia. Lo sostengo sin perderme." },
  { id: "otro", label: "Otro", description: "Ninguna de estas describe exactamente mi relación con esto." },
];

export default function LayerRelationship({ initialData, questions, onNext, onBack }) {
  const [stance, setStance] = useState(initialData?.stance || "");
  const [description, setDescription] = useState(initialData?.description || "");

  return (
    <LayerCard
      title="¿Cómo te estás relacionando con esto?"
      subtitle="No es lo que sientes, sino cómo te posicionas ante lo que sientes."
      onNext={() => onNext({ stance, description })}
      onBack={onBack}
      disableNext={!stance}
    >
      <div className="stance-grid">
        {STANCES.map((s, i) => (
          <motion.button
            key={s.id}
            className={`stance-card ${stance === s.id ? "selected" : ""}`}
            onClick={() => setStance(s.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            aria-pressed={stance === s.id}
          >
            <span className="stance-label">{s.label}</span>
            <span className="stance-desc">{s.description}</span>
          </motion.button>
        ))}
      </div>
      <Textarea
        label="¿Cómo se siente esa relación con la emoción?"
        placeholder="Puedes expandir, matizar o describir con tus propias palabras..."
        description={questions?.description || 'Ej: "Sigo repasando la conversación en mi cabeza buscando qué hice mal", "cada vez que aparece ese sentimiento lo empujo para abajo"'}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        minRows={5}
        classNames={{ inputWrapper: "field-wrapper", label: "field-label", description: "field-description" }}
      />
    </LayerCard>
  );
}
