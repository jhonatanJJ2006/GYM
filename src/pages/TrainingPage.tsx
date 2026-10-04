import { useState } from "react";
import { PageIntro } from "../components/Brand.tsx";
import { CoachView } from "../components/CoachView.tsx";
import { ExerciseViewSwitch } from "../components/ExerciseView.tsx";
import { useModals } from "../components/Modals.tsx";
import { exercisePhoto } from "../data/photos.ts";
import type { PoseId } from "../data/poses.ts";
import { sessionFor, type SessionId } from "../data/sessions.ts";
import { DOW_LONG, RANGE_END, RANGE_START, addDays, dateOnly, formatLong, isInRange, toIso } from "../lib/dates.ts";
import { useExerciseView } from "../lib/exerciseView.ts";
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

function CardMedia({ pose, name }: { pose: PoseId; name: string }) {
  const { mode } = useExerciseView();
  if (mode === "figures") {
    return (
      <span className="grid aspect-square w-full place-items-center overflow-hidden bg-ink">
        <CoachView pose={pose} decorative className="h-full w-full" />
      </span>
    );
  }
  const photo = exercisePhoto(pose, name);
  return <img src={photo.src} alt="" className="aspect-square w-full object-cover" />;
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
    <div className="mx-auto w-full min-w-0 max-w-[42rem]">
      <PageIntro title="Entreno">
        Un solo día. El ciclo sigue anclado al lunes 5 de octubre de 2026; la semana completa está en Semana y en el
        calendario.
      </PageIntro>

      <div
        className="mt-4 grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2"
        role="group"
        aria-label="Cambiar el día de entreno"
      >
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={atStart}
          className="min-h-12 rounded-row border border-line px-2.5 text-sm font-semibold disabled:opacity-40"
        >
          Anterior
        </button>
        <div className="min-w-0 text-center">
          <p className="break-words font-display text-2xl capitalize leading-none tracking-tight text-[var(--color-mark)]">
            {DOW_LONG[day.getDay()]}
          </p>
          <p className="mt-1 break-words text-sm text-muted">{formatLong(day)}</p>
        </div>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={atEnd}
          className="min-h-12 rounded-row border border-line px-2.5 text-sm font-semibold disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>

      <article className="mt-4 min-w-0 rounded-row border border-line bg-panel p-4">
        <h2 className="break-words font-display text-3xl tracking-tight">{session.title}</h2>
        <p className="mt-1 break-words text-sm font-semibold tabular-nums text-cream/80">
          {session.time} · {session.minutesLabel}
        </p>
        <p className="mt-3 break-words text-sm leading-relaxed text-muted">{session.note}</p>
        <p className="mt-3 text-sm font-semibold">
          Hechos {doneCount} de {session.exercises.length}
        </p>
      </article>

      <ExerciseViewSwitch className="mt-4 max-w-sm" />

      {groups.map((group, groupIndex) => {
        const exercises = session.exercises.slice(groupIndex * slice, (groupIndex + 1) * slice);
        return (
          <section key={group} className="mt-6 min-w-0">
            <h3 className="mb-2 break-words font-display text-2xl tracking-tight text-[var(--color-mark)]">{group}</h3>
            <ul className="space-y-3">
              {exercises.map((exercise) => {
                const index = session.exercises.indexOf(exercise);
                const checked = Boolean(checks[`${iso}:${exercise.id}`]);
                return (
                  <li
                    key={exercise.id}
                    className={cn(
                      "grid min-w-0 grid-cols-[minmax(0,5fr)_minmax(0,7fr)] overflow-hidden rounded-row border border-line bg-panel",
                      checked && "opacity-60",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => modals.openExercise(session.id, index)}
                      aria-label={`Abrir ${exercise.name}`}
                      className="min-w-0 self-start bg-ink"
                    >
                      <CardMedia pose={exercise.pose} name={exercise.name} />
                    </button>
                    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.75rem]">
                      <button
                        type="button"
                        onClick={() => modals.openExercise(session.id, index)}
                        className="min-w-0 px-3 py-2.5 text-left"
                      >
                        <span className="block break-words text-sm font-semibold leading-snug text-cream">
                          {exercise.name}
                        </span>
                        <span className="mt-1 block break-words text-sm leading-snug text-cream/85">{exercise.reps}</span>
                        <span className="mt-1 block break-words text-sm leading-snug text-muted">{exercise.weight}</span>
                      </button>
                      <label className="grid size-11 place-items-center self-start">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(exercise.id)}
                          aria-label={checked ? `Desmarcar ${exercise.name}` : `Marcar ${exercise.name} como hecho`}
                          className="size-6 accent-[var(--color-mark)]"
                        />
                      </label>
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
