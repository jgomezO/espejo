import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, CloudOff, Cloud, Loader2 } from "lucide-react";
import { getReflections, getRemoteReflectionIds, saveReflectionToSupabase } from "../../services/storageService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { EMOTIONS } from "../../utils/emotions.js";
import ReflectionDetail from "./ReflectionDetail.jsx";
import PatternAnalysis from "./PatternAnalysis.jsx";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function HistoryList() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remoteIds, setRemoteIds] = useState(null);
  const [savingIds, setSavingIds] = useState(new Set());

  useEffect(() => {
    getReflections()
      .then((data) => setReflections(data))
      .catch(() => {})
      .finally(() => setLoading(false));

    getRemoteReflectionIds()
      .then((ids) => setRemoteIds(ids))
      .catch(() => setRemoteIds(new Set()));
  }, []);

  const handleSave = async (reflection) => {
    if (!user?.id) return;
    setSavingIds((prev) => new Set([...prev, reflection.id]));
    try {
      await saveReflectionToSupabase(reflection, user.id);
      setRemoteIds((prev) => new Set([...prev, reflection.id]));
    } catch (err) {
      console.error("[HistoryList] Failed to save reflection:", err);
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(reflection.id);
        return next;
      });
    }
  };

  const handleSaveAll = async () => {
    if (!user?.id || !remoteIds) return;
    const unsaved = reflections.filter((r) => !remoteIds.has(r.id));
    if (unsaved.length === 0) return;

    const allIds = new Set(unsaved.map((r) => r.id));
    setSavingIds((prev) => new Set([...prev, ...allIds]));

    await Promise.allSettled(
      unsaved.map((r) => saveReflectionToSupabase(r, user.id))
    );

    // Re-check which are now saved
    const updated = await getRemoteReflectionIds();
    setRemoteIds(updated);
    setSavingIds(new Set());
  };

  if (selected) {
    return (
      <ReflectionDetail
        reflection={selected}
        onBack={() => setSelected(null)}
        onDelete={(id) => {
          setReflections((prev) => prev.filter((r) => r.id !== id));
          setSelected(null);
        }}
      />
    );
  }

  const unsavedCount = remoteIds
    ? reflections.filter((r) => !remoteIds.has(r.id)).length
    : 0;

  return (
    <div className="history-screen">
      <div className="history-header">
        <h1 className="screen-title">Historial</h1>
        <p className="screen-subtitle">
          {!loading && reflections.length > 0
            ? `${reflections.length} reflexión${reflections.length !== 1 ? "es" : ""}`
            : ""}
        </p>
      </div>

      {unsavedCount > 0 && (
        <div className="history-unsaved-banner">
          <div className="history-unsaved-info">
            <CloudOff size={16} strokeWidth={2} />
            <span>{unsavedCount} reflexión{unsavedCount !== 1 ? "es" : ""} sin guardar en la nube</span>
          </div>
          <button className="btn-save-all" onClick={handleSaveAll}>
            Guardar todas
          </button>
        </div>
      )}

      {!loading && <PatternAnalysis reflections={reflections} />}

      {loading ? (
        <div className="history-empty">
          <p style={{ fontStyle: "italic", color: "var(--color-text-soft)" }}>Cargando...</p>
        </div>
      ) : reflections.length === 0 ? (
        <div className="history-empty">
          <p>Aún no tienes reflexiones guardadas.</p>
          <p className="history-empty-sub">Cuando completes una, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="history-list">
          <AnimatePresence>
            {reflections.map((r, i) => {
              const emotionId = r.layers.emotion.selected?.[0]?.id ?? r.layers.emotion.primary;
              const emotion = EMOTIONS.find((e) => e.id === emotionId);
              const isSaved = remoteIds ? remoteIds.has(r.id) : true;
              const isSaving = savingIds.has(r.id);

              return (
                <motion.div
                  key={r.id}
                  className="history-item-wrapper"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <button
                    className="history-item"
                    onClick={() => setSelected(r)}
                    aria-label={`Reflexión del ${formatDate(r.createdAt)}`}
                  >
                    <div className="history-item-left">
                      {emotion && (
                        <span
                          className="history-emotion-dot"
                          style={{ background: emotion.color }}
                          aria-hidden="true"
                        >
                          <emotion.Icon size={18} color="white" strokeWidth={1.8} />
                        </span>
                      )}
                    </div>
                    <div className="history-item-content">
                      <div className="history-item-top">
                        <span className="history-date">{formatDate(r.createdAt)}</span>
                        {emotion && (
                          <span className="history-emotion-label" style={{ color: emotion.color }}>
                            {emotion.label}
                          </span>
                        )}
                      </div>
                      <p className="history-narrative">
                        {((r.layers.narrative.whatBringsYou || r.layers.narrative.situation || "").slice(0, 90))}
                        {(r.layers.narrative.whatBringsYou || r.layers.narrative.situation || "").length > 90 ? "..." : ""}
                      </p>
                      {r.hasChat && (
                        <span className="history-chat-indicator">
                          <MessageCircle size={11} strokeWidth={2} /> conversación guardada
                        </span>
                      )}
                    </div>
                    <span className="history-arrow">›</span>
                  </button>

                  {!isSaved && (
                    <div className="history-item-unsaved">
                      {isSaving ? (
                        <span className="history-saving">
                          <Loader2 size={13} className="spin-icon" /> Guardando...
                        </span>
                      ) : (
                        <button className="btn-save-reflection" onClick={() => handleSave(r)}>
                          <Cloud size={13} strokeWidth={2} /> Guardar en la nube
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
