import { PageIntro } from "../components/Brand.tsx";
import { Legend } from "../components/Legend.tsx";
import { useModals } from "../components/Modals.tsx";
import { MonthPicker, PeriodBar, useHorizon } from "../components/PeriodBar.tsx";
import { CompactRow } from "../components/system/CompactRow.tsx";
import { classKey, classesFor } from "../data/courses.ts";
import { sessionFor, shoulderFocus } from "../data/sessions.ts";
import { ANCHOR_MON, DOW_LONG, cycleWeek, isSameDay, toIso } from "../lib/dates.ts";
import { useStagger } from "../components/Motion.tsx";
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

      {view === "mes" ? (
        <MonthPicker
          date={date}
          onChoose={horizon.setDate}
          caption={(day) => sessionFor(day).short}
        />
      ) : null}

      <div ref={staggerRef} className={view === "semana" ? "mt-4 grid gap-3 xl:grid-cols-7" : "mt-4"}>
        {days.map((day) => {
          const session = sessionFor(day);
          const classes = classesFor(day);
          const active = isSameDay(day, date);
          return (
            <article
              key={toIso(day)}
              data-stagger
              data-day-panel={active ? "" : undefined}
              className={cn(
                "card p-4",
                active && view === "semana" && "ring-1 ring-[#c6ff3d]/60",
                view === "mes" && !active && "hidden",
              )}
            >
              <button type="button" onClick={() => horizon.setDate(day)} className="w-full text-left">
                <h2 className="display-title text-2xl capitalize">
                  {DOW_LONG[day.getDay()]} {day.getDate()}
                </h2>
              </button>
              <p className="mt-1 text-lg font-semibold text-cream">{session.title}</p>
              <p className="text-sm text-cream/75">
                Gym {session.time}
                {day.getDay() === 0 || day.getDay() === 6 ? " · sin trabajo" : ""}
              </p>
              {classes.length === 0 ? (
                <p className="mt-3 text-sm leading-relaxed text-muted">Sin clases.</p>
              ) : (
                <ul className="mt-3 space-y-1">
                  {classes.map((block) => (
                    <li key={classKey(block)}>
                      <CompactRow
                        title={block.name}
                        meta={`${block.start}–${block.end} · ${block.type}`}
                        className="shadow-[inset_3px_0_0_var(--color-rail-class)]"
                        onClick={() => modals.openClass(toIso(day), classKey(block))}
                      />
                    </li>
                  ))}
                </ul>
              )}
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
