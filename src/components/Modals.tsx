import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { classKey, courseColor, modeLabel, placeOf } from "../data/courses.ts";
import { HOLIDAYS } from "../data/holidays.ts";
import { MEALS, mealWhen } from "../data/meals.ts";
import { PROFILE } from "../data/nutrition.ts";
import { SESSIONS, sessionColor, sessionFor, type Session, type SessionId } from "../data/sessions.ts";
import { formatLong, parseIso } from "../lib/dates.ts";
import { buildDay } from "../lib/schedule.ts";
import { formatDuration, formatSpan } from "../lib/time.ts";
import { ExerciseFigure } from "./ExerciseFigure.tsx";
import { MealArt } from "./MealArt.tsx";
import { ExerciseList, MealDetail } from "./Recipe.tsx";

type Entry =
  | { type: "day"; iso: string }
  | { type: "class"; iso: string; key: string }
  | { type: "work"; iso: string; start: number }
  | { type: "gym"; iso: string }
  | { type: "session"; sessionId: SessionId }
  | { type: "meal"; dow: number; index: number }
  | { type: "exercise"; sessionId: SessionId; index: number };

type ModalsApi = {
  openDay: (iso: string) => void;
  openClass: (iso: string, key: string) => void;
  openWork: (iso: string, start: number) => void;
  openGym: (iso: string) => void;
  openSession: (sessionId: SessionId) => void;
  openMeal: (dow: number, index: number) => void;
  openExercise: (sessionId: SessionId, index: number) => void;
};

const ModalContext = createContext<ModalsApi | null>(null);

export function useModals(): ModalsApi {
  const value = useContext(ModalContext);
  if (!value) throw new Error("Falta el proveedor de modales");
  return value;
}

function holidayNote(iso: string): string | null {
  const name = HOLIDAYS[iso];
  if (!name) return null;
  return `${name}. La malla semanal igual aparece; confirma con la universidad si ese feriado suspende la clase.`;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Entry[]>([]);
  const push = useCallback((entry: Entry) => {
    setStack((current) => [...current, entry]);
  }, []);
  const pop = useCallback(() => {
    setStack((current) => current.slice(0, -1));
  }, []);

  const api: ModalsApi = {
    openDay: (iso) => push({ type: "day", iso }),
    openClass: (iso, key) => push({ type: "class", iso, key }),
    openWork: (iso, start) => push({ type: "work", iso, start }),
    openGym: (iso) => push({ type: "gym", iso }),
    openSession: (sessionId) => push({ type: "session", sessionId }),
    openMeal: (dow, index) => push({ type: "meal", dow, index }),
    openExercise: (sessionId, index) => push({ type: "exercise", sessionId, index }),
  };

  const top = stack[stack.length - 1];

  return (
    <ModalContext.Provider value={api}>
      {children}
      {top ? <ModalShell entry={top} onClose={pop} /> : null}
    </ModalContext.Provider>
  );
}

function ModalShell({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const title = titleFor(entry);

  useEffect(() => {
    const node = ref.current;
    const previously = document.activeElement as HTMLElement | null;
    node?.querySelector<HTMLElement>("[data-close]")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>("button, a, input, textarea, select")].filter(
        (element) => !element.hasAttribute("disabled"),
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previously?.focus();
    };
  }, [onClose, entry]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Cerrar detalle" className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal-sheet relative flex max-h-[min(92dvh,880px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.8rem] bg-ink shadow-[0_24px_80px_rgb(0_0_0/0.55)] ring-1 ring-white/10 sm:rounded-[1.8rem]"
      >
        <button
          type="button"
          data-close
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-ink/80 text-xl text-cream ring-1 ring-white/15 backdrop-blur"
          onClick={onClose}
        >
          ×
        </button>
        <div className="overflow-y-auto">{bodyFor(entry, titleId, title)}</div>
      </div>
    </div>
  );
}

