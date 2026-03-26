import { createContext, useContext, useReducer, useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabaseClient.js";

const UserContext = createContext(null);
const LOCAL_KEY = "espejo_user";

const defaultUser = {
  name: "",
  dailyPromptEnabled: true,
  nudgesEnabled: true,
  onboardingCompleted: false,
};

function userReducer(state, action) {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "TOGGLE_DAILY_PROMPT":
      return { ...state, dailyPromptEnabled: !state.dailyPromptEnabled };
    case "TOGGLE_NUDGES":
      return { ...state, nudgesEnabled: !state.nudgesEnabled };
    case "COMPLETE_ONBOARDING":
      return { ...state, onboardingCompleted: true };
    case "LOAD":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

function getLocal() {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, undefined, () => ({
    ...defaultUser,
    ...(getLocal() ?? {}),
  }));
  const [initialized, setInitialized] = useState(false);
  const initializedRef = useRef(false);
  const userIdRef = useRef(null);
  const accessTokenRef = useRef(null);

  useEffect(() => {
    const fallback = setTimeout(() => {
      if (!initializedRef.current) {
        initializedRef.current = true;
        setInitialized(true);
      }
    }, 4000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id ?? null;
      userIdRef.current = userId;
      accessTokenRef.current = session?.access_token ?? null;

      if (initializedRef.current) return;

      if (userId) {
        supabase.from("user_preferences")
          .select("preferences")
          .eq("user_id", userId)
          .maybeSingle()
          .then(({ data }) => {
            clearTimeout(fallback);
            if (data?.preferences) {
              dispatch({ type: "LOAD", payload: data.preferences });
              localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...defaultUser, ...(getLocal() ?? {}), ...data.preferences }));
            }
            initializedRef.current = true;
            setInitialized(true);
          })
          .catch(() => {
            clearTimeout(fallback);
            initializedRef.current = true;
            setInitialized(true);
          });
      } else {
        clearTimeout(fallback);
        initializedRef.current = true;
        setInitialized(true);
      }
    });

    return () => {
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
  }, []);

  // Persistir en localStorage en cada cambio
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  }, [state]);

  // Guardar explícitamente en Supabase usando fetch directo (evita el cliente JS que cuelga en auth)
  async function saveToSupabase() {
    if (!userIdRef.current || !accessTokenRef.current) return false;
    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_preferences`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${accessTokenRef.current}`,
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        user_id: userIdRef.current,
        preferences: state,
        updated_at: new Date().toISOString(),
      }),
    });
    return res.ok;
  }

  return (
    <UserContext.Provider value={{ state, dispatch, initialized, saveToSupabase }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used within UserProvider");
  return ctx;
}
