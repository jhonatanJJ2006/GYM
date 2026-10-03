import { createContext, useContext, useEffect } from "react";

export type ExerciseViewMode = "photos" | "figures";

export const EXERCISE_VIEW_KEY = "hierro.exercise-view";

export type ExerciseViewApi = {
  mode: ExerciseViewMode;
  setMode: (mode: ExerciseViewMode) => void;
};

export const ExerciseViewContext = createContext<ExerciseViewApi | null>(null);

export function readExerciseView(): ExerciseViewMode {
  try {
    return localStorage.getItem(EXERCISE_VIEW_KEY) === "figures" ? "figures" : "photos";
  } catch {
    return "photos";
  }
}

export function useExerciseView(): ExerciseViewApi {
  const value = useContext(ExerciseViewContext);
  if (!value) throw new Error("Falta el proveedor de la vista de ejercicios");
  return value;
}

export function usePersistExerciseView(mode: ExerciseViewMode) {
  useEffect(() => {
    try {
      localStorage.setItem(EXERCISE_VIEW_KEY, mode);
    } catch {
      /* almacenamiento bloqueado: la elección vive solo en esta visita */
    }
  }, [mode]);
}