function titleFor(entry: Entry): string {
  if (entry.type === "day") return formatLong(parseIso(entry.iso)).replace(/^./, (letter) => letter.toUpperCase());
  if (entry.type === "class") {
    const block = buildDay(parseIso(entry.iso)).classes.find((item) => classKey(item) === entry.key);
    return block?.name ?? "Clase";
  }
  if (entry.type === "work") return "Bloque de trabajo";
  if (entry.type === "gym") return sessionFor(parseIso(entry.iso)).title;
  if (entry.type === "session") return SESSIONS[entry.sessionId].title;
  if (entry.type === "meal") return MEALS[entry.dow]?.items[entry.index]?.role ?? "Comida";
  return SESSIONS[entry.sessionId].exercises[entry.index]?.name ?? "Ejercicio";
}

function bodyFor(entry: Entry, titleId: string, title: string) {
  if (entry.type === "day") return <DayBody iso={entry.iso} titleId={titleId} title={title} />;
  if (entry.type === "class") return <ClassBody iso={entry.iso} classKeyValue={entry.key} titleId={titleId} title={title} />;
  if (entry.type === "work") return <WorkBody iso={entry.iso} start={entry.start} titleId={titleId} title={title} />;
  if (entry.type === "gym") return <SessionBody session={sessionFor(parseIso(entry.iso))} iso={entry.iso} titleId={titleId} title={title} />;
  if (entry.type === "session") return <SessionBody session={SESSIONS[entry.sessionId]} titleId={titleId} title={title} />;
  if (entry.type === "meal") return <MealBody dow={entry.dow} index={entry.index} titleId={titleId} title={title} />;
  return <ExerciseBody sessionId={entry.sessionId} index={entry.index} titleId={titleId} title={title} />;
}

