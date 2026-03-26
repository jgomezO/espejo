import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError("No pudimos conectar con Google. Intenta de nuevo.");
      setLoading(false);
    }
    // On success, Supabase redirects to Google — no need to setLoading(false)
  };

  return (
    <div className="login-screen">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="login-icon"><Sparkles size={52} strokeWidth={1.5} /></div>
        <h1 className="login-title">Espejo Emocional</h1>
        <p className="login-tagline">Un espacio para mirarte adentro</p>

        <div className="login-form">
          <p className="login-desc">
            Accede de forma segura con tu cuenta de Google.
          </p>
          {error && <p className="login-error">{error}</p>}
          <button
            className="btn-google"
            onClick={handleGoogle}
            disabled={loading}
          >
            {loading ? (
              <span className="btn-google-spinner" aria-hidden="true" />
            ) : (
              <GoogleIcon />
            )}
            <span>{loading ? "Conectando..." : "Continuar con Google"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
