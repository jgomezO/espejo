import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { getReflections } from "../services/storageService.js";
import MirrorChat from "../components/reflection/MirrorChat.jsx";

function LoadingScreen() {
  return (
    <div className="app-loading">
      <div className="app-loading-icon"><Sparkles size={48} strokeWidth={1.5} /></div>
    </div>
  );
}

export default function ReflectionChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.state?.mode ?? "resumed";
  const [reflection, setReflection] = useState(location.state?.reflection ?? null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (reflection) return; // already have it from navigation state
    getReflections().then((list) => {
      const r = list.find((r) => r.id === id);
      if (!r || !r.aiSummary) {
        setNotFound(true);
      } else {
        setReflection(r);
      }
    });
  }, [id]);

  useEffect(() => {
    if (notFound) navigate("/history", { replace: true });
  }, [notFound]);

  if (!reflection) return <LoadingScreen />;

  const backTo = location.state?.backTo ?? "/history";

  return (
    <MirrorChat
      reflection={reflection}
      mode={mode}
      onClose={() => navigate(backTo)}
    />
  );
}
