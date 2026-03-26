import { useReflectionContext } from "../context/ReflectionContext.jsx";
import { saveReflection } from "../services/storageService.js";

export function useReflection() {
  const { state, dispatch } = useReflectionContext();

  const start = () => dispatch({ type: "START" });

  const updateLayer = (layerKey, payload) => {
    dispatch({ type: "UPDATE_LAYER", layerKey, payload });
  };

  const nextLayer = (layerKey, data) => {
    if (layerKey && data) {
      updateLayer(layerKey, data);
    }
    dispatch({ type: "NEXT_LAYER" });
  };

  const prevLayer = () => dispatch({ type: "PREV_LAYER" });

  const setAiSummary = (summary) => {
    dispatch({ type: "SET_AI_SUMMARY", payload: summary });
  };

  const save = (reflection) => {
    saveReflection(reflection);
  };

  const reset = () => dispatch({ type: "RESET" });

  return {
    current: state.current,
    currentLayer: state.currentLayer,
    isComplete: state.isComplete,
    start,
    updateLayer,
    nextLayer,
    prevLayer,
    setAiSummary,
    save,
    reset,
  };
}
