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
      if (user) await supabase.from("reflections").delete().eq("id", id).eq("user_id", user.id);
    } catch {}
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
      narrative: { situation: "", people: "", context: "" },
      emotion: { primary: "", secondary: [], intensity: 5, bodyLocation: "" },
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
    mirrorChat: [],
    completed: false,
  };
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
