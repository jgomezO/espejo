import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { callClaudeStream, processAIResponse } from "../../services/anthropicService.js";
import { MIRROR_CHAT_SYSTEM_PROMPT, buildReflectionPrompt } from "../../utils/prompts.js";
import { saveReflection } from "../../services/storageService.js";
import SafetyDisclaimer from "../safety/SafetyDisclaimer.jsx";
import CrisisModal from "../crisis/CrisisModal.jsx";

const MAX_TURNS = 5;

export default function MirrorChat({ reflection, onClose }) {
  const [messages, setMessages] = useState([]); // {role, content}
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const send = async () => {
    if (!input.trim() || loading || turnCount >= MAX_TURNS) return;

    const userMsg = { role: "user", content: input.trim() };
    const newTurn = turnCount + 1;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setStreaming("");
    setTurnCount(newTurn);

    const isLastTurn = newTurn >= MAX_TURNS;
    const systemPrompt = isLastTurn
      ? MIRROR_CHAT_SYSTEM_PROMPT + "\n\nEsta es la ÚLTIMA pregunta del usuario en esta conversación. Ofrece un cierre cálido y una invitación a volver cuando lo necesite."
      : MIRROR_CHAT_SYSTEM_PROMPT;

    const contextMessages = [
      { role: "user", content: buildReflectionPrompt(reflection) },
      { role: "assistant", content: reflection.aiSummary || "" },
      ...messages,
      userMsg,
    ];

    const result = await callClaudeStream({
      system: systemPrompt,
      messages: contextMessages,
      maxTokens: 300,
      onChunk: (text) => setStreaming(text),
    });

    setLoading(false);
    setStreaming("");

    if (result) {
      const processed = processAIResponse(result);
      if (processed.triggerCrisisModal) setCrisisOpen(true);
      const aiMsg = { role: "assistant", content: processed.text };
      const updatedMessages = [...messages, userMsg, aiMsg];
      setMessages(updatedMessages);

      // Save chat to reflection
      const updated = { ...reflection, mirrorChat: updatedMessages };
      await saveReflection(updated);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isDone = turnCount >= MAX_TURNS && !loading;

  return (
    <motion.div
      className="mirror-chat"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mirror-chat-header">
        <button className="btn-back" onClick={onClose} style={{ textAlign: "left", width: "auto" }}>
          ← Volver al espejo
        </button>
        <span className="mirror-chat-counter">
          {turnCount < MAX_TURNS
            ? `Pregunta ${turnCount + 1} de ${MAX_TURNS}`
            : "Conversación completada"}
        </span>
      </div>

      <div className="mirror-chat-messages">
        <div className="mirror-chat-intro">
          <p className="ai-text">Tu espejo está aquí. ¿Qué quieres explorar?</p>
        </div>

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`chat-bubble ${msg.role}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {msg.content}
            </motion.div>
          ))}

          {loading && streaming && (
            <motion.div
              className="chat-bubble assistant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              aria-live="polite"
            >
              {streaming}
              <span className="mirror-cursor">▌</span>
            </motion.div>
          )}

          {loading && !streaming && (
            <motion.div className="chat-bubble assistant chat-typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span />
              <span />
              <span />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {isDone ? (
        <motion.div
          className="mirror-chat-done"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button className="btn-continue" onClick={onClose}>
            Guardar reflexión completa
          </button>
        </motion.div>
      ) : (
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
      )}
      <SafetyDisclaimer variant="C" />
      <CrisisModal isOpen={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </motion.div>
  );
}
