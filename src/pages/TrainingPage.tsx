import { useState } from "react";
import { PageIntro } from "../components/Brand.tsx";
import { ExerciseViewSwitch } from "../components/ExerciseView.tsx";
import { useModals } from "../components/Modals.tsx";
import { CompactRow } from "../components/system/CompactRow.tsx";
import { ExerciseThumb } from "../components/system/Thumbnail.tsx";
import { sessionFor, type SessionId } from "../data/sessions.ts";
import { DOW_LONG, RANGE_END, RANGE_START, addDays, dateOnly, formatLong, isInRange, toIso } from "../lib/dates.ts";
import { cn } from "../lib/utils.ts";

const STORAGE_KEY = "hierro.entreno.checks";

const GROUPS: Record<SessionId, readonly string[]> = {
  push: ["Pecho", "Tríceps"],
  legs: ["Cuádriceps", "Isquiotibiales"],
  pull: ["Espalda", "Bíceps"],
  tri: ["Hombro", "Tríceps"],
  bi: ["Hombro", "Bíceps"],
  legsB: ["Isquiotibiales", "Glúteo"],
  absA: ["Abdomen"],
  absB: ["Oblicuos"],
};

function readChecks(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const checks: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "boolean") checks[key] = value;
    }
    return checks;
  } catch {
    return {};
  }
}

function initialDay(): Date {
  const today = dateOnly(new Date());
  return isInRange(today) ? today : dateOnly(RANGE_START);
}

export function TrainingPage() {
  const modals = useModals();
  const [day, setDay] = useState(initialDay);
  const [checks, setChecks] = useState(readChecks);
  const session = sessionFor(day);
  const iso = toIso(day);
  const groups = GROUPS[session.id];
  const slice = Math.ceil(session.exercises.length / groups.length);
  const doneCount = session.exercises.filter((exercise) => checks[`${iso}:${exercise.id}`]).length;
  const atStart = day.getTime() <= dateOnly(RANGE_START).getTime();
  const atEnd = day.getTime() >= dateOnly(RANGE_END).getTime();

  function shift(delta: number) {
    const next = addDays(day, delta);
    if (!isInRange(next)) return;
    setDay(next);
  }

  function toggle(id: string) {
    const key = `${iso}:${id}`;
    setChecks((current) => {
      const next = { ...current, [key]: !current[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <div>
      <PageIntro title="Entreno">
        Un solo día. El ciclo sigue anclado al lunes 5 de octubre de 2026; la semana completa está en Semana y en el
        calendario.
      </PageIntro>

      <div className="mt-4 flex items-center gap-2" role="group" aria-label="Cambiar el día de entreno">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={atStart}
          className="min-h-12 shrink-0 rounded-row border border-line px-3 text-sm font-semibold disabled:opacity-40"
        >
          Anterior
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="font-display text-2xl capitalize tracking-tight text-[var(--color-mark)]">{DOW_LONG[day.getDay()]}</p>
          <p className="text-sm text-muted">{formatLong(day)}</p>
        </div>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={atEnd}
          className="min-h-12 shrink-0 rounded-row border border-line px-3 text-sm font-semibold disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>

      <article className="mt-4 rounded-row border border-line bg-panel p-4">
        <h2 className="font-display text-3xl tracking-tight">{session.title}</h2>
        <p className="mt-1 text-sm font-semibold tabular-nums text-cream/80">
          {session.time} · {session.minutesLabel}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{session.note}</p>
        <p className="mt-3 text-sm font-semibold">
          Hechos {doneCount} de {session.exercises.length}
        </p>
      </article>

      <ExerciseViewSwitch className="mt-4 max-w-sm" />

      {groups.map((group, groupIndex) => {
        const exercises = session.exercises.slice(groupIndex * slice, (groupIndex + 1) * slice);
        return (
          <section key={group} className="mt-6">
            <h3 className="mb-2 font-display text-2xl tracking-tight text-[var(--color-mark)]">{group}</h3>
            <ul className="space-y-1">
              {exercises.map((exercise) => {
                const index = session.exercises.indexOf(exercise);
                const checked = Boolean(checks[`${iso}:${exercise.id}`]);
                return (
                  <li key={exercise.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(exercise.id)}
                      aria-label={checked ? `Desmarcar ${exercise.name}` : `Marcar ${exercise.name} como hecho`}
                      className="size-5 shrink-0 accent-[var(--color-mark)]"
                    />
                    <div className="min-w-0 flex-1">
                      <CompactRow
                        title={exercise.name}
                        meta={exercise.reps}
                        wrap
                        className={cn(checked && "opacity-60")}
                        thumb={<ExerciseThumb pose={exercise.pose} name={exercise.name} />}
                        onClick={() => modals.openExercise(session.id, index)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
