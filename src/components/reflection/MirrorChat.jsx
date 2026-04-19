import { useState, useRef, useEffect, Fragment } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { callClaudeStream, processAIResponse } from "../../services/anthropicService.js";
import { MIRROR_CHAT_SYSTEM_PROMPT, buildMirrorChatMessages } from "../../utils/prompts.js";
import { loadChatHistory, ensureSession, saveMessage } from "../../services/chatService.js";
import { syncReflection } from "../../services/storageService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import SafetyDisclaimer from "../safety/SafetyDisclaimer.jsx";
import CrisisModal from "../crisis/CrisisModal.jsx";

function formatMessage(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^[-•]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/(<\/ul>\s*<ul>)/g, "")
    .replace(/\n/g, "<br />");
}

function formatSessionDate(iso) {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long",
  });
}

export default function MirrorChat({ reflection, onClose, mode = "new" }) {
  const { user } = useAuth();

  const [pastSessions, setPastSessions] = useState([]);
  const [currentMessages, setCurrentMessages] = useState([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [dismissedNudges, setDismissedNudges] = useState(new Set());
  const [savedFlash, setSavedFlash] = useState(false);
  const bottomRef = useRef(null);

  // Session ID is managed via ref only — no React state needed since
  // it's only used inside async functions, never for rendering.
  const sessionIdRef = useRef(null);
  const sessionPromiseRef = useRef(null);

  // ── Load past history on mount (non-blocking) ──────────────
  useEffect(() => {
    let cancelled = false;
    loadChatHistory(reflection.id).then((history) => {
      if (cancelled) return;
      if (history.sessions.length > 0) {
        // If there's a session from today, load its messages as current
        const today = new Date().toDateString();
        const todaySession = history.sessions.find(
          (s) => new Date(s.startedAt).toDateString() === today
        );
        const past = history.sessions.filter((s) => s !== todaySession);
        setPastSessions(past);

        if (todaySession?.messages.length) {
          setCurrentMessages(
            todaySession.messages.map((m) => ({
              localId: m.id,
              role: m.role,
              content: m.content,
              saved: true,
            }))
          );
        }
      }
    }).catch((err) => {
      console.error("[MirrorChat] Failed to load history:", err);
    });
    return () => { cancelled = true; };
  }, [reflection.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, loading]);

  // ── Lazy session creation ──────────────────────────────────
  // Returns the sessionId, creating one if needed. Deduplicates
  // concurrent calls so the session is only created once.
  async function getSessionId() {
    if (sessionIdRef.current) return sessionIdRef.current;

    if (!sessionPromiseRef.current) {
      sessionPromiseRef.current = (async () => {
        // Sync reflection first (FK dependency)
        await syncReflection(reflection, user.id);
        const sid = await ensureSession(reflection.id, user.id);
        sessionIdRef.current = sid;
        return sid;
      })();
    }

    return sessionPromiseRef.current;
  }

  const updateMessage = (localId, patch) =>
    setCurrentMessages((prev) => prev.map((m) => m.localId === localId ? { ...m, ...patch } : m));

  const persistMessage = async (localId, role, content) => {
    try {
      const sid = await getSessionId();
      await saveMessage(sid, user.id, role, content);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) {
      console.error("[MirrorChat] Failed to save message:", err);
      updateMessage(localId, { saved: false });
    }
  };

  const retryMessage = (localId) => {
    const msg = currentMessages.find((m) => m.localId === localId);
    if (!msg) return;
    persistMessage(localId, msg.role, msg.content);
  };

  const send = async () => {
    if (!input.trim() || loading) return;

    const userLocalId = crypto.randomUUID();
    const userMsg = { localId: userLocalId, role: "user", content: input.trim(), saved: true };
    const updatedMessages = [...currentMessages, userMsg];
    setCurrentMessages(updatedMessages);
    setInput("");
    setLoading(true);

    // Persist user message asynchronously
    persistMessage(userLocalId, "user", userMsg.content);

    // Build Claude context
    const allPastMessages = pastSessions.flatMap((s) => s.messages);
    const contextMessages = buildMirrorChatMessages(reflection, allPastMessages, updatedMessages);

    const result = await callClaudeStream({
      system: MIRROR_CHAT_SYSTEM_PROMPT,
      messages: contextMessages,
      maxTokens: 300,
      onChunk: () => {},
    });

    setLoading(false);

    if (result) {
      const processed = processAIResponse(result);
      if (processed.triggerCrisisModal) setCrisisOpen(true);

      const aiLocalId = crypto.randomUUID();
      const aiMsg = { localId: aiLocalId, role: "assistant", content: processed.text, saved: true };
      setCurrentMessages((prev) => [...prev, aiMsg]);

      // Persist assistant message asynchronously
      persistMessage(aiLocalId, "assistant", aiMsg.content);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Compute which indices should show nudge banners
  const nudgeAfterIndex = new Map();
  let uc = 0;
  currentMessages.forEach((msg, i) => {
    if (msg.role === "user") {
      uc++;
      if (uc % 5 === 0) nudgeAfterIndex.set(i, uc);
    }
  });

  const dismissNudge = (level) =>
    setDismissedNudges((prev) => new Set([...prev, level]));

  const isResumed = pastSessions.length > 0 || currentMessages.length > 0;

  return (
    <motion.div
      className="mirror-chat"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mirror-chat-header">
        <button className="btn-back" onClick={onClose} style={{ width: "auto" }}>← Volver</button>
        {savedFlash && (
          <motion.span
            className="mirror-chat-counter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            Conversación guardada
          </motion.span>
        )}
      </div>

      <div className="mirror-chat-messages">
        {/* Past sessions (read-only) — skip empty sessions */}
        {pastSessions.filter((s) => s.messages.length > 0).map((session) => (
          <div key={session.id} className="mirror-chat-past-session">
            <div className="mirror-chat-session-divider">
              <span>{formatSessionDate(session.startedAt)}</span>
            </div>
            {session.messages.map((msg, i) => (
              <div
                key={msg.id || i}
                className={`chat-bubble ${msg.role} past`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
            ))}
          </div>
        ))}

        {/* Separator before current session */}
        {pastSessions.some((s) => s.messages.length > 0) && (
          <div className="mirror-chat-session-divider current">
            <span>Hoy</span>
          </div>
        )}

        {/* Intro for fresh sessions */}
        {!isResumed && (
          <div className="mirror-chat-intro">
            <p className="ai-text">Tu espejo está aquí. ¿Qué quieres explorar?</p>
          </div>
        )}

        {/* Current session messages */}
        {currentMessages.map((msg, i) => {
          const nudgeLevel = nudgeAfterIndex.get(i);
          return (
            <Fragment key={msg.localId}>
              <motion.div
                className={msg.role === "user" ? "chat-wrap-user" : "chat-wrap-assistant"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`chat-bubble ${msg.role}`}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
                {!msg.saved && (
                  <div className={`mirror-chat-unsaved mirror-chat-unsaved-${msg.role}`}>
                    <AlertCircle size={11} />
                    <span>no guardado</span>
                    <button onClick={() => retryMessage(msg.localId)}>reintentar</button>
                  </div>
                )}
              </motion.div>

              {nudgeLevel !== undefined && !dismissedNudges.has(nudgeLevel) && (
                <motion.div
                  className="mirror-chat-nudge-banner"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p>Puedes seguir conversando o guardar esta reflexión y volver cuando quieras.</p>
                  <div className="mirror-chat-nudge-actions">
                    <button onClick={() => dismissNudge(nudgeLevel)}>Seguir conversando</button>
                    <button onClick={onClose}>Guardar y cerrar</button>
                  </div>
                </motion.div>
              )}
            </Fragment>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <motion.div
            className="chat-wrap-assistant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="chat-bubble assistant chat-typing">
              <span /><span /><span />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="mirror-chat-input-row">
        <textarea
          className="mirror-chat-input"
          placeholder="Escribe aquí..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={loading}
          aria-label="Mensaje al espejo"
        />
        <button
          className="mirror-chat-send"
          onClick={send}
          disabled={!input.trim() || loading}
          aria-label="Enviar"
        >
          ↑
        </button>
      </div>

      <SafetyDisclaimer variant="C" />
      <CrisisModal isOpen={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </motion.div>
  );
}
