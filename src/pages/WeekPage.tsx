import { useState } from "react";
import { Legend } from "../components/Legend.tsx";
import { CLASSES, courseColor, modeLabel, placeOf, type Weekday } from "../data/courses.ts";
import { sessionColor, sessionFor, shoulderFocus } from "../data/sessions.ts";
import { ANCHOR_MON, DOW_LONG, WEEK_LETTERS, addDays, toIso } from "../lib/dates.ts";
import { cn } from "../lib/utils.ts";

const DAY_LABEL = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function WeekPage() {
  const [week, setWeek] = useState(1);
  const [dayIndex, setDayIndex] = useState(0);
  const monday = addDays(ANCHOR_MON, (week - 1) * 7);
  const days = Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  const date = days[dayIndex] ?? monday;
  const dow = date.getDay();
  const session = sessionFor(date);
  const classes = dow === 0 || dow === 6 ? [] : CLASSES[dow as Weekday];
  const color = sessionColor(session);

  return (
    <div>
      <p className="font-display text-sm tracking-wide text-muted">Hierro</p>
      <h1 className="font-display text-[2.6rem] leading-none tracking-tight">Semana tipo</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        La misma malla del 6 de octubre de 2026 al 2 de febrero de 2027. El jueves el gym es a las 19:15 porque a las
        18:00 es la tutoría virtual de Lógica Digital.
      </p>

      <div className="mt-5 grid grid-cols-4 gap-1 rounded-[1.4rem] bg-ink-2 p-1" role="group" aria-label="Semana del ciclo">
        {[1, 2, 3, 4].map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={week === value}
            onClick={() => setWeek(value)}
            className={cn(
              "min-h-14 rounded-[1.1rem] text-sm font-semibold",
              week === value ? "bg-accent text-ink" : "text-cream",
            )}
          >
            <span className="block text-[0.62rem] uppercase tracking-wide">Semana</span>
            <span className="font-display text-xl leading-none">{value}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold" style={{ color }}>
        Jueves de la semana {week}: hombro + {shoulderFocus(week)}.
      </p>

      <div className="mt-4 grid grid-cols-7 gap-1" role="tablist" aria-label="Día de la semana">
        {days.map((item, index) => (
          <button
            key={toIso(item)}
            type="button"
            role="tab"
            aria-selected={dayIndex === index}
            onClick={() => setDayIndex(index)}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center rounded-2xl",
              dayIndex === index ? "bg-cream text-ink" : "bg-panel text-cream",
            )}
          >
            <span className="text-[0.62rem] font-semibold">{DAY_LABEL[index]}</span>
            <span className="font-display text-lg leading-none">{item.getDate()}</span>
          </button>
        ))}
      </div>

      <article className="mt-4 rounded-[1.6rem] bg-panel p-4" style={{ boxShadow: `inset 4px 0 0 ${color}` }}>
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted">{WEEK_LETTERS[dayIndex]}</p>
        <h2 className="font-display text-3xl capitalize tracking-tight">{DOW_LONG[dow]}</h2>
        <p className="mt-1 text-lg font-semibold" style={{ color }}>
          {session.title}
        </p>
        <p className="text-sm text-cream/75">{session.time}</p>
        {dow === 4 ? (
          <p className="mt-3 text-sm leading-relaxed text-warn">
            No se entrena a las 18:00. Esa hora es la tutoría virtual de Lógica Digital.
          </p>
        ) : null}
        {classes.length === 0 ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Fin de semana: sin clases y sin trabajo. Solo abdomen por la mañana.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {classes.map((block) => (
              <li key={`${block.start}-${block.name}-${block.type}`} className="grid grid-cols-[4.6rem_1fr] gap-3">
                <p className="pt-0.5 text-sm font-semibold tabular-nums" style={{ color: courseColor(block.name) }}>
                  {block.start}
                  <span className="mt-0.5 block text-xs font-medium text-muted">{block.end}</span>
                </p>
                <div className="min-w-0 border-l border-white/10 pl-3">
                  <p className="font-semibold leading-snug">{block.name}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {modeLabel(block) === "Sin salón"
                      ? `${block.type} · ${placeOf(block)}`
                      : `${modeLabel(block)} · ${block.type} · ${placeOf(block)}`}
                    {block.nrc ? ` · NRC ${block.nrc}` : ""}
                  </p>
                  {block.professor ? <p className="text-sm text-muted">{block.professor}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>

      <details className="mt-4 rounded-2xl bg-panel">
        <summary className="flex min-h-12 cursor-pointer items-center px-4 text-sm font-semibold">Colores de las materias</summary>
        <div className="px-4 pb-4">
          <Legend />
        </div>
      </details>
    </div>
  );
}
