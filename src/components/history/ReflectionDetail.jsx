import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Divider } from "@heroui/react";
import { Sparkles, Sprout, RefreshCw, Trash2 } from "lucide-react";
import { EMOTIONS } from "../../utils/emotions.js";
import { useAIInsight } from "../../hooks/useAIInsight.js";
import { saveReflection, deleteReflection } from "../../services/storageService.js";
import { FALLBACK_QUESTIONS } from "../../utils/fallbackQuestions.js";

function Section({ title, children }) {
  return (
    <div className="detail-section">
      <h3 className="detail-section-title">{title}</h3>
      {children}
    </div>
  );
}

function AdaptiveSection({ layerName, layer }) {
  // New format: _questions + _answers
  if (layer?._questions?.questions && layer?._answers) {
    const answered = layer._questions.questions.filter((q) => {
      const a = layer._answers[q.id];
      return a !== undefined && a !== "" && a !== null;
    });
    if (answered.length === 0) return null;
    return (
      <Section title={layer._questions.layerTitle}>
        {answered.map((q) => (
          <div key={q.id} className="detail-qa-pair">
            <p className="detail-meta">{q.question}</p>
            <p>{typeof layer._answers[q.id] === "number" ? `${layer._answers[q.id]}/10` : layer._answers[q.id]}</p>
          </div>
        ))}
      </Section>
    );
  }

  // Old format — use FALLBACK_QUESTIONS titles for display
  const fallback = FALLBACK_QUESTIONS[layerName];
  return null; // rendered separately below for old format
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function parseLegacyAiSummary(reflection) {
  const raw = reflection.aiSummary;
  if (!raw || typeof raw !== "string") return reflection;

  // Limpiar backticks y espacios
  const clean = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  // Si no parece JSON, no hace nada
  if (!clean.startsWith("{")) return reflection;

  // Intento 1: JSON.parse
  try {
    const parsed = JSON.parse(clean);
    if (parsed.mirror) {
      return {
        ...reflection,
        aiSummary: parsed.mirror,
        therapyQuestions: reflection.therapyQuestions?.length ? reflection.therapyQuestions : (parsed.therapyQuestions || []),
      };
    }
  } catch { /* continuar */ }

  // Intento 2: regex
  const mirrorMatch = clean.match(/"mirror"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
  if (mirrorMatch) {
    const mirror = mirrorMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    const therapyQuestions = reflection.therapyQuestions?.length ? reflection.therapyQuestions : [];
    if (!therapyQuestions.length) {
      const qMatches = [...clean.matchAll(/"[^"]*[Qq]uestion"\s*:\s*"((?:[^"\\]|\\.)*)"/gs)];
      const eMatches = [...clean.matchAll(/"example"\s*:\s*"((?:[^"\\]|\\.)*)"/gs)];
      qMatches.forEach((m, i) => {
        therapyQuestions.push({
          question: m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'),
          example: eMatches[i] ? eMatches[i][1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : undefined,
        });
      });
    }
    return { ...reflection, aiSummary: mirror, therapyQuestions };
  }

  return reflection;
}

export default function ReflectionDetail({ reflection: initialReflection, onBack, onDelete }) {
  const { fetchInsight, loading, error } = useAIInsight();
  const [reflection, setReflection] = useState(() => parseLegacyAiSummary(initialReflection));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    deleteReflection(reflection.id);
    if (onDelete) onDelete(reflection.id);
    else onBack();
  };

  const { layers } = reflection;
  const dominantId = layers.emotion.selected?.[0]?.id ?? layers.emotion.primary;
  const primaryEmotion = dominantId ? EMOTIONS.find((e) => e.id === dominantId) : null;
  const dominantIntensity = layers.emotion.selected?.[0]?.intensity ?? layers.emotion.intensity;
  const emotionList = layers.emotion.selected?.length
    ? layers.emotion.selected.map((e) => ({ emotion: EMOTIONS.find((em) => em.id === e.id), intensity: e.intensity })).filter((e) => e.emotion)
    : layers.emotion.secondary?.map((id) => ({ emotion: EMOTIONS.find((e) => e.id === id), intensity: null })).filter((e) => e.emotion) || [];

  const handleGenerate = () => {
    fetchInsight(reflection).then((result) => {
      if (result) {
        const updated = {
          ...reflection,
          aiSummary: result.mirror,
          therapyQuestions: result.therapyQuestions,
          completed: true,
        };
        saveReflection(updated);
        setReflection(updated);
      }
    });
  };

  return (
    <motion.div
      className="reflection-detail"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <p className="detail-date">{formatDate(reflection.createdAt)}</p>
        <button className="btn-delete-reflection" onClick={() => setConfirmDelete(true)} aria-label="Borrar reflexión">
          <Trash2 size={16} strokeWidth={2} />
        </button>
        {primaryEmotion && (
          <div className="detail-emotion-badge" style={{ "--emotion-color": primaryEmotion.color }}>
            <primaryEmotion.Icon size={13} strokeWidth={2} /> {primaryEmotion.label} · {dominantIntensity}/10
          </div>
        )}
      </div>

      <Divider className="my-4" />

      <Section title="¿Qué te trajo aquí?">
        {(layers.narrative.whatBringsYou || layers.narrative.situation) && (
          <p>{layers.narrative.whatBringsYou || layers.narrative.situation}</p>
        )}
        {layers.narrative.trigger && <p className="detail-meta">Detonante: {layers.narrative.trigger}</p>}
        {layers.narrative.othersInvolved && <p className="detail-meta">Otros: {layers.narrative.othersInvolved}</p>}
        {layers.narrative.situationType && <p className="detail-meta">Tipo: {layers.narrative.situationType}</p>}
        {layers.narrative.people && <p className="detail-meta">Personas: {layers.narrative.people}</p>}
        {layers.narrative.context && <p className="detail-meta">Contexto: {layers.narrative.context}</p>}
      </Section>

      <Section title="¿Qué sentiste?">
        {emotionList.length > 0 && (
          <div className="detail-emotions-list">
            {emotionList.map(({ emotion: e, intensity }) => (
              <span key={e.id} className="detail-emotion-chip" style={{ "--emotion-color": e.color }}>
                <e.Icon size={13} strokeWidth={2} /> {e.label}{intensity !== null ? ` · ${intensity}/10` : ""}
              </span>
            ))}
          </div>
        )}
        {layers.emotion.bodyLocation && <p className="detail-meta">En el cuerpo: {layers.emotion.bodyLocation}</p>}
      </Section>

      {/* Capas 3–6: nuevo formato (AdaptiveSection) o viejo formato */}
      {"_answers" in layers.resonance ? (
        <AdaptiveSection layerName="resonance" layer={layers.resonance} />
      ) : (
        <Section title="¿Qué te tocó?">
          <p>{layers.resonance.whatTouches}</p>
          {layers.resonance.coreNeed && <p className="detail-meta">Necesidad: {layers.resonance.coreNeed}</p>}
        </Section>
      )}

      {"_answers" in layers.pattern ? (
        <AdaptiveSection layerName="pattern" layer={layers.pattern} />
      ) : (
        layers.pattern.hasHappenedBefore && (
          <Section title="Patrón reconocido">
            <p>{layers.pattern.when}</p>
            {layers.pattern.commonThread && <p className="detail-meta">Hilo común: {layers.pattern.commonThread}</p>}
          </Section>
        )
      )}

      {"_answers" in layers.relationship ? (
        <AdaptiveSection layerName="relationship" layer={layers.relationship} />
      ) : (
        <Section title="Relación con la emoción">
          <p className="detail-stance">{layers.relationship.stance}</p>
          {layers.relationship.description && <p>{layers.relationship.description}</p>}
        </Section>
      )}

      {"_answers" in layers.insight ? (
        <AdaptiveSection layerName="insight" layer={layers.insight} />
      ) : (
        <Section title="Insight">
          <p>{layers.insight.mirror}</p>
          {layers.insight.intention && <p className="detail-meta">Intención: {layers.insight.intention}</p>}
        </Section>
      )}

      <Divider className="my-4" />

      {reflection.aiSummary ? (
        <Section title={<><Sparkles size={16} strokeWidth={2} /> Tu espejo</>}>
          <p className="detail-ai-summary">{reflection.aiSummary}</p>
        </Section>
      ) : (
        <div className="detail-no-mirror">
          {error && <p className="mirror-error-sub">No se pudo generar el reflejo. Intenta de nuevo.</p>}
          <button className="btn-retry" onClick={handleGenerate} disabled={loading}>
            {loading ? "Generando..." : <><Sparkles size={14} strokeWidth={2} /> Generar reflejo</>}
          </button>
        </div>
      )}

      {reflection.therapyQuestions?.length > 0 && (
        <>
          <Divider className="my-4" />
          <div className="therapy-questions" style={{ border: "1px solid var(--color-border)", borderLeft: "3px solid var(--color-accent)" }}>
            <div className="therapy-questions-header">
              <span className="therapy-questions-icon"><Sprout size={18} strokeWidth={2} /></span>
              <h2 className="therapy-questions-title">Para llevar a terapia</h2>
            </div>
            <ol className="therapy-questions-list" style={{ marginTop: "12px" }}>
              {reflection.therapyQuestions.map((q, i) => (
                <li key={i} className="therapy-question-item">
                  <div className="therapy-question-body">
                    <span className="therapy-question-text">{q.question ?? q}</span>
                    {q.example && (
                      <span className="therapy-question-example">{q.example}</span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="delete-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="delete-confirm-modal"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="delete-confirm-title">¿Borrar esta reflexión?</h3>
              <p className="delete-confirm-body">Esta acción eliminará la reflexión de forma permanente. No se puede deshacer.</p>
              <div className="delete-confirm-actions">
                <button className="btn-delete-cancel" onClick={() => setConfirmDelete(false)}>Cancelar</button>
                <button className="btn-delete-confirm" onClick={handleDelete}>Sí, borrar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
