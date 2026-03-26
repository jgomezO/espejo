import { useState } from "react";
import { Textarea } from "@heroui/react";
import LayerCard from "./LayerCard.jsx";

export default function LayerInsight({ initialData, questions, onNext, onBack }) {
  const [data, setData] = useState({
    mirror: initialData?.mirror || "",
    intention: initialData?.intention || "",
  });

  const update = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));

  return (
    <LayerCard
      title="¿Qué podrías estar viendo de ti mismo?"
      subtitle="La situación externa a veces es un espejo de algo interno."
      onNext={() => onNext(data)}
      onBack={onBack}
      disableNext={!data.mirror.trim()}
    >
      <Textarea
        label="¿Qué podrías estar viendo de ti mismo en todo esto?"
        placeholder="Sin juzgarte. Con curiosidad. ¿Qué refleja esta situación de ti?"
        description={questions?.mirror || 'Ej: "Quizás veo que me cuesta mucho tolerar sentirme en falta", "tal vez esto me muestra que me exijo demasiado y cuando fallo me derrumbo"'}
        value={data.mirror}
        onChange={update("mirror")}
        minRows={5}
        classNames={{ inputWrapper: "field-wrapper", label: "field-label", description: "field-description" }}
      />
      <Textarea
        label="¿Con qué intención quieres avanzar desde aquí?"
        placeholder="No un plan, sino una orientación interna. ¿Hacia dónde quieres moverte?"
        description={questions?.intention || 'Ej: "Quiero ser más compasivo conmigo cuando cometo errores", "quiero hablar más en lugar de cerrarme"'}
        value={data.intention}
        onChange={update("intention")}
        minRows={5}
        classNames={{ inputWrapper: "field-wrapper", label: "field-label", description: "field-description" }}
      />
    </LayerCard>
  );
}
