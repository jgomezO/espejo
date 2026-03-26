import { MIRROR_SYSTEM_PROMPT, buildReflectionPrompt, ADAPTIVE_LAYER_SYSTEM_PROMPT, buildLayerQuestionsPrompt, BODY_LOCATION_SYSTEM_PROMPT, buildBodyLocationPrompt } from "../utils/prompts.js";

// En desarrollo usamos ruta relativa para que Vite haga el proxy (sin CORS).
// En producción usamos la URL completa de Supabase.
const ANTHROPIC_API_URL = import.meta.env.DEV
  ? "/functions/v1/claude"
  : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude`;

const HEADERS = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

// Rate limiting — mínimo 2s entre llamadas
let lastCallAt = 0;
async function waitForRateLimit() {
  const now = Date.now();
  const diff = now - lastCallAt;
  if (diff < 2000) await new Promise((r) => setTimeout(r, 2000 - diff));
  lastCallAt = Date.now();
}

// ── Llamada simple (sin streaming) ─────────────────────────
export async function callClaude({ system, userMessage, maxTokens = 512 }) {
  await waitForRateLimit();
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`API error ${response.status}: ${body}`);
    }
    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error("Claude API error:", error);
    return null;
  }
}

// ── Llamada con streaming ───────────────────────────────────
export async function callClaudeStream({ system, messages, maxTokens = 1024, onChunk }) {
  await waitForRateLimit();
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: maxTokens,
        stream: true,
        system,
        messages,
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`API error ${response.status}: ${body}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6);
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            fullText += parsed.delta.text;
            onChunk(fullText);
          }
        } catch {
          // línea no parseable, ignorar
        }
      }
    }
    return fullText;
  } catch (error) {
    console.error("Claude streaming error:", error);
    return null;
  }
}

// ── Pregunta corporal dinámica (capa emoción) ───────────────
// Llama directamente sin rate limiting global para no bloquear generación de capas
export async function generateBodyLocationQuestion(primaryEmotion, secondaryEmotions) {
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 60,
        system: BODY_LOCATION_SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildBodyLocationPrompt(primaryEmotion, secondaryEmotions) }],
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.content[0].text.trim() || null;
  } catch {
    return null;
  }
}

// ── Preguntas adaptativas por capa ─────────────────────────
export async function generateLayerQuestions(layerName, previousLayers) {
  const result = await callClaude({
    system: ADAPTIVE_LAYER_SYSTEM_PROMPT,
    userMessage: buildLayerQuestionsPrompt(layerName, previousLayers),
    maxTokens: 600,
  });

  if (!result) return null;

  try {
    const clean = result.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
    return JSON.parse(clean);
  } catch (e) {
    console.error("Failed to parse layer questions:", e);
    return null;
  }
}

// ── Mirror Summary (usa streaming + JSON parse) ────────────
export async function generateMirrorSummary(reflectionData, onChunk) {
  const userMessage = buildReflectionPrompt(reflectionData);
  let fullText = "";

  const result = await callClaudeStream({
    system: MIRROR_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
    maxTokens: 1024,
    onChunk: (text) => {
      fullText = text;
      if (onChunk) onChunk(text);
    },
  });

  if (!result) return null;

  const clean = result.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");

  // Intento 1: JSON.parse normal
  try {
    const parsed = JSON.parse(clean);
    if (parsed.mirror) {
      return { mirror: parsed.mirror, therapyQuestions: parsed.therapyQuestions || [] };
    }
  } catch { /* continuar */ }

  // Intento 2: extraer mirror con regex aunque el JSON esté malformado
  const mirrorMatch = clean.match(/"mirror"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
  if (mirrorMatch) {
    const mirror = mirrorMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    const therapyQuestions = [];
    // Intentar extraer questions con regex
    // El key puede ser "question" o malformado como "therapyQuestionsquestion"
    const qMatches = [...clean.matchAll(/"[^"]*[Qq]uestion"\s*:\s*"((?:[^"\\]|\\.)*)"/gs)];
    const eMatches = [...clean.matchAll(/"example"\s*:\s*"((?:[^"\\]|\\.)*)"/g)];
    qMatches.forEach((m, i) => {
      therapyQuestions.push({
        question: m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'),
        example: eMatches[i] ? eMatches[i][1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : undefined,
      });
    });
    return { mirror, therapyQuestions };
  }

  // Intento 3: devolver el texto limpio como mirror si no hay JSON
  return { mirror: clean, therapyQuestions: [] };
}

// ── Procesamiento de respuestas (detección de safety flag) ──
export function processAIResponse(text) {
  if (!text) return { text: "", triggerCrisisModal: false };
  const hasSafetyFlag = text.includes("[SAFETY_FLAG]");
  const cleanText = text.replace(/\[SAFETY_FLAG\]/g, "").trim();
  return { text: cleanText, triggerCrisisModal: hasSafetyFlag };
}
