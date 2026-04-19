import { supabase } from "./supabaseClient.js";

const LOCAL_KEY = "espejo_reflections";

// ── Local helpers ──────────────────────────────────────────
function getLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function setLocal(reflections) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(reflections));
}

// ── Shape converters ───────────────────────────────────────
function toRow(r, userId) {
  return {
    id: r.id,
    user_id: userId,
    created_at: r.createdAt,
    layers: r.layers,
    ai_summary: r.aiSummary ?? null,
    therapy_questions: r.therapyQuestions ?? [],
    completed: r.completed ?? false,
  };
}

function fromRow(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    layers: row.layers,
    aiSummary: row.ai_summary,
    therapyQuestions: row.therapy_questions ?? [],
    hasChat: row.has_chat ?? false,
    completed: row.completed,
  };
}

// ── Public API ─────────────────────────────────────────────
export async function getReflections() {
  // Devuelve local inmediatamente, sincroniza con Supabase en background
  const local = getLocal();

  syncFromSupabase().catch(() => {});

  return local;
}

async function syncFromSupabase() {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000));

  const fetch = (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("reflections")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setLocal(data.map(fromRow));
  })();

  await Promise.race([fetch, timeout]);
}

export function saveReflection(reflection) {
  // Guardar en local síncronamente — nunca falla
  const local = getLocal();
  const idx = local.findIndex((r) => r.id === reflection.id);
  if (idx >= 0) local[idx] = reflection; else local.unshift(reflection);
  setLocal(local);

  // Sincronizar con Supabase en background
  upsertToSupabase(reflection).catch(() => {});

  return reflection;
}

async function upsertToSupabase(reflection) {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000));

  const upload = (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("reflections")
      .upsert(toRow(reflection, user.id), { onConflict: "id" });
  })();

  await Promise.race([upload, timeout]);
}

export function deleteReflection(id) {
  const local = getLocal().filter((r) => r.id !== id);
  setLocal(local);

  (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("reflections").delete().eq("id", id).eq("user_id", user.id);
        if (error) console.error("deleteReflection error:", error);
      }
    } catch (e) {
      console.error("deleteReflection exception:", e);
    }
  })();
}

export function deleteAllReflections() {
  localStorage.removeItem(LOCAL_KEY);

  // Borrar en Supabase en background
  (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("reflections").delete().eq("user_id", user.id);
      }
    } catch {}
  })();
}

export function createEmptyReflection() {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    layers: {
      narrative: { whatBringsYou: "", trigger: "", othersInvolved: "", situationType: "" },
      emotion: { selected: [], bodyLocation: "" },
      resonance: { _questions: null, _answers: {} },
      pattern: { _questions: null, _answers: {} },
      relationship: { _questions: null, _answers: {} },
      insight: { _questions: null, _answers: {} },
    },
    aiSummary: null,
    therapyQuestions: [],
    aiNudges: {
      afterNarrative: null,
      afterEmotion: null,
      afterResonance: null,
      afterPattern: null,
      afterRelationship: null,
    },
    hasChat: false,
    completed: false,
  };
}

import { getAuthToken } from "./chatService.js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Ensure a specific reflection exists in Supabase before operations that
 * depend on it (e.g. creating a chat session with FK on reflection_id).
 * Uses REST directly instead of Supabase JS client to avoid hanging.
 */
export async function syncReflection(reflection, userId) {
  const token = getAuthToken();
  if (!token || !userId) return;

  const row = toRow(reflection, userId);
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/reflections?on_conflict=id`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(row),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`syncReflection failed: ${res.status} ${text}`);
  }
}

// Migrate local reflections to Supabase after login
export async function migrateLocalToSupabase(userId) {
  const local = getLocal();
  if (local.length === 0) return;

  const rows = local.map((r) => toRow(r, userId));
  await supabase
    .from("reflections")
    .upsert(rows, { onConflict: "id", ignoreDuplicates: true });
}
