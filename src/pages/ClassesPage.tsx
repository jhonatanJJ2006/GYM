import { PageIntro } from "../components/Brand.tsx";
import { useModals } from "../components/Modals.tsx";
import { MonthPicker, PeriodBar, useHorizon } from "../components/PeriodBar.tsx";
import { CompactRow } from "../components/system/CompactRow.tsx";
import { classKey, classesFor, courseColor } from "../data/courses.ts";
import { HOLIDAYS } from "../data/holidays.ts";
import { DOW_LONG, TERM_END, TERM_START, WEEK_LETTERS, isInTerm, toIso } from "../lib/dates.ts";

export function ClassesPage() {
  const horizon = useHorizon(TERM_START);
  const { date, view, week } = horizon;
  const holidayDays = (view === "semana" ? week : [date]).filter((day) => HOLIDAYS[toIso(day)]);

  return (
    <div>
      <PageIntro title="Clases">
        Del lunes 5 de octubre de 2026 al 2 de febrero de 2027. Sábado y domingo no hay clases. Puedes ver un día, la semana
        o el mes, y saltar a cualquier fecha del rango.
      </PageIntro>

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

      {holidayDays.length ? (
        <p className="mt-3 rounded-row border border-line bg-panel px-3 py-3 text-sm leading-relaxed text-muted">
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

      <div data-day-panel className={view === "semana" ? "mt-4 grid gap-3 xl:grid-cols-7" : "mt-4"}>
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
    <section data-rise className="min-w-0 rounded-row border border-line bg-ink-2 p-3">
      <button type="button" onClick={() => modals.openDay(iso)} className="w-full text-left">
        <p className="text-[0.62rem] font-medium uppercase tracking-wide text-muted">{WEEK_LETTERS[(dow + 6) % 7]}</p>
        <h2 className="font-display text-base leading-tight tracking-tight text-[var(--color-mark)]">{title}</h2>
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
        <ul className="mt-3 space-y-1">
          {classes.map((block) => (
            <li key={classKey(block)}>
              <CompactRow
                title={block.name}
                meta={`${block.start}–${block.end}`}
                wrap
                accent={courseColor(block.name)}
                onClick={() => modals.openClass(iso, classKey(block))}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
