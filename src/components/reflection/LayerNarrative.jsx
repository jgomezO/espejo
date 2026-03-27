import { useState } from "react";
import { Textarea } from "@heroui/react";
import LayerCard from "./LayerCard.jsx";

const SITUATION_TYPES = [
  "Algo que pasó con alguien",
  "Algo que siento por dentro",
  "Un pensamiento que no se va",
  "Algo que descubrí de mí",
  "No sé cómo describirlo",
];

export default function LayerNarrative({ initialData, onNext, onBack }) {
  const [data, setData] = useState({
    whatBringsYou: initialData?.whatBringsYou || "",
    trigger: initialData?.trigger || "",
    othersInvolved: initialData?.othersInvolved || "",
    situationType: initialData?.situationType || "",
  });

  const update = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));
  const setSituationType = (type) =>
    setData((d) => ({ ...d, situationType: d.situationType === type ? "" : type }));

  const canContinue = data.whatBringsYou.trim() && data.trigger.trim() && data.situationType;

  return (
    <LayerCard
      title="¿Qué te trae aquí hoy?"
      subtitle="Describe lo que estás viviendo, sin juzgarlo aún."
      onNext={() => onNext(data)}
      onBack={onBack}
      disableNext={!canContinue}
    >
      <Textarea
        label="¿Qué te trae aquí hoy?"
        placeholder="Puede ser algo que pasó, algo que sentiste, un pensamiento que no se va, o simplemente algo que necesitas mirar con más atención..."
        value={data.whatBringsYou}
        onChange={update("whatBringsYou")}
        minRows={4}
        classNames={{ inputWrapper: "field-wrapper", label: "field-label" }}
      />
      <Textarea
        label="¿Qué fue lo que te detonó?"
        placeholder="Una conversación, una decisión, un recuerdo, un pensamiento, algo que viste... o quizás no sabes exactamente qué fue."
        value={data.trigger}
        onChange={update("trigger")}
        minRows={3}
        classNames={{ inputWrapper: "field-wrapper", label: "field-label" }}
      />
      <div>
        <Textarea
          label="¿Hay alguien más involucrado en esto?"
          placeholder="Si lo hay, describe quién y cuál es su rol. Si esto es algo más tuyo que de alguien más, puedes dejarlo en blanco."
          value={data.othersInvolved}
          onChange={update("othersInvolved")}
          minRows={2}
          classNames={{ inputWrapper: "field-wrapper", label: "field-label" }}
        />
        <p className="narrative-optional-note">(Opcional — no toda reflexión involucra a otros)</p>
      </div>

      <div className="narrative-type-group">
        <p className="narrative-type-label">¿Cómo describirías esto?</p>
        <div className="narrative-chips">
          {SITUATION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`narrative-chip${data.situationType === type ? " selected" : ""}`}
              onClick={() => setSituationType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </LayerCard>
  );
}
