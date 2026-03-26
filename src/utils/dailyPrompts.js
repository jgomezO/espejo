export const DAILY_PROMPTS = [
  "¿Qué emoción has estado evitando hoy?",
  "Si tu cuerpo pudiera hablar, ¿qué te diría en este momento?",
  "¿Qué necesitas que nadie te ha preguntado?",
  "¿A qué le tienes miedo realmente?",
  "¿Qué parte de ti necesita más compasión hoy?",
  "¿Qué historia te estás contando sobre lo que pasó?",
  "¿Qué esperabas que fuera diferente?",
  "¿En qué momento del día te sentiste más tú mismo?",
  "¿Qué límite te cuesta poner?",
  "¿Qué necesitas soltar para sentirte más liviano?",
  "¿Hay algo que estés resistiendo sentir?",
  "¿Qué te diría tu yo más sabio en este momento?",
  "¿Qué te cuesta pedir hoy?",
  "¿Dónde estás poniendo tu energía y hacia dónde quieres dirigirla?",
  "¿Qué situación reciente aún te genera tensión?",
  "¿Hay algo que hayas callado y necesite ser expresado?",
  "¿Qué emoción estás cargando que no es tuya?",
  "¿Qué parte de ti está esperando permiso para aparecer?",
  "¿Qué te está enseñando esta incomodidad?",
  "¿Qué herida antigua podría estar hablando hoy?",
  "¿Qué necesitas escuchar que nadie te ha dicho?",
  "¿Cómo te tratas cuando cometes un error?",
  "¿Qué te está costando aceptar?",
  "¿Qué relación en tu vida necesita más honestidad?",
  "¿Dónde estás siendo demasiado duro contigo mismo?",
  "¿Qué deseo has estado ignorando?",
  "¿Hay algo que estés haciendo por obligación en lugar de por elección?",
  "¿Qué necesitas para sentirte más seguro hoy?",
  "¿Qué te pesa llevar solo?",
  "¿Qué versión de ti mismo quieres honrar hoy?",
];

export function getDailyPrompt() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
}
