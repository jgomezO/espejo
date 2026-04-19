const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ── Token helper (synchronous, reads from localStorage) ──────
export function getAuthToken() {
  try {
    const key = Object.keys(localStorage).find(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
    );
    if (key) {
      const stored = JSON.parse(localStorage.getItem(key));
      return stored?.access_token ?? null;
    }
  } catch {}
  return null;
}

// ── REST helpers ─────────────────────────────────────────────
function makeHeaders(token) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token ?? SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function restGet(path, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: makeHeaders(token),
  });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function restPost(path, body, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "POST",
    headers: makeHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function restDelete(path, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "DELETE",
    headers: makeHeaders(token),
  });
  if (!res.ok) throw new Error(`DELETE ${path} → ${res.status}: ${await res.text()}`);
}

async function restPatch(path, body, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "PATCH",
    headers: makeHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} → ${res.status}: ${await res.text()}`);
}

// ── Public API ───────────────────────────────────────────────

export async function loadChatHistory(reflectionId) {
  const token = getAuthToken();
  if (!token) return { sessions: [] };

  let sessions;
  try {
    sessions = await restGet(
      `chat_sessions?reflection_id=eq.${reflectionId}&select=id,started_at&order=started_at.asc`,
      token
    );
  } catch (err) {
    console.error("[chatService] loadChatHistory sessions error:", err.message);
    return { sessions: [] };
  }

  if (!sessions?.length) return { sessions: [] };

  let messages = [];
  try {
    const ids = sessions.map((s) => `"${s.id}"`).join(",");
    messages = await restGet(
      `chat_messages?session_id=in.(${ids})&select=id,session_id,role,content,created_at&order=created_at.asc`,
      token
    ) ?? [];
  } catch (err) {
    console.error("[chatService] loadChatHistory messages error:", err.message);
  }

  return {
    sessions: sessions.map((s) => ({
      id: s.id,
      startedAt: s.started_at,
      messages: messages
        .filter((m) => m.session_id === s.id)
        .map((m) => ({ id: m.id, role: m.role, content: m.content, createdAt: m.created_at })),
    })),
  };
}

/**
 * Ensures a chat session exists for today. Creates one if needed.
 * Also syncs the reflection to Supabase first (FK dependency).
 */
export async function ensureSession(reflectionId, userId) {
  const token = getAuthToken();
  if (!token) throw new Error("No auth token");

  // Check if today's session already exists
  const sessions = await restGet(
    `chat_sessions?reflection_id=eq.${reflectionId}&select=id,started_at&order=started_at.desc&limit=1`,
    token
  );

  const latest = sessions?.[0];
  const today = new Date().toDateString();

  if (latest && new Date(latest.started_at).toDateString() === today) {
    return latest.id;
  }

  // Create new session
  try {
    const result = await restPost(
      "chat_sessions",
      { reflection_id: reflectionId, user_id: userId },
      token
    );
    const newSession = Array.isArray(result) ? result[0] : result;
    return newSession.id;
  } catch (err) {
    // 409 = already exists (race / Strict Mode double-mount)
    if (err.message?.includes("409")) {
      const existing = await restGet(
        `chat_sessions?reflection_id=eq.${reflectionId}&select=id,started_at&order=started_at.desc&limit=1`,
        token
      );
      if (existing?.[0]) return existing[0].id;
    }
    throw err;
  }
}

export async function saveMessage(sessionId, userId, role, content) {
  const token = getAuthToken();
  if (!token) throw new Error("No auth token");

  const result = await restPost(
    "chat_messages",
    { session_id: sessionId, user_id: userId, role, content },
    token
  );
  const msg = Array.isArray(result) ? result[0] : result;
  return { id: msg.id, createdAt: msg.created_at };
}

export async function getChatSummary(reflectionId) {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const sessions = await restGet(
      `chat_sessions?reflection_id=eq.${reflectionId}&select=id`,
      token
    );
    if (!sessions?.length) return null;

    const ids = sessions.map((s) => `"${s.id}"`).join(",");
    const messages = await restGet(
      `chat_messages?session_id=in.(${ids})&select=id,created_at&order=created_at.desc`,
      token
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

export async function deleteChat(reflectionId) {
  const token = getAuthToken();
  if (!token) return;
  await restDelete(`chat_sessions?reflection_id=eq.${reflectionId}`, token);
  await restPatch(`reflections?id=eq.${reflectionId}`, { has_chat: false }, token);
}
