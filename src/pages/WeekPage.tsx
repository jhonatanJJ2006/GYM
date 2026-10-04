import { useState, type KeyboardEvent } from "react";
import { PageIntro } from "../components/Brand.tsx";
import { Legend } from "../components/Legend.tsx";
import { useModals } from "../components/Modals.tsx";
import { CLASSES, classKey, type Weekday } from "../data/courses.ts";
import { CompactRow } from "../components/system/CompactRow.tsx";
import { sessionFor, shoulderFocus } from "../data/sessions.ts";
import { ANCHOR_MON, DOW_LONG, addDays, toIso } from "../lib/dates.ts";
import { cn } from "../lib/utils.ts";

const DAY_LABEL = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function WeekPage() {
  const modals = useModals();
  const [week, setWeek] = useState(1);
  const [dayIndex, setDayIndex] = useState(0);
  const monday = addDays(ANCHOR_MON, (week - 1) * 7);
  const days = Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  const date = days[dayIndex] ?? monday;
  const dow = date.getDay();
  const session = sessionFor(date);
  const classes = dow === 0 || dow === 6 ? [] : CLASSES[dow as Weekday];

  return (
    <div>
      <PageIntro title="Semana tipo">
        La misma malla del 6 de octubre de 2026 al 2 de febrero de 2027. El jueves el gym es a las 19:15 porque a las
        18:00 es la tutoría virtual de Lógica Digital.
      </PageIntro>

      <div className="mt-5 grid grid-cols-4 gap-1 rounded-row border border-line bg-ink-2 p-1" role="group" aria-label="Semana del ciclo">
        {[1, 2, 3, 4].map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={week === value}
            onClick={() => setWeek(value)}
            className={cn(
              "min-h-12 rounded-row text-sm font-medium",
              week === value ? "bg-panel-2 text-cream ring-1 ring-cream" : "text-muted",
            )}
          >
            <span className="block text-[0.68rem] font-medium">Semana</span>
            <span className="font-display text-xl leading-none text-[var(--color-mark)]">{value}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold text-cream">
        Jueves de la semana {week}: hombro + {shoulderFocus(week)}.
      </p>

      <div
        className="mt-4 grid grid-cols-7 gap-1"
        role="tablist"
        aria-label="Día de la semana"
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
          const next =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? days.length - 1
                : event.key === "ArrowRight"
                  ? (dayIndex + 1) % days.length
                  : (dayIndex - 1 + days.length) % days.length;
          event.preventDefault();
          setDayIndex(next);
          event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
        }}
      >
        {days.map((item, index) => (
          <button
            key={toIso(item)}
            type="button"
            role="tab"
            id={`dia-semana-${index}`}
            aria-controls="panel-dia-semana"
            aria-selected={dayIndex === index}
            tabIndex={dayIndex === index ? 0 : -1}
            onClick={() => setDayIndex(index)}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center rounded-row",
              dayIndex === index ? "bg-cream text-ink" : "text-muted",
            )}
          >
            <span className="text-[0.62rem] font-semibold">{DAY_LABEL[index]}</span>
            <span className="font-display text-lg leading-none">{item.getDate()}</span>
          </button>
        ))}
      </div>

      <article data-rise id="panel-dia-semana" role="tabpanel" aria-labelledby={`dia-semana-${dayIndex}`} className="mt-4 rounded-row border border-line bg-panel p-4">
        <h2 className="font-display text-3xl capitalize tracking-tight text-[var(--color-mark)]">{DOW_LONG[dow]}</h2>
        <p className="mt-1 text-lg font-semibold text-cream">
          {session.title}
        </p>
        <p className="text-sm text-cream/75">{session.time}</p>
        {dow === 4 ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            No se entrena a las 18:00. Esa hora es la tutoría virtual de Lógica Digital.
          </p>
        ) : null}
        {classes.length === 0 ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Fin de semana: sin clases y sin trabajo. Solo abdomen por la mañana.
          </p>
        ) : (
          <ul className="mt-4 space-y-1">
            {classes.map((block) => (
              <li key={classKey(block)}>
                <CompactRow
                  title={block.name}
                  meta={`${block.start}–${block.end}`}
                  className="shadow-[inset_3px_0_0_var(--color-rail-class)]"
                  onClick={() => modals.openClass(toIso(date), classKey(block))}
                />
              </li>
            ))}
          </ul>
        )}
      </article>

      <details className="mt-4 rounded-row border border-line bg-panel">
        <summary className="flex min-h-12 cursor-pointer items-center px-4 text-sm font-semibold">Materias</summary>
        <div className="px-4 pb-4">
          <Legend />
        </div>
      </details>
    </div>
  );
}
