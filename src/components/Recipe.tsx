import type { Meal } from "../data/meals.ts";
import type { Exercise } from "../data/sessions.ts";
import { ExerciseFigure } from "./ExerciseFigure.tsx";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion.tsx";

export function ExerciseList({ exercises }: { exercises: readonly Exercise[] }) {
  return (
    <Accordion type="multiple" className="divide-y divide-white/10">
      {exercises.map((exercise, index) => (
        <AccordionItem key={`${exercise.name}-${index}`} value={`${index}-${exercise.name}`} className="border-0">
          <AccordionTrigger className="min-h-14 py-3">
            <span className="flex gap-3">
              <span className="font-display text-lg leading-none text-accent">{index + 1}</span>
              <span className="min-w-0">
                <span className="block font-semibold leading-snug">{exercise.name}</span>
                <span className="mt-0.5 block text-sm text-muted">{exercise.reps}</span>
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="overflow-hidden rounded-2xl bg-ink ring-1 ring-white/10">
              <p className="px-3 pt-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">Esquema del movimiento</p>
              <ExerciseFigure pose={exercise.pose} label={exercise.name} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-cream/90">{exercise.how}</p>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl bg-ink/70 px-3 py-3">
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">Repeticiones</dt>
                <dd className="mt-1 font-semibold leading-snug">{exercise.reps}</dd>
              </div>
              <div className="rounded-2xl bg-ink/70 px-3 py-3">
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">Peso</dt>
                <dd className="mt-1 font-semibold leading-snug">{exercise.weight}</dd>
                <dd className="mt-1 text-xs leading-relaxed text-accent">
                  {exercise.weightSuggested
                    ? "Sugerido para arrancar con 68 kg. No es un peso medido."
                    : "Sin número inventado: este movimiento va con el peso del cuerpo."}
                </dd>
              </div>
            </dl>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function MealDetail({ meal }: { meal: Meal }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-meal">Ingredientes</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          {meal.ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-meal">Paso a paso</p>
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
