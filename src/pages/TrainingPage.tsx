import { useState } from "react";
import { PageIntro } from "../components/Brand.tsx";
import { CoachView } from "../components/CoachView.tsx";
import { useModals } from "../components/Modals.tsx";
import { MonthPicker, PeriodBar, useHorizon } from "../components/PeriodBar.tsx";
import type { PoseId } from "../data/poses.ts";
import { sessionFor, type SessionId } from "../data/sessions.ts";
import { ANCHOR_MON, DOW_LONG, toIso } from "../lib/dates.ts";
import { useStagger } from "../components/Motion.tsx";
import { cn } from "../lib/utils.ts";

const STORAGE_KEY = "hierro.entreno.checks";

const GROUPS: Record<SessionId, { label: string; from: number; to: number }[]> = {
  push: [
    { label: "Pecho", from: 0, to: 5 },
    { label: "Tríceps", from: 5, to: 10 },
  ],
  legs: [
    { label: "Cuádriceps", from: 0, to: 5 },
    { label: "Gemelos", from: 5, to: 10 },
  ],
  pull: [
    { label: "Espalda", from: 0, to: 5 },
    { label: "Bíceps", from: 5, to: 10 },
  ],
  tri: [
    { label: "Hombro", from: 0, to: 5 },
    { label: "Tríceps", from: 5, to: 10 },
  ],
  bi: [
    { label: "Hombro", from: 0, to: 5 },
    { label: "Bíceps", from: 5, to: 10 },
  ],
  legsB: [
    { label: "Isquiotibiales", from: 0, to: 4 },
    { label: "Gemelos", from: 4, to: 7 },
    { label: "Glúteo", from: 7, to: 10 },
  ],
  absA: [{ label: "Abdomen", from: 0, to: 5 }],
  absB: [{ label: "Oblicuos", from: 0, to: 5 }],
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

function CardMedia({ pose }: { pose: PoseId; name: string }) {
  return (
    <span className="grid aspect-square w-full place-items-center overflow-hidden bg-ink">
      <CoachView pose={pose} decorative className="h-full w-full" />
    </span>
  );
}

export function TrainingPage() {
  const modals = useModals();
  const horizon = useHorizon(ANCHOR_MON);
  const staggerRef = useStagger<HTMLDivElement>(`${horizon.view}-${toIso(horizon.date)}`);
  const day = horizon.date;
  const [checks, setChecks] = useState(readChecks);
  const session = sessionFor(day);
  const iso = toIso(day);
  const groups = GROUPS[session.id];
  const doneCount = session.exercises.filter((exercise) => checks[`${iso}:${exercise.id}`]).length;

  function toggle(id: string) {
    const key = `${iso}:${id}`;
    setChecks((current) => {
      const next = { ...current, [key]: !current[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-[42rem] lg:max-w-none">
      <PageIntro title="Entreno">
        Ciclo de 4 semanas desde el lunes 5 de octubre de 2026 hasta el 2 de febrero de 2027. Lunes pecho y tríceps,
        martes cuádriceps y gemelos, miércoles espalda y bíceps, jueves hombro (tríceps en semanas 1 y 3, bíceps en 2 y
        4), viernes femoral, gemelos y glúteo. Fin de semana, abdomen.
      </PageIntro>

      <div className="lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start lg:gap-6">
      <aside className="min-w-0 lg:sticky lg:top-20">
      <PeriodBar
        label="entreno"
        date={day}
        view={horizon.view}
        atStart={horizon.atStart}
        atEnd={horizon.atEnd}
        onDate={horizon.setDate}
        onView={horizon.setView}
        onStep={horizon.step}
      />

      {horizon.view === "semana" ? (
        <div className="mt-3 grid grid-cols-7 gap-1" data-rise>
          {horizon.week.map((item) => {
            const itemSession = sessionFor(item);
            const on = toIso(item) === iso;
            return (
              <button
                key={toIso(item)}
                type="button"
                onClick={() => horizon.setDate(item)}
                className={cn(
                  "min-h-14 rounded-row px-0.5 text-center",
                  on ? "border border-accent/40 bg-panel-2 text-accent" : "border border-line bg-panel text-muted",
                )}
              >
                <span className="block text-[0.62rem] font-semibold">{DOW_LONG[item.getDay()].slice(0, 3)}</span>
                <span className="block font-display text-lg leading-none">{item.getDate()}</span>
                <span className="block text-[0.62rem]">{itemSession.short}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {horizon.view === "mes" ? (
        <MonthPicker date={day} onChoose={horizon.setDate} caption={(item) => sessionFor(item).short} />
      ) : null}

      <article className="card mt-4 min-w-0 p-5">
        <h2 className="display-title break-words text-3xl">{session.title}</h2>
        <p className="mt-1 break-words text-sm font-semibold tabular-nums text-cream/80">
          {session.time} · {session.minutesLabel}
        </p>
        <p className="mt-3 break-words text-sm leading-relaxed text-muted">{session.note}</p>
        <p className="mt-3 text-sm font-semibold">
          Hechos {doneCount} de {session.exercises.length}
        </p>
      </article>

      </aside>
      <div ref={staggerRef} className="min-w-0">

      {groups.map((group) => {
        const exercises = session.exercises.slice(group.from, group.to);
        return (
          <section key={group.label} data-day-panel className="mt-6 min-w-0">
            <h3 className="display-title mb-2 break-words text-2xl">{group.label}</h3>
            <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
              {exercises.map((exercise) => {
                const index = session.exercises.indexOf(exercise);
                const checked = Boolean(checks[`${iso}:${exercise.id}`]);
                return (
                  <li
                    key={exercise.id}
                    data-stagger
                    className={cn(
                      "card grid min-w-0 grid-cols-[minmax(0,5fr)_minmax(0,7fr)] overflow-hidden",
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
      </div>
    </div>
  );
}
