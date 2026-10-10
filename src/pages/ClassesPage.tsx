import { useStagger } from "../components/Motion.tsx";
import { PageIntro } from "../components/Brand.tsx";
import { useModals } from "../components/Modals.tsx";
import { MonthPicker, PeriodBar, useHorizon } from "../components/PeriodBar.tsx";
import { CLASSES, classKey, classesFor, courseColor, modeLabel, placeOf, type ClassBlock } from "../data/courses.ts";
import { addDays, isSameDay, mondayOnOrBefore } from "../lib/dates.ts";
import { isoWeek } from "../lib/progress.ts";
import { cn } from "../lib/utils.ts";
import { HOLIDAYS } from "../data/holidays.ts";
import { DOW_LONG, TERM_END, TERM_START, WEEK_LETTERS, isInTerm, toIso } from "../lib/dates.ts";

export function ClassesPage() {
  const horizon = useHorizon(TERM_START);
  const staggerRef = useStagger<HTMLDivElement>(`${horizon.view}-${toIso(horizon.date)}`);
  const { date, view, week } = horizon;
  const subjects = new Set(Object.values(CLASSES).flat().map((block) => block.name)).size;
  const strip = Array.from({ length: 6 }, (_, index) => addDays(mondayOnOrBefore(date), index));
  const holidayDays = (view === "semana" ? week : [date]).filter((day) => HOLIDAYS[toIso(day)]);

  return (
    <div>
      <PageIntro title="Clases">
        Del lunes 5 de octubre de 2026 al 2 de febrero de 2027. Sábado y domingo no hay clases. Puedes ver un día, la semana
        o el mes, y saltar a cualquier fecha del rango.
      </PageIntro>

      <div data-rise className="mb-1 flex flex-wrap gap-2">
        <span className="chip text-rail-class">{subjects} asignaturas</span>
        <span className="chip text-muted">Semana {isoWeek(date)}</span>
      </div>

      <PeriodBar
        label="clases"
        date={date}
        view={view}
        atStart={horizon.atStart}
        atEnd={horizon.atEnd}
        onDate={horizon.setDate}
        onView={horizon.setView}
        onStep={horizon.step}
      />

      {view === "dia" ? (
        <div data-rise className="mt-3 grid grid-cols-6 gap-1.5" role="group" aria-label="Días de la semana">
          {strip.map((day) => {
            const on = isSameDay(day, date);
            return (
              <button
                key={toIso(day)}
                type="button"
                aria-pressed={on}
                onClick={() => horizon.setDate(day)}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center rounded-xl border text-center transition-colors",
                  on ? "border-accent/50 bg-panel-2 text-accent" : "border-line bg-panel text-muted hover:text-cream",
                )}
              >
                <span className="text-[11px] font-semibold uppercase">{DOW_LONG[day.getDay()].slice(0, 3)}</span>
                <span className="font-display text-lg font-bold leading-none tabular-nums">{day.getDate()}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {holidayDays.length ? (
        <p className="card mt-3 px-3 py-3 text-sm leading-relaxed text-muted">
          Feriado en esta vista: {holidayDays.map((day) => HOLIDAYS[toIso(day)]).join(" · ")}.
        </p>
      ) : null}

      {view === "mes" ? (
        <MonthPicker
          date={date}
          onChoose={horizon.setDate}
          caption={(day) => {
            const count = classesFor(day).length;
            if (day.getDay() === 0 || day.getDay() === 6) return "Libre";
            if (!isInTerm(day)) return "—";
            return count ? `${count} clases` : "—";
          }}
        />
      ) : null}

      <div ref={staggerRef} data-day-panel className={view === "semana" ? "mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3" : "mt-4"}>
        {(view === "semana" ? week : [date]).map((day) => (
          <DayColumn key={toIso(day)} date={day} />
        ))}
      </div>
      <p className="sr-only">
        Periodo {TERM_START.toLocaleDateString("es")} a {TERM_END.toLocaleDateString("es")}.
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
    <section data-stagger className="min-w-0">
      <button type="button" onClick={() => modals.openDay(iso)} className="w-full text-left">
        <p className="text-[0.62rem] font-medium uppercase tracking-wide text-muted">{WEEK_LETTERS[(dow + 6) % 7]}</p>
        <h2 className="font-display text-xl font-bold leading-tight">{title}</h2>
      </button>
      {holiday ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {holiday}. Puede suspender la clase. Confirma con la universidad.
        </p>
      ) : null}
      {weekend ? <p className="mt-3 text-sm text-muted">Sin clases y sin trabajo.</p> : null}
      {!weekend && !isInTerm(date) ? (
        <p className="mt-3 text-sm text-muted">
          {date < TERM_START ? "Antes del 5 de octubre no hay clases." : "Después del 2 de febrero de 2027 no hay clases."}
        </p>
      ) : null}
      {classes.length ? (
        <ul className="mt-3 space-y-3">
          {classes.map((block) => (
            <li key={classKey(block)}>
              <ClassCard block={block} onOpen={() => modals.openClass(iso, classKey(block))} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function ClassCard({ block, onOpen }: { block: ClassBlock; onOpen: () => void }) {
  const color = courseColor(block.name);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative block w-full overflow-hidden rounded-xl border border-line bg-panel py-3.5 pl-5 pr-4 text-left transition-colors hover:bg-panel-2"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: color }} />
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0 break-words font-display text-base font-bold leading-snug text-cream">{block.name}</span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full border border-rail-class/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rail-class">{block.type}</span>
          <span className="rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold text-muted">{modeLabel(block)}</span>
        </span>
      </span>
      <span className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted">
        <span><span className="block text-[10px] uppercase tracking-wider">Hora</span><span className="tabular-nums text-cream">{block.start} – {block.end}</span></span>
        <span><span className="block text-[10px] uppercase tracking-wider">NRC</span><span className="tabular-nums text-cream">{block.nrc || "Sin NRC"}</span></span>
        <span className="col-span-2"><span className="block text-[10px] uppercase tracking-wider">Lugar</span><span className="text-cream/90">{placeOf(block)}</span></span>
        {block.professor ? <span className="col-span-2"><span className="block text-[10px] uppercase tracking-wider">Docente</span><span className="text-cream/90">{block.professor}</span></span> : null}
      </span>
    </button>
  );
}
