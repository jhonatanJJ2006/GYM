import type { Meal } from "../data/meals.ts";
import type { Exercise } from "../data/sessions.ts";
import { CompactRow } from "./system/CompactRow.tsx";
import { ExerciseThumb } from "./system/Thumbnail.tsx";

export function ExerciseList({
  exercises,
  onOpen,
}: {
  exercises: readonly Exercise[];
  onOpen: (index: number) => void;
}) {
  return (
    <ul className="space-y-1">
      {exercises.map((exercise, index) => (
        <li key={`${exercise.name}-${index}`}>
          <CompactRow
            title={exercise.name}
            meta={exercise.reps}
            thumb={<ExerciseThumb pose={exercise.pose} name={exercise.name} />}
            onClick={() => onOpen(index)}
          />
        </li>
      ))}
    </ul>
  );
}

export function MealDetail({ meal }: { meal: Meal }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-cream">Ingredientes</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          {meal.ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-sm font-semibold text-cream">Paso a paso</p>
        <ol className="mt-2 space-y-2 text-sm leading-relaxed">
          {meal.steps.map((step, index) => (
            <li key={step} className="flex gap-2">
              <span className="font-display text-cream">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
