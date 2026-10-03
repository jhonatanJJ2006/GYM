import type { Meal } from "../data/meals.ts";
import type { Exercise } from "../data/sessions.ts";
import { ExerciseFigure } from "./ExerciseFigure.tsx";

export function ExerciseList({
  exercises,
  onOpen,
}: {
  exercises: readonly Exercise[];
  onOpen: (index: number) => void;
}) {
  return (
    <ul className="space-y-2">
      {exercises.map((exercise, index) => (
        <li key={`${exercise.name}-${index}`}>
          <button
            type="button"
            onClick={() => onOpen(index)}
            className="w-full overflow-hidden rounded-[1.4rem] bg-ink text-left ring-1 ring-white/10"
          >
            <ExerciseFigure pose={exercise.pose} label={exercise.name} />
            <span className="block px-3 py-3">
              <span className="block font-display text-xl leading-tight">{exercise.name}</span>
              <span className="mt-1 block text-sm text-muted">{exercise.reps}</span>
              <span className="mt-1 block text-sm text-cream/85">
                {exercise.weightSuggested ? `Peso sugerido: ${exercise.weight}` : exercise.weight}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function MealDetail({ meal }: { meal: Meal }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-meal">Ingredientes</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          {meal.ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-sm font-semibold text-meal">Paso a paso</p>
        <ol className="mt-2 space-y-2 text-sm leading-relaxed">
          {meal.steps.map((step, index) => (
            <li key={step} className="flex gap-2">
              <span className="font-display text-accent">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
