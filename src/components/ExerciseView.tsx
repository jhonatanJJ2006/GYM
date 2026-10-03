import { useState, type ReactNode } from "react";
import {
  ExerciseViewContext,
  readExerciseView,
  useExerciseView,
  usePersistExerciseView,
  type ExerciseViewMode,
} from "../lib/exerciseView.ts";
import { cn } from "../lib/utils.ts";

export function ExerciseViewProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ExerciseViewMode>(readExerciseView);
  usePersistExerciseView(mode);
  return <ExerciseViewContext.Provider value={{ mode, setMode }}>{children}</ExerciseViewContext.Provider>;
}

const OPTIONS = [
  ["photos", "Fotos"],
  ["figures", "Figuras"],
] as const;

/** Alterna las fotos actuales y las figuras. Solo afecta ejercicios. */
export function ExerciseViewSwitch({ className }: { className?: string }) {
  const { mode, setMode } = useExerciseView();
  return (
    <div className={className}>
      <p className="mb-2 text-sm text-muted">Vista de los ejercicios</p>
      <div role="group" aria-label="Vista de los ejercicios" className="grid grid-cols-2 gap-1 rounded-row border border-line bg-ink-2 p-1">
        {OPTIONS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
            className={cn(
              "min-h-11 rounded-row text-sm font-medium",
              mode === value ? "bg-panel-2 text-cream ring-1 ring-line" : "text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
