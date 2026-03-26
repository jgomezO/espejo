import { createContext, useContext, useReducer } from "react";
import { createEmptyReflection } from "../services/storageService.js";

const ReflectionContext = createContext(null);

const initialState = {
  current: null,
  currentLayer: 0,
  isComplete: false,
};

function reflectionReducer(state, action) {
  switch (action.type) {
    case "START":
      return { ...state, current: createEmptyReflection(), currentLayer: 0, isComplete: false };
    case "RESUME":
      return { ...state, current: action.payload, currentLayer: 0, isComplete: false };
    case "UPDATE_LAYER":
      return {
        ...state,
        current: {
          ...state.current,
          layers: {
            ...state.current.layers,
            [action.layerKey]: {
              ...state.current.layers[action.layerKey],
              ...action.payload,
            },
          },
        },
      };
    case "NEXT_LAYER":
      return { ...state, currentLayer: state.currentLayer + 1 };
    case "PREV_LAYER":
      return { ...state, currentLayer: Math.max(0, state.currentLayer - 1) };
    case "SET_AI_SUMMARY":
      return {
        ...state,
        current: { ...state.current, aiSummary: action.payload, completed: true },
        isComplete: true,
      };
    case "SET_NUDGE":
      return {
        ...state,
        current: {
          ...state.current,
          aiNudges: { ...state.current.aiNudges, [action.key]: action.payload },
        },
      };
    case "SET_MIRROR_CHAT":
      return {
        ...state,
        current: { ...state.current, mirrorChat: action.payload },
      };
    case "COMPLETE":
      return { ...state, isComplete: true, current: { ...state.current, completed: true } };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function ReflectionProvider({ children }) {
  const [state, dispatch] = useReducer(reflectionReducer, initialState);

  return (
    <ReflectionContext.Provider value={{ state, dispatch }}>
      {children}
    </ReflectionContext.Provider>
  );
}

export function useReflectionContext() {
  const ctx = useContext(ReflectionContext);
  if (!ctx) throw new Error("useReflectionContext must be used within ReflectionProvider");
  return ctx;
}
