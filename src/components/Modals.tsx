import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { classKey, modeLabel, placeOf } from "../data/courses.ts";
import { HOLIDAYS } from "../data/holidays.ts";
import { MEALS, mealWhen } from "../data/meals.ts";
import { PROFILE } from "../data/nutrition.ts";
import { SESSIONS, sessionFor, type Session, type SessionId } from "../data/sessions.ts";
import { formatLong, parseIso } from "../lib/dates.ts";
import { buildDay } from "../lib/schedule.ts";
import { formatDuration, formatSpan } from "../lib/time.ts";
import { ExerciseFigure } from "./ExerciseFigure.tsx";
import { MealArt } from "./MealArt.tsx";
import { ExerciseList, MealDetail } from "./Recipe.tsx";
import { CompactRow } from "./system/CompactRow.tsx";
import { ExerciseThumb, MealThumb } from "./system/Thumbnail.tsx";

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

type StackItem = { id: number; entry: Entry; trigger: HTMLElement | null };

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableItems(node: HTMLElement): HTMLElement[] {
  return [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => element.tabIndex >= 0);
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<StackItem[]>([]);
  const nextId = useRef(1);
  const push = useCallback((entry: Entry) => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setStack((current) => [...current, { id: nextId.current++, entry, trigger }]);
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

  useEffect(() => {
    if (stack.length === 0) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [stack.length]);

  return (
    <ModalContext.Provider value={api}>
      <div inert={stack.length > 0 ? true : undefined}>{children}</div>
      {stack.map((item, index) => (
        <ModalShell key={item.id} entry={item.entry} trigger={item.trigger} active={index === stack.length - 1} onClose={pop} />
      ))}
    </ModalContext.Provider>
  );
}

function ModalShell({ entry, trigger, onClose, active }: { entry: Entry; trigger: HTMLElement | null; onClose: () => void; active: boolean }) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const title = titleFor(entry);
  useLayoutEffect(() => {
    ref.current?.querySelector<HTMLElement>("[data-close]")?.focus();
    return () => {
      if (trigger?.isConnected) trigger.focus();
    };
  }, [trigger]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      const node = ref.current;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const items = focusableItems(node);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (!(current instanceof Node) || !node.contains(current)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
        return;
      }
      if (event.shiftKey && current === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      hidden={!active}
      inert={active ? undefined : true}
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal-sheet relative flex max-h-[min(92dvh,880px)] w-full max-w-lg flex-col overflow-hidden rounded-t-modal border border-line bg-ink sm:rounded-modal"
      >
        <button
          type="button"
          data-close
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-row border border-line bg-panel text-lg text-cream"
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
  return (
    <div className="space-y-3 px-5 pb-8 pt-14">
      <h2 id={titleId} className="font-display text-[1.8rem] leading-tight tracking-tight">
        {title}
      </h2>
      <p className="text-sm text-muted">
        Semana {plan.cycleWeek} de 4 · {plan.session.title} · {plan.session.time}
      </p>
      {note ? <p className="rounded-lg bg-panel px-3 py-3 text-sm leading-relaxed text-cream">{note}</p> : null}
      {plan.banners.map((banner) => (
        <p key={banner} className="rounded-lg bg-panel px-3 py-3 text-sm leading-relaxed text-cream/80">
          {banner}
        </p>
      ))}
      <CompactRow
        title={plan.session.title}
        meta={plan.session.time}
        thumb={<ExerciseThumb pose={plan.session.exercises[0].pose} />}
        onClick={() => modals.openGym(iso)}
      />
      <ul className="space-y-1">
        {plan.classes.map((block) => (
          <li key={classKey(block)}>
            <CompactRow title={block.name} meta={block.start} onClick={() => modals.openClass(iso, classKey(block))} />
          </li>
        ))}
        {works.map((item, index) =>
          item.kind === "trabajo" ? (
            <li key={item.start}>
              <CompactRow
                title={`Trabajo ${index + 1} de ${works.length}`}
                meta={formatSpan({ start: item.start, end: item.end })}
                onClick={() => modals.openWork(iso, item.start)}
              />
            </li>
          ) : null,
        )}
        {plan.meals.items.map((meal, index) => (
          <li key={`${meal.time}-${meal.role}`}>
            <CompactRow
              title={meal.role}
              meta={mealWhen(meal)}
              thumb={<MealThumb ingredients={meal.ingredients} />}
              onClick={() => modals.openMeal(plan.date.getDay(), index)}
            />
          </li>
        ))}
      </ul>
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
  const description = mode === "Sin salón" ? block.type : `${mode} · ${block.type}`;
  return (
    <div className="space-y-4 px-5 pb-8 pt-14">
      <h2 id={titleId} className="font-display text-3xl leading-tight tracking-tight">
        {title}
      </h2>
      <dl className="space-y-3 text-sm">
        <div className="border-t border-line pt-3">
          <dt className="text-xs text-muted">Horario</dt>
          <dd className="mt-0.5 tabular-nums">{block.start}–{block.end}</dd>
        </div>
        <div className="border-t border-line pt-3">
          <dt className="text-xs text-muted">Descripción</dt>
          <dd className="mt-0.5">{description}</dd>
        </div>
        <div className="border-t border-line pt-3">
          <dt className="text-xs text-muted">Aula</dt>
          <dd className="mt-0.5">{placeOf(block)}</dd>
        </div>
        <div className="border-t border-line pt-3">
          <dt className="text-xs text-muted">Profesor</dt>
          <dd className="mt-0.5">{block.professor || "Sin profesor en la malla"}</dd>
        </div>
        {block.nrc ? (
          <div className="border-t border-line pt-3">
            <dt className="text-xs text-muted">NRC</dt>
            <dd className="mt-0.5 tabular-nums">{block.nrc}</dd>
          </div>
        ) : null}
      </dl>
      {note ? <p className="rounded-row border border-line bg-panel px-3 py-3 text-sm leading-relaxed">{note}</p> : null}
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
    <div className="space-y-3 px-5 pb-8 pt-14">
      <h2 id={titleId} className="font-display text-3xl leading-tight tracking-tight">
        {title}
      </h2>
      <p className="text-sm tabular-nums text-muted">{formatSpan(block)}</p>
      <p className="text-sm">
        Bloque {index + 1} de {works.length} · {formatDuration(block.end - block.start)}.
      </p>
      <p className="rounded-row border border-line bg-panel px-3 py-3 text-sm leading-relaxed text-cream/80">
        Hueco libre entre semana: no coincide con una clase ni con el gym. El día suma {formatDuration(plan.workMinutes)}{" "}
        de trabajo, dentro de las 5 a 6 horas.
      </p>
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
      <p className="text-sm text-muted">
        {session.time} · {session.minutesLabel}
      </p>
      <p className="text-sm leading-relaxed text-cream/85">{session.note}</p>
      {note ? <p className="rounded-row bg-panel px-3 py-3 text-sm leading-relaxed text-cream">{note}</p> : null}
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
      <p className="font-display text-3xl tabular-nums text-cream">{mealWhen(meal)}</p>
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
        <div className="rounded-row bg-panel px-3 py-3">
          <dt className="text-sm text-muted">Repeticiones</dt>
          <dd className="mt-1 font-semibold leading-snug">{exercise.reps}</dd>
        </div>
        <div className="rounded-row border border-line bg-panel-2 px-3 py-3">
          <dt className="text-sm text-muted">
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
