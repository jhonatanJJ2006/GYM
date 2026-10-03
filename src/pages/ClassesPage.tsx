import { useState } from "react";
import { useModals } from "../components/Modals.tsx";
import { Button } from "../components/ui/button.tsx";
import { classKey, classesFor, courseColor, modeLabel, placeOf } from "../data/courses.ts";
import { HOLIDAYS } from "../data/holidays.ts";
import {
  DOW_LONG,
  TERM_END,
  TERM_START,
  WEEK_LETTERS,
  formatWeekSpan,
  isInTerm,
  isSameDay,
  termWeeks,
  toIso,
} from "../lib/dates.ts";
export function ClassesPage() {
  const weeks = termWeeks();
  const [index, setIndex] = useState(() => {
    const today = new Date();
    const target = isInTerm(today) ? today : TERM_START;
    const found = weeks.findIndex((week) => week.some((day) => isSameDay(day, target)));
    return found < 0 ? 0 : found;
  });
  const week = weeks[index] ?? weeks[0];
  const inside = week.filter((date) => isInTerm(date) || date.getDay() === 0 || date.getDay() === 6);
  const holidayDays = week.filter((date) => HOLIDAYS[toIso(date)]);

  return (
    <div>
      <p className="font-display text-sm tracking-wide text-muted">Hierro</p>
      <h1 className="font-display text-[2.6rem] leading-none tracking-tight">Clases</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        Semana a semana, del 6 de octubre de 2026 al 2 de febrero de 2027. Sábado y domingo no hay clases. Si un día ya
        está marcado como feriado, la clase puede suspenderse y sigue etiquetada.
      </p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-2xl"
          aria-label="Semana anterior"
          disabled={index === 0}
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
        >
          ‹
        </Button>
        <div className="text-center">
          <p className="font-display text-2xl leading-none">{formatWeekSpan(week)}</p>
          <p className="mt-1 text-xs text-muted">
            Semana {index + 1} de {weeks.length}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="rounded-2xl"
          aria-label="Semana siguiente"
          disabled={index >= weeks.length - 1}
          onClick={() => setIndex((value) => Math.min(weeks.length - 1, value + 1))}
        >
          ›
        </Button>
      </div>

      {holidayDays.length ? (
        <p className="mt-3 rounded-2xl bg-warn/10 px-3 py-3 text-sm leading-relaxed text-warn">
          Esta semana tiene feriado: {holidayDays.map((date) => HOLIDAYS[toIso(date)]).join(" · ")}.
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 xl:grid-cols-7">
        {week.map((date) => (
          <DayColumn key={toIso(date)} date={date} />
        ))}
      </div>
      <p className="sr-only">
        Periodo {TERM_START.toLocaleDateString("es")} a {TERM_END.toLocaleDateString("es")}. Días con clase en la semana:{" "}
        {inside.length}.
      </p>
    </div>
  );
}

function DayColumn({ date }: { date: Date }) {
  const modals = useModals();
  const iso = toIso(date);
  const dow = date.getDay();
  const weekend = dow === 0 || dow === 6;
  const holiday = HOLIDAYS[iso] ?? null;
  const classes = classesFor(date);
  const title = `${DOW_LONG[dow].replace(/^./, (letter) => letter.toUpperCase())} ${date.getDate()}`;

  return (
    <section className="min-w-0 rounded-[1.4rem] bg-ink-2 p-3 ring-1 ring-white/8">
      <button type="button" onClick={() => modals.openDay(iso)} className="w-full text-left">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">{WEEK_LETTERS[(dow + 6) % 7]}</p>
        <h2 className="font-display text-2xl leading-none">{title}</h2>
      </button>
      {holiday ? (
        <p className="mt-2 text-sm leading-relaxed text-warn">
          {holiday}. Puede suspender la clase. Confirma con la universidad.
        </p>
      ) : null}
      {weekend ? <p className="mt-3 text-sm text-muted">Sin clases.</p> : null}
      {!weekend && !isInTerm(date) ? (
        <p className="mt-3 text-sm text-muted">
          {date < TERM_START ? "Antes del 6 de octubre no hay clases." : "Después del 2 de febrero de 2027 no hay clases."}
        </p>
      ) : null}
      {classes.length ? (
        <ul className="mt-3 space-y-2">
          {classes.map((block) => {
            const mode = modeLabel(block);
            const where = mode === "Sin salón" ? placeOf(block) : `${mode} · ${placeOf(block)}`;
            return (
              <li key={classKey(block)}>
                <button
                  type="button"
                  onClick={() => modals.openClass(iso, classKey(block))}
                  className="w-full rounded-2xl bg-panel px-3 py-3 text-left"
                  style={{ boxShadow: `inset 4px 0 0 ${courseColor(block.name)}` }}
                >
                  <span className="font-display text-xl tabular-nums leading-none" style={{ color: courseColor(block.name) }}>
                    {block.start}
                    <span className="ml-2 text-sm text-muted">{block.end}</span>
                  </span>
                  <span className="mt-1 block font-semibold leading-snug">{block.name}</span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {block.type} · {where}
                  </span>
                  {holiday ? <span className="mt-1 block text-sm font-semibold text-warn">Puede suspenderse</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
