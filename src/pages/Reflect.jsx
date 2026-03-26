import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReflection } from "../hooks/useReflection.js";
import ReflectionFlow from "../components/reflection/ReflectionFlow.jsx";

export default function Reflect() {
  const { current, start } = useReflection();
  const navigate = useNavigate();

  useEffect(() => {
    if (!current) {
      start();
    }
  }, []);

  return <ReflectionFlow />;
}
