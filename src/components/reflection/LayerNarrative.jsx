import { useState } from "react";
import { Textarea, Input } from "@heroui/react";
import LayerCard from "./LayerCard.jsx";

export default function LayerNarrative({ initialData, questions, onNext, onBack }) {
  const [data, setData] = useState({
    situation: initialData?.situation || "",
    people: initialData?.people || "",
    context: initialData?.context || "",
  });

  const update = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));

  return (
    <LayerCard
      title="¿Qué sucedió?"
      subtitle="Describe la situación, sin juzgarla aún."
      onNext={() => onNext(data)}
      onBack={onBack}
      disableNext={!data.situation.trim()}
    >
      <Textarea
        label="¿Qué pasó?"
        placeholder="Describe la situación con la mayor honestidad que puedas..."
        description={questions?.situation || 'Ej: "Tuve una discusión con mi pareja porque llegué tarde al plan que teníamos. Me dijo que siempre hago lo mismo y yo me cerré."'}
        value={data.situation}
        onChange={update("situation")}
        minRows={5}
        classNames={{ inputWrapper: "field-wrapper", label: "field-label", description: "field-description" }}
      />
      <Input
        label="¿Quién estuvo involucrado?"
        placeholder="Personas, roles o vínculos..."
        description={questions?.people || 'Ej: "Mi pareja", "mi jefe y yo", "mi madre"'}
        value={data.people}
        onChange={update("people")}
        classNames={{ inputWrapper: "field-wrapper", label: "field-label", description: "field-description" }}
      />
      <Input
        label="¿Dónde / cuándo?"
        placeholder="Contexto de la situación..."
        description={questions?.context || 'Ej: "Ayer por la noche en casa", "esta mañana en el trabajo"'}
        value={data.context}
        onChange={update("context")}
        classNames={{ inputWrapper: "field-wrapper", label: "field-label", description: "field-description" }}
      />
    </LayerCard>
  );
}
