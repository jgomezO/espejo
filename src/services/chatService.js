const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getStoredToken() {
  try {
    const key = Object.keys(localStorage).find(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
    );
    if (key) {
      const data = JSON.parse(localStorage.getItem(key));
      return data?.access_token ?? null;
    }
  } catch {}
  return null;
}

function restHeaders() {
  const token = getStoredToken() ?? SUPABASE_ANON_KEY;
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function restGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: restHeaders(),
  });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function restPost(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "POST",
    headers: restHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

/**
 * Load all chat sessions (with their messages) for a reflection.
 */
export async function loadChatHistory(reflectionId) {
  try {
    const sessions = await restGet(
      `chat_sessions?reflection_id=eq.${reflectionId}&select=id,started_at&order=started_at.asc`
    );
    if (!sessions?.length) return { sessions: [] };

    const ids = sessions.map((s) => `"${s.id}"`).join(",");
    const messages = await restGet(
      `chat_messages?session_id=in.(${ids})&select=id,session_id,role,content,created_at&order=created_at.asc`
    );

    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        startedAt: s.started_at,
        messages: (messages || [])
          .filter((m) => m.session_id === s.id)
          .map((m) => ({ id: m.id, role: m.role, content: m.content, createdAt: m.created_at })),
      })),
    };
  } catch (err) {
    console.error("[chatService] loadChatHistory error:", err.message);
    return { sessions: [] };
  }
}

/**
 * Find the most recent session for today, or create a new one.
 */
export async function getOrCreateTodaySession(reflectionId, userId) {
  const sessions = await restGet(
    `chat_sessions?reflection_id=eq.${reflectionId}&select=id,started_at&order=started_at.desc&limit=1`
  );

  const latest = sessions?.[0];
  const today = new Date().toDateString();

  if (latest && new Date(latest.started_at).toDateString() === today) {
    return { id: latest.id, startedAt: latest.started_at };
  }

  const [newSession] = await restPost(
    "chat_sessions",
    { reflection_id: reflectionId, user_id: userId }
  );
  return { id: newSession.id, startedAt: newSession.started_at };
}

/**
 * Persist a single message.
 */
export async function saveMessage(sessionId, userId, role, content) {
  const [msg] = await restPost("chat_messages", {
    session_id: sessionId,
    user_id: userId,
    role,
    content,
  });
  return { id: msg.id, createdAt: msg.created_at };
}

/**
 * Quick summary for the history list.
 */
export async function getChatSummary(reflectionId) {
  try {
    const sessions = await restGet(
      `chat_sessions?reflection_id=eq.${reflectionId}&select=id`
    );
    if (!sessions?.length) return null;

    const ids = sessions.map((s) => `"${s.id}"`).join(",");
    const messages = await restGet(
      `chat_messages?session_id=in.(${ids})&select=id,created_at&order=created_at.desc`
    );
    if (!messages?.length) return null;

    return {
      totalMessages: messages.length,
      lastMessageAt: messages[0].created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Delete all chat data for a reflection.
 */
export async function deleteChat(reflectionId) {
  const token = getStoredToken() ?? SUPABASE_ANON_KEY;
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
  };
  await fetch(
    `${SUPABASE_URL}/rest/v1/chat_sessions?reflection_id=eq.${reflectionId}`,
    { method: "DELETE", headers }
  );
  await fetch(
    `${SUPABASE_URL}/rest/v1/reflections?id=eq.${reflectionId}`,
    {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ has_chat: false }),
    }
  );
}
