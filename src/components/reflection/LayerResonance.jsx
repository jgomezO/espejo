import { useState } from "react";
import { Textarea } from "@heroui/react";
import LayerCard from "./LayerCard.jsx";

export default function LayerResonance({ initialData, questions, onNext, onBack }) {
  const [data, setData] = useState({
    whatTouches: initialData?.whatTouches || "",
    coreNeed: initialData?.coreNeed || "",
  });

  const update = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));

  return (
    <LayerCard
      title="¿Qué de esto te toca?"
      subtitle="Más allá de lo que pasó afuera, ¿qué se mueve adentro?"
      onNext={() => onNext(data)}
      onBack={onBack}
      disableNext={!data.whatTouches.trim()}
    >
      <Textarea
        label="¿Qué te toca personalmente de esta situación?"
        placeholder="No lo que pasó, sino qué parte de ti se activa con esto..."
        description={questions?.whatTouches || 'Ej: "Me toca que siento que no importo, que mis tiempos no son respetados", "me duele sentir que desilusioné a alguien"'}
        value={data.whatTouches}
        onChange={update("whatTouches")}
        minRows={5}
        classNames={{ inputWrapper: "field-wrapper", label: "field-label", description: "field-description" }}
      />
      <div className="hint-box">
        <p className="hint-title">Algunas necesidades comunes:</p>
        <p className="hint-text">reconocimiento · seguridad · pertenencia · autonomía · ser visto · control · amor · validación · paz</p>
      </div>
      <Textarea
        label="¿Qué necesidad profunda se activa?"
        placeholder="¿Qué necesitas y no estás recibiendo, o que sientes amenazado?"
        description={questions?.coreNeed || 'Ej: "Necesito sentir que soy suficiente", "necesito que me vean como alguien confiable", "necesito paz, no más conflictos"'}
        value={data.coreNeed}
        onChange={update("coreNeed")}
        minRows={5}
        classNames={{ inputWrapper: "field-wrapper", label: "field-label", description: "field-description" }}
      />
    </LayerCard>
  );
}
