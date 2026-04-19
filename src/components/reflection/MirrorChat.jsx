import { useState, useRef, useEffect, Fragment } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { callClaudeStream, processAIResponse } from "../../services/anthropicService.js";
import { MIRROR_CHAT_SYSTEM_PROMPT, buildMirrorChatMessages } from "../../utils/prompts.js";
import { loadChatHistory, getOrCreateTodaySession, saveMessage } from "../../services/chatService.js";
import { syncReflection } from "../../services/storageService.js";
import { supabase } from "../../services/supabaseClient.js";
import { useAuth } from "../../context/AuthContext.jsx";
import SafetyDisclaimer from "../safety/SafetyDisclaimer.jsx";
import CrisisModal from "../crisis/CrisisModal.jsx";

function formatSessionDate(iso) {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long",
  });
}

export default function MirrorChat({ reflection, onClose, mode = "new" }) {
  const { user } = useAuth();

  const [sessionId, setSessionId] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [pastSessions, setPastSessions] = useState([]);
  // Each message: { localId, role, content, saved: bool }
  const [currentMessages, setCurrentMessages] = useState([]);
  const [initError, setInitError] = useState(null);

  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [dismissedNudges, setDismissedNudges] = useState(new Set());
  const bottomRef = useRef(null);
  const initRan = useRef(false);
  const tokenRef = useRef(null);

  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;

    // Safety net: always unblock the UI after 8s even if something hangs
    const safetyTimer = setTimeout(() => setInitialized(true), 8000);

    (async () => {
      try {
        // Get a fresh token directly from Supabase auth
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token ?? null;
        tokenRef.current = token;

        // Sync reflection to Supabase BEFORE creating chat session (FK dependency)
        await syncReflection(reflection, user.id);

        const history = await loadChatHistory(reflection.id, token);

        try {
          const session = await getOrCreateTodaySession(reflection.id, user.id, token);
          setSessionId(session.id);

          const todaySession = history.sessions.find((s) => s.id === session.id);
          setPastSessions(history.sessions.filter((s) => s.id !== session.id));

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
        } catch (err) {
          setPastSessions(history.sessions);
          const msg = err?.message ?? String(err);
          if (!msg.includes("23503")) {
            console.error("MirrorChat session error:", msg);
            setInitError(msg);
          }
        }
      } finally {
        clearTimeout(safetyTimer);
        setInitialized(true);
      }
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, streaming]);

  const updateMessage = (localId, patch) =>
    setCurrentMessages((prev) => prev.map((m) => m.localId === localId ? { ...m, ...patch } : m));

  const retryMessage = async (localId) => {
    const msg = currentMessages.find((m) => m.localId === localId);
    if (!msg || !sessionId) return;
    try {
      await saveMessage(sessionId, user.id, msg.role, msg.content, tokenRef.current);
      updateMessage(localId, { saved: true });
    } catch { /* stays unsaved */ }
  };

  const send = async () => {
    if (!input.trim() || loading) return;

    const userLocalId = crypto.randomUUID();
    const userMsg = { localId: userLocalId, role: "user", content: input.trim(), saved: !sessionId };
    const updatedMessages = [...currentMessages, userMsg];
    setCurrentMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setStreaming("");

    // Persist user message (non-blocking, only if session exists)
    if (sessionId) {
      saveMessage(sessionId, user.id, "user", userMsg.content, tokenRef.current)
        .then(() => updateMessage(userLocalId, { saved: true }))
        .catch(() => { /* stays unsaved */ });
    }

    // Build Claude context
    const allPastMessages = pastSessions.flatMap((s) => s.messages);
    const contextMessages = buildMirrorChatMessages(reflection, allPastMessages, updatedMessages);

    const result = await callClaudeStream({
      system: MIRROR_CHAT_SYSTEM_PROMPT,
      messages: contextMessages,
      maxTokens: 300,
      onChunk: (text) => setStreaming(text),
    });

    setLoading(false);
    setStreaming("");

    if (result) {
      const processed = processAIResponse(result);
      if (processed.triggerCrisisModal) setCrisisOpen(true);

      const aiLocalId = crypto.randomUUID();
      const aiMsg = { localId: aiLocalId, role: "assistant", content: processed.text, saved: !sessionId };
      setCurrentMessages((prev) => [...prev, aiMsg]);

      // Persist assistant message (non-blocking, only if session exists)
      if (sessionId) {
        saveMessage(sessionId, user.id, "assistant", aiMsg.content, tokenRef.current)
          .then(() => updateMessage(aiLocalId, { saved: true }))
          .catch(() => { /* stays unsaved */ });
      }
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
  const inputDisabled = loading;

  return (
    <motion.div
      className="mirror-chat"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mirror-chat-header">
        <button className="btn-back" onClick={onClose} style={{ width: "auto" }}>← Volver</button>
        <span className="mirror-chat-counter">
          {isResumed ? "Conversación guardada" : "Nueva conversación"}
        </span>
      </div>

      <div className="mirror-chat-messages">
        {/* Session init error — shows Supabase error for debugging */}
        {initError && (
          <div className="mirror-chat-init-error">
            <strong>Error al iniciar sesión:</strong> {initError}
            <br /><small>Los mensajes no se guardarán hasta resolver esto.</small>
          </div>
        )}

        {/* Session initializing */}
        {!initialized && (
          <motion.p
            className="mirror-chat-init-hint"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            Preparando tu espejo...
          </motion.p>
        )}

        {/* Past sessions (read-only) — skip empty sessions */}
        {pastSessions.filter((s) => s.messages.length > 0).map((session) => (
          <div key={session.id} className="mirror-chat-past-session">
            <div className="mirror-chat-session-divider">
              <span>{formatSessionDate(session.startedAt)}</span>
            </div>
            {session.messages.map((msg, i) => (
              <div key={msg.id || i} className={`chat-bubble ${msg.role} past`}>
                {msg.content}
              </div>
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`chat-bubble ${msg.role}`}>{msg.content}</div>
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

        {/* Streaming response */}
        {loading && streaming && (
          <motion.div
            className="chat-bubble assistant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            aria-live="polite"
          >
            {streaming}<span className="mirror-cursor">▌</span>
          </motion.div>
        )}

        {loading && !streaming && (
          <motion.div
            className="chat-bubble assistant chat-typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span /><span /><span />
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
          disabled={inputDisabled}
          aria-label="Mensaje al espejo"
        />
        <button
          className="mirror-chat-send"
          onClick={send}
          disabled={!input.trim() || inputDisabled}
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
