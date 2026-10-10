import { PageIntro } from "../components/Brand.tsx";
import { Legend } from "../components/Legend.tsx";
import { useModals } from "../components/Modals.tsx";
import { MonthPicker, PeriodBar, useHorizon } from "../components/PeriodBar.tsx";
import { classKey, classesFor } from "../data/courses.ts";
import { sessionFor, shoulderFocus } from "../data/sessions.ts";
import { ANCHOR_MON, DOW_LONG, cycleWeek, isSameDay, toIso } from "../lib/dates.ts";
import { useStagger } from "../components/Motion.tsx";
import { buildDay } from "../lib/schedule.ts";
import { formatClock, formatDuration } from "../lib/time.ts";
import { isoWeek } from "../lib/progress.ts";
import { cn } from "../lib/utils.ts";

export function WeekPage() {
  const modals = useModals();
  const horizon = useHorizon(ANCHOR_MON);
  const staggerRef = useStagger<HTMLDivElement>(`${horizon.view}-${toIso(horizon.date)}`);
  const { date, view, week } = horizon;
  const days = view === "semana" ? week : [date];
  const focus = shoulderFocus(cycleWeek(date));

  return (
    <div>
      <PageIntro title="Semana">
        Malla real del día que elijas, del 1 de octubre de 2026 al 28 de febrero de 2027. El ciclo de hombro arranca el
        lunes 5 de octubre: semanas 1 y 3 tríceps, semanas 2 y 4 bíceps. El primer jueves con clases es el 8 de octubre.
      </PageIntro>

      <div data-rise className="mb-1 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Planificación</span>
        <span className="chip text-accent">Semana {isoWeek(date)}</span>
        <span className="chip text-muted">Ciclo {cycleWeek(date)}</span>
        <span className="chip text-muted">{week.length} sesiones prog.</span>
      </div>

      <PeriodBar
        label="la semana"
        date={date}
        view={view}
        atStart={horizon.atStart}
        atEnd={horizon.atEnd}
        onDate={horizon.setDate}
        onView={horizon.setView}
        onStep={horizon.step}
      />

      <p className="mt-3 text-sm font-semibold text-cream">
        Semana {cycleWeek(date)} del ciclo. El jueves de esta semana es hombro + {focus}. Gym lunes, jueves y viernes 07:00–09:00;
        martes y miércoles 18:00–19:15; sábado y domingo abdomen 10:00–11:00.
      </p>

      <ul data-rise className="mt-3 flex flex-wrap gap-2 text-xs" aria-label="Colores">
        {[
          ["tl-dot-gym", "Entreno"],
          ["tl-dot-clase", "Clases"],
          ["tl-dot-trabajo", "Trabajo"],
          ["tl-dot-comida", "Dieta"],
        ].map(([dot, name]) => (
          <li key={name} className="chip text-muted">
            <span aria-hidden className={cn("size-1.5 rounded-full", dot)} />
            {name}
          </li>
        ))}
      </ul>

      {view === "mes" ? (
        <MonthPicker
          date={date}
          onChoose={horizon.setDate}
          caption={(day) => sessionFor(day).short}
        />
      ) : null}

      <div ref={staggerRef} className={view === "semana" ? "mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4" : "mt-4"}>
        {days.map((day) => {
          const session = sessionFor(day);
          const classes = classesFor(day);
          const plan = buildDay(day);
          const active = isSameDay(day, date);
          return (
            <article
              key={toIso(day)}
              data-stagger
              data-day-panel={active ? "" : undefined}
              className={cn(
                "card p-4",
                active && view === "semana" && "ring-1 ring-[#f0b08a]/60",
                view === "mes" && !active && "hidden",
              )}
            >
              <button type="button" onClick={() => horizon.setDate(day)} className="flex w-full items-baseline justify-between gap-2 text-left">
                <h2 className="font-display text-xl font-bold capitalize">
                  {DOW_LONG[day.getDay()]} <span className="text-muted">{day.getDate()}</span>
                </h2>
                <span className="text-xs text-muted">{1 + classes.length + plan.work.length} bloques</span>
              </button>
              <ul className="mt-3 space-y-2">
                <li>
                  <button type="button" onClick={() => modals.openGym(toIso(day))} className="relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-lg border border-line bg-block-gym/45 py-2 pl-3.5 pr-2.5 text-left">
                    <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] tl-dot-gym" />
                    <span className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-wider text-rail-gym">Gimnasio</span><span className="block truncate text-sm font-semibold">{session.title}</span></span>
                    <span className="shrink-0 text-xs tabular-nums text-rail-gym">{session.time}</span>
                  </button>
                </li>
                {classes.map((block) => (
                  <li key={classKey(block)}>
                    <button type="button" onClick={() => modals.openClass(toIso(day), classKey(block))} className="relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-lg border border-line bg-block-class/45 py-2 pl-3.5 pr-2.5 text-left">
                      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] tl-dot-clase" />
                      <span className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-wider text-rail-class">Materia · {block.type}</span><span className="block break-words text-sm font-semibold">{block.name}</span></span>
                      <span className="shrink-0 text-xs tabular-nums text-rail-class">{block.start}–{block.end}</span>
                    </button>
                  </li>
                ))}
                {plan.work.map((block) => (
                  <li key={block.start}>
                    <button type="button" onClick={() => modals.openWork(toIso(day), block.start)} className="relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-lg border border-line bg-block-work/45 py-2 pl-3.5 pr-2.5 text-left">
                      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] tl-dot-trabajo" />
                      <span className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-wider text-rail-work">Trabajo</span><span className="block text-sm font-semibold">{formatDuration(block.end - block.start)}</span></span>
                      <span className="shrink-0 text-xs tabular-nums text-rail-work">{formatClock(block.start)}–{formatClock(block.end)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {classes.length === 0 ? <p className="mt-2 text-xs text-muted">Sin clases.</p> : null}
              <button
                type="button"
                onClick={() => modals.openGym(toIso(day))}
                className="mt-3 text-sm font-semibold text-[var(--color-mark)]"
              >
                Ver el entreno
              </button>
            </article>
          );
        })}
      </div>

      <details className="card mt-4">
        <summary className="flex min-h-12 cursor-pointer items-center px-4 text-sm font-semibold">Materias</summary>
        <div className="px-4 pb-4">
          <Legend />
        </div>
      </details>
    </div>
  );
}
