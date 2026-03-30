const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

export async function loadChatHistory(reflectionId, token) {
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

export async function getOrCreateTodaySession(reflectionId, userId, token) {
  const sessions = await restGet(
    `chat_sessions?reflection_id=eq.${reflectionId}&select=id,started_at&order=started_at.desc&limit=1`,
    token
  );

  const latest = sessions?.[0];
  const today = new Date().toDateString();

  if (latest && new Date(latest.started_at).toDateString() === today) {
    return { id: latest.id, startedAt: latest.started_at };
  }

  try {
    const [newSession] = await restPost(
      "chat_sessions",
      { reflection_id: reflectionId, user_id: userId },
      token
    );
    return { id: newSession.id, startedAt: newSession.started_at };
  } catch (err) {
    // 409 = session already exists (e.g. React Strict Mode double-mount created it)
    if (err.message?.includes("409")) {
      const existing = await restGet(
        `chat_sessions?reflection_id=eq.${reflectionId}&select=id,started_at&order=started_at.desc&limit=1`,
        token
      );
      if (existing?.[0]) return { id: existing[0].id, startedAt: existing[0].started_at };
    }
    throw err;
  }
}

export async function saveMessage(sessionId, userId, role, content, token) {
  const [msg] = await restPost(
    "chat_messages",
    { session_id: sessionId, user_id: userId, role, content },
    token
  );
  return { id: msg.id, createdAt: msg.created_at };
}

export async function getChatSummary(reflectionId) {
  // getChatSummary runs from the history list where we don't have a token handy,
  // so we read it directly from localStorage (sync, no hanging).
  const token = (() => {
    try {
      const key = Object.keys(localStorage).find(
        (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
      );
      if (key) return JSON.parse(localStorage.getItem(key))?.access_token ?? null;
    } catch {}
    return null;
  })();

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

export async function deleteChat(reflectionId, token) {
  await restDelete(`chat_sessions?reflection_id=eq.${reflectionId}`, token);
  await restPatch(`reflections?id=eq.${reflectionId}`, { has_chat: false }, token);
}
