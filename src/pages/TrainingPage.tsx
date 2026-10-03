import { useState } from "react";
import { useModals } from "../components/Modals.tsx";
import { CompactRow } from "../components/system/CompactRow.tsx";
import { ExerciseThumb } from "../components/system/Thumbnail.tsx";
import { SESSIONS, sessionFor, shoulderFocus, type Session } from "../data/sessions.ts";
import {
  ANCHOR_MON,
  WEEK_LETTERS,
  addDays,
  cycleWeek,
  formatWeekSpan,
  isInRange,
  isSameDay,
  toIso,
  weeksCoveringRange,
} from "../lib/dates.ts";
import { cn } from "../lib/utils.ts";

const ROUTINES: Session[] = [
  SESSIONS.push,
  SESSIONS.legs,
  SESSIONS.pull,
  SESSIONS.tri,
  SESSIONS.bi,
  SESSIONS.legsB,
  SESSIONS.absA,
  SESSIONS.absB,
];

const PATTERN = [
  ["Lunes", "Empuje · pecho y tríceps", "18:00–19:15"],
  ["Martes", "Pierna", "18:00–19:15"],
  ["Miércoles", "Jalón · espalda", "18:00–19:15"],
  ["Jueves", "Hombro, alterna tríceps y bíceps", "19:15–20:30"],
  ["Viernes", "Pierna B · posterior", "18:00–19:15"],
  ["Sábado", "Abdomen", "10:00–11:00"],
  ["Domingo", "Abdomen · oblicuos", "10:00–11:00"],
] as const;

export function TrainingPage() {
  const modals = useModals();
  const weeks = weeksCoveringRange();
  const [today] = useState(() => new Date());

  return (
    <div>
      <p className="font-display text-sm tracking-wide text-muted">Hierro</p>
      <h1 className="font-display text-4xl leading-none tracking-tight">Entreno</h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
        El ciclo abre el lunes 5 de octubre de 2026. Semanas 1 y 3, el jueves es hombro + tríceps. Semanas 2 y 4,
        hombro + bíceps. El primer jueves, el 8 de octubre, es hombro y tríceps. En febrero el jueves sigue igual.
      </p>
      {isInRange(today) ? (
        <div className="mt-5">
          <CompactRow
            title={sessionFor(today).title}
            meta={sessionFor(today).time}
            thumb={<ExerciseThumb pose={sessionFor(today).exercises[0].pose} />}
            onClick={() => modals.openGym(toIso(today))}
          />
        </div>
      ) : null}

      <div className="-mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {[1, 2, 3, 4].map((week) => {
          const thursday = addDays(ANCHOR_MON, (week - 1) * 7 + 3);
          const focus = shoulderFocus(week);
          return (
            <article
              key={week}
              className="w-[82%] shrink-0 snap-start rounded-[1.6rem] bg-panel p-4 ring-1 ring-white/10 sm:w-[46%]"
            >
              <p className="text-sm font-semibold text-cream">Semana {week}</p>
              <h2 className="mt-2 font-display text-3xl leading-none tracking-tight">Hombro + {focus}</h2>
              <p className="mt-2 text-sm text-muted">
                Jueves {thursday.getDate()} de octubre · {sessionFor(thursday).time}
              </p>
              <ol className="mt-4 grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }, (_, index) => addDays(ANCHOR_MON, (week - 1) * 7 + index)).map((date) => {
                  const session = sessionFor(date);
                  return (
                    <li key={toIso(date)} className="rounded-xl bg-ink px-0.5 py-1.5 text-center">
                      <span className="block text-[0.58rem] text-muted">{WEEK_LETTERS[(date.getDay() + 6) % 7]}</span>
                      <span className="mt-1 block text-[0.68rem] font-semibold text-cream">
                        {session.short}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </article>
          );
        })}
      </div>

      <h2 className="mb-2 mt-8 font-display text-2xl tracking-tight">Cada día</h2>
      <ul className="overflow-hidden rounded-[1.4rem] bg-panel">
        {PATTERN.map(([day, title, time], index) => {
          const session = [
            SESSIONS.push,
            SESSIONS.legs,
            SESSIONS.pull,
            SESSIONS.tri,
            SESSIONS.legsB,
            SESSIONS.absA,
            SESSIONS.absB,
          ][index];
          return (
            <li key={day} className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3 last:border-0">
              <span className="flex min-w-0 items-center gap-3">
                <ExerciseThumb pose={session.exercises[0].pose} />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{day}</span>
                  <span className="text-sm text-muted">{title}</span>
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-cream/80">{time}</span>
            </li>
          );
        })}
      </ul>

      <h2 className="mb-1 mt-8 font-display text-2xl tracking-tight">Qué semana toca</h2>
      <p className="mb-3 text-sm text-muted">
        Del 1 de octubre de 2026 al 28 de febrero de 2027. HT es hombro + tríceps. HB es hombro + bíceps.
      </p>
      <div className="space-y-3">
        {weeks.map((week) => {
          const inside = week.filter((date) => isInRange(date));
          const sample = inside[0];
          if (!sample) return null;
          return (
            <article key={toIso(sample)} className="rounded-2xl bg-ink-2 p-3">
              <p className="text-sm font-semibold">
                Ciclo {cycleWeek(sample)}
                <span className="ml-2 font-medium text-muted">{formatWeekSpan(inside)}</span>
              </p>
              <ol className="mt-2 grid grid-cols-7 gap-1">
                {week.map((date) => {
                  if (!isInRange(date)) return <li key={toIso(date)} />;
                  const session = sessionFor(date);
                  return (
                    <li
                      key={toIso(date)}
                      className={cn(
                        "rounded-xl bg-panel px-0.5 py-1.5 text-center",
                        isSameDay(date, today) && "ring-1 ring-cream/60",
                      )}
                    >
                      <span className="block font-display text-base leading-none">{date.getDate()}</span>
                      <span className="mt-1 block text-[0.62rem] font-semibold text-cream">
                        {session.short}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </article>
          );
        })}
      </div>

      <h2 className="mb-2 mt-8 font-display text-2xl tracking-tight">Rutinas</h2>
      <p className="mb-3 text-sm text-muted">Abre una sesión. La foto grande está en el modal; aquí solo hay una miniatura.</p>
      <ul className="space-y-1">
        {ROUTINES.map((session) => (
          <li key={session.id}>
            <CompactRow
              title={session.title}
              meta={session.time}
              thumb={<ExerciseThumb pose={session.exercises[0].pose} />}
              onClick={() => modals.openSession(session.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