function DayBody({ iso, titleId, title }: { iso: string; titleId: string; title: string }) {
  const modals = useModals();
  const plan = buildDay(parseIso(iso));
  const note = holidayNote(iso);
  const works = plan.items.filter((item) => item.kind === "trabajo");
  const hero = heroPose(plan.session);
  return (
    <div>
      <ExerciseFigure pose={hero} label={plan.session.title} />
      <div className="space-y-3 px-5 pb-8 pt-4">
      <h2 id={titleId} className="font-display text-[1.8rem] leading-tight tracking-tight">
        {title}
      </h2>
      <p className="text-sm" style={{ color: sessionColor(plan.session) }}>
        Semana {plan.cycleWeek} de 4 · {plan.session.title} · {plan.session.time}
      </p>
      {note ? <p className="rounded-2xl bg-warn/10 px-3 py-3 text-sm leading-relaxed text-warn">{note}</p> : null}
      {plan.banners.map((banner) => (
        <p key={banner} className="rounded-2xl bg-panel px-3 py-3 text-sm leading-relaxed text-cream/80">
          {banner}
        </p>
      ))}
      <button
        type="button"
        onClick={() => modals.openGym(iso)}
        className="w-full rounded-[1.4rem] bg-panel px-4 py-3 text-left"
      >
        <span className="text-sm" style={{ color: sessionColor(plan.session) }}>
          Gym · {plan.session.time}
        </span>
        <span className="mt-1 block font-semibold">{plan.session.title}</span>
        <span className="mt-2 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-ink">Ver la sesión</span>
      </button>
      <ul className="space-y-2">
        {plan.classes.map((block) => (
          <li key={classKey(block)}>
            <button
              type="button"
              onClick={() => modals.openClass(iso, classKey(block))}
              className="w-full rounded-2xl bg-panel px-3 py-3 text-left"
              style={{ boxShadow: `inset 4px 0 0 ${courseColor(block.name)}` }}
            >
              <span className="text-sm font-semibold tabular-nums" style={{ color: courseColor(block.name) }}>
                {block.start}–{block.end}
              </span>
              <span className="mt-1 block font-semibold">{block.name}</span>
              <span className="block text-sm text-muted">
                {block.type} · {placeOf(block)}
              </span>
            </button>
          </li>
        ))}
        {works.map((item, index) =>
          item.kind === "trabajo" ? (
            <li key={item.start}>
              <button
                type="button"
                onClick={() => modals.openWork(iso, item.start)}
                className="w-full rounded-2xl bg-work/10 px-3 py-3 text-left ring-1 ring-work/20"
              >
                <span className="text-sm font-semibold text-work">
                  Trabajo · {formatSpan({ start: item.start, end: item.end })}
                </span>
                <span className="mt-1 block font-semibold">
                  Bloque {index + 1} de {works.length}
                </span>
              </button>
            </li>
          ) : null,
        )}
        {plan.meals.items.map((meal, index) => (
          <li key={`${meal.time}-${meal.role}`}>
            <button
              type="button"
              onClick={() => modals.openMeal(plan.date.getDay(), index)}
              className="w-full overflow-hidden rounded-[1.4rem] bg-panel text-left ring-1 ring-white/10"
            >
              <MealArt ingredients={meal.ingredients} label={meal.role} />
              <span className="block px-3 py-3">
                <span className="block text-sm text-meal">{mealWhen(meal)}</span>
                <span className="mt-1 block font-display text-xl leading-tight">{meal.role}</span>
                <span className="block text-sm text-muted">
                  ~{meal.kcal} kcal · ~{meal.protein} g
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}

function ClassBody({
  iso,
  classKeyValue,
  titleId,
  title,
}: {
  iso: string;
  classKeyValue: string;
  titleId: string;
  title: string;
}) {
  const block = buildDay(parseIso(iso)).classes.find((item) => classKey(item) === classKeyValue);
  const note = holidayNote(iso);
  if (!block) {
    return (
      <h2 id={titleId} className="px-5 pb-8 pt-16 text-sm text-muted">
        {title}. Esa clase no está en el día.
      </h2>
    );
  }
  const mode = modeLabel(block);
  return (
    <div>
      <div className="bg-panel px-5 pb-8 pt-16" style={{ boxShadow: `inset 0 -6px 0 ${courseColor(block.name)}` }}>
        <p className="font-display text-5xl tabular-nums leading-none" style={{ color: courseColor(block.name) }}>
          {block.start}
        </p>
        <p className="mt-2 text-sm text-muted">hasta {block.end}</p>
      </div>
      <div className="space-y-3 px-5 pb-8 pt-4">
      <h2 id={titleId} className="font-display text-[1.8rem] leading-tight tracking-tight">
        {title}
      </h2>
      <p className="text-sm text-cream/85">
        {mode === "Sin salón" ? `${block.type} · ${placeOf(block)}` : `${mode} · ${block.type} · ${placeOf(block)}`}
      </p>
      {block.professor ? <p className="text-sm text-cream/85">{block.professor}</p> : null}
      {block.nrc ? <p className="text-sm text-muted">NRC {block.nrc}</p> : null}
      {note ? <p className="rounded-2xl bg-warn/10 px-3 py-3 text-sm leading-relaxed text-warn">{note}</p> : null}
      </div>
    </div>
  );
}

function WorkBody({ iso, start, titleId, title }: { iso: string; start: number; titleId: string; title: string }) {
  const plan = buildDay(parseIso(iso));
  const works = plan.work;
  const index = works.findIndex((block) => block.start === start);
  const block = works[index];
  if (!block) {
    return (
      <h2 id={titleId} className="px-5 pb-8 pt-16 text-sm text-muted">
        {title}. Ese bloque no está en el día.
      </h2>
    );
  }
  return (
    <div>
      <div className="bg-panel px-5 pb-8 pt-16">
        <p className="font-display text-5xl tabular-nums leading-none text-work">{formatSpan(block)}</p>
      </div>
      <div className="space-y-3 px-5 pb-8 pt-4">
      <h2 id={titleId} className="font-display text-[1.8rem] leading-tight tracking-tight">
        {title}
      </h2>
      <p className="text-sm text-cream/85">
        Bloque {index + 1} de {works.length} · {formatDuration(block.end - block.start)}.
      </p>
      <p className="rounded-2xl bg-panel px-3 py-3 text-sm leading-relaxed text-cream/80">
        Hueco libre entre semana: no coincide con una clase ni con el gym. El día suma {formatDuration(plan.workMinutes)}{" "}
        de trabajo, dentro de las 5 a 6 horas.
      </p>
      </div>
    </div>
  );
}

function heroPose(session: Session) {
  return (session.exercises.find((exercise) => exercise.name !== "Calentamiento") ?? session.exercises[0]).pose;
}

function SessionBody({
  session,
  iso,
  titleId,
  title,
}: {
  session: Session;
  iso?: string;
  titleId: string;
  title: string;
}) {
  const modals = useModals();
  const note = iso ? holidayNote(iso) : null;
  return (
    <div>
      <ExerciseFigure pose={heroPose(session)} label={session.title} />
      <div className="space-y-3 px-5 pb-8 pt-4">
      <h2 id={titleId} className="font-display text-[1.8rem] leading-tight tracking-tight">
        {title}
      </h2>
      <p className="text-sm" style={{ color: sessionColor(session) }}>
        {session.time} · {session.minutesLabel}
      </p>
      <p className="text-sm leading-relaxed text-cream/85">{session.note}</p>
      {note ? <p className="rounded-2xl bg-warn/10 px-3 py-3 text-sm leading-relaxed text-warn">{note}</p> : null}
      <ExerciseList exercises={session.exercises} onOpen={(index) => modals.openExercise(session.id, index)} />
      </div>
    </div>
  );
}

function MealBody({ dow, index, titleId, title }: { dow: number; index: number; titleId: string; title: string }) {
  const meal = MEALS[dow]?.items[index];
  if (!meal) {
    return (
      <h2 id={titleId} className="px-5 pb-8 pt-16 text-sm text-muted">
        {title}. Esa comida no está en el día.
      </h2>
    );
  }
  return (
    <div>
      <MealArt ingredients={meal.ingredients} label={meal.role} />
      <div className="space-y-4 px-5 pb-8 pt-4">
      <h2 id={titleId} className="font-display text-[1.8rem] leading-tight tracking-tight">
        {title}
      </h2>
      <p className="font-display text-3xl tabular-nums text-meal">{mealWhen(meal)}</p>
      <p className="text-sm text-cream/85">
        ~{meal.kcal} kcal · ~{meal.protein} g de proteína
      </p>
      <MealDetail meal={meal} />
      </div>
    </div>
  );
}

function ExerciseBody({
  sessionId,
  index,
  titleId,
  title,
}: {
  sessionId: SessionId;
  index: number;
  titleId: string;
  title: string;
}) {
  const exercise = SESSIONS[sessionId].exercises[index];
  if (!exercise) {
    return (
      <h2 id={titleId} className="px-5 pb-8 pt-16 text-sm text-muted">
        {title}. Ese ejercicio no está en la rutina.
      </h2>
    );
  }
  return (
    <div>
      <ExerciseFigure pose={exercise.pose} label={exercise.name} />
      <div className="space-y-4 px-5 pb-8 pt-4">
      <h2 id={titleId} className="font-display text-[1.8rem] leading-tight tracking-tight">
        {title}
      </h2>
      <p className="text-sm leading-relaxed text-cream/90">{exercise.how}</p>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl bg-panel px-3 py-3">
          <dt className="text-sm text-muted">Repeticiones</dt>
          <dd className="mt-1 font-semibold leading-snug">{exercise.reps}</dd>
        </div>
        <div className="rounded-2xl bg-accent px-3 py-3 text-ink">
          <dt className="text-sm font-semibold">
            {exercise.weightSuggested ? "Peso sugerido" : "Peso"}
          </dt>
          <dd className="mt-1 font-semibold leading-snug">{exercise.weight}</dd>
          <dd className="mt-2 text-xs leading-relaxed">
            {exercise.weightSuggested
              ? `Sugerido para arrancar con ${PROFILE.weightKg} kg. No es un peso medido.`
              : "Sin número inventado: este movimiento va con el peso del cuerpo."}
          </dd>
        </div>
      </dl>
      </div>
    </div>
  );
}
