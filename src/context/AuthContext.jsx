import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient.js";
import { migrateLocalToSupabase } from "../services/storageService.js";

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const key = Object.keys(localStorage).find(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
    );
    if (key) {
      const data = JSON.parse(localStorage.getItem(key));
      if (data?.user) return data.user;
    }
  } catch {}
  return undefined;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser); // read from storage synchronously

  useEffect(() => {
    // Validate session with server in the background
    const timeout = setTimeout(() => setUser((u) => u === undefined ? null : u), 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      setUser(session?.user ?? null);
    }).catch(() => {
      clearTimeout(timeout);
      setUser((u) => u ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const nextUser = session?.user ?? null;
        if (nextUser) await migrateLocalToSupabase(nextUser.id);
        setUser(nextUser);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    return { error };
  };

  const signOut = () => {
    supabase.auth.signOut().catch(() => {});
    localStorage.clear();
    window.location.href = window.location.origin;
  };

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
