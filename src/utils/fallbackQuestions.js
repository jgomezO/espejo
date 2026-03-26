export const FALLBACK_QUESTIONS = {
  resonance: {
    layerTitle: "¿Qué de esto te toca?",
    layerSubtitle: "Más allá de lo que pasó afuera, ¿qué se mueve adentro?",
    questions: [
      {
        id: "q1",
        type: "textarea",
        question: "¿Qué de esta situación te toca personalmente?",
        placeholder: "Más allá de los hechos, ¿qué mueve en ti?",
        required: true,
      },
      {
        id: "q2",
        type: "textarea",
        question: "¿Qué necesidad profunda se activa?",
        placeholder: "Reconocimiento, seguridad, pertenencia, autonomía, ser visto, control, amor...",
        required: true,
      },
    ],
  },
  pattern: {
    layerTitle: "¿Esto te ha pasado antes?",
    layerSubtitle: "Los patrones nos muestran dónde hay algo pendiente.",
    questions: [
      {
        id: "q1",
        type: "select",
        question: "¿Reconoces este sentimiento de situaciones anteriores?",
        options: ["Sí, claramente", "Algo parecido", "No estoy seguro/a", "No, es nuevo"],
        required: true,
      },
      {
        id: "q2",
        type: "textarea",
        question: "Si es así, ¿cuándo fue? ¿Qué tienen en común esas situaciones?",
        placeholder: "Describe brevemente...",
        required: false,
      },
    ],
  },
  relationship: {
    layerTitle: "¿Cómo te estás relacionando con esto?",
    layerSubtitle: "No es lo que sientes, sino cómo te posicionas ante lo que sientes.",
    questions: [
      {
        id: "q1",
        type: "select",
        question: "¿Qué estás haciendo con esta emoción?",
        options: ["Me estoy aferrando", "La estoy evitando", "La estoy resistiendo", "La estoy observando", "No sé"],
        required: true,
      },
      {
        id: "q2",
        type: "textarea",
        question: "¿Cómo se siente esa postura?",
        placeholder: "Describe cómo vives esa relación con tu emoción...",
        required: true,
      },
    ],
  },
  insight: {
    layerTitle: "¿Qué podrías estar viendo de ti mismo?",
    layerSubtitle: "La situación externa a veces es un espejo de algo interno.",
    questions: [
      {
        id: "q1",
        type: "textarea",
        question: "¿Qué te muestra esta situación sobre ti?",
        placeholder: "¿Qué aspecto de ti se hace visible a través de esto?",
        required: true,
      },
      {
        id: "q2",
        type: "textarea",
        question: "¿Con qué intención quieres avanzar desde aquí?",
        placeholder: "No es un plan de acción, es una intención interna...",
        required: true,
      },
    ],
  },
};
