import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { CoachView } from "./CoachView.tsx";
import { buildDay } from "../lib/schedule.ts";
import { formatClock, parseClock } from "../lib/time.ts";
import { dateOnly, formatLong, isInRange, toIso } from "../lib/dates.ts";
import { isoWeek, parseRest, parseSets, weekStats } from "../lib/progress.ts";
import {
  DEFAULT_PROFILE,
  EMPTY_EVENTS,
  EMPTY_MEALS,
  EMPTY_TRAINING,
  KEYS,
  useStored,
  type CustomEvent,
  type EventKind,
  type Profile,
} from "../lib/store.ts";
import type { Session } from "../data/sessions.ts";
import { cn } from "../lib/utils.ts";

export const KIND_LABEL: Record<EventKind, string> = { clase: "Materia", trabajo: "Laboral", gym: "Entrenamiento", comida: "Comida" };

/* ---------- Panel genérico ---------- */

export function Sheet({
  open,
  onClose,
  title,
  side = "center",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "center" | "left" | "top";
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className={cn(
          "modal-sheet absolute flex max-h-dvh flex-col overflow-y-auto border border-line bg-ink",
          side === "left" && "inset-y-0 left-0 w-[min(20rem,86vw)] border-y-0 border-l-0",
          side === "top" && "inset-x-3 top-16 max-h-[70dvh] rounded-xl sm:left-auto sm:w-96",
          side === "center" && "inset-x-3 top-1/2 max-h-[90dvh] -translate-y-1/2 rounded-xl sm:left-1/2 sm:w-[30rem] sm:-translate-x-1/2",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
          <p className="font-display text-base font-bold">{title}</p>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-panel hover:text-cream">
            ×
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/* ---------- Perfil ---------- */

export function useProfile() {
  return useStored<Profile>(KEYS.profile, DEFAULT_PROFILE);
}

export function ProfilePanel({ compact = false }: { compact?: boolean }) {
  const [profile, setProfile] = useProfile();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const bmi = profile.weightKg / (profile.heightM * profile.heightM);
  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (editing) {
    return (
      <form
        className="space-y-2 rounded-xl border border-line bg-panel p-3 text-xs"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.name.trim() || draft.heightM <= 0 || draft.weightKg <= 0) return;
          setProfile({ ...draft, name: draft.name.trim() });
          setEditing(false);
        }}
      >
        <Field label="Nombre">
          <input className="field" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Altura (m)">
            <input className="field" type="number" step="0.01" min="1" max="2.5" value={draft.heightM} onChange={(e) => setDraft({ ...draft, heightM: Number(e.target.value) })} />
          </Field>
          <Field label="Peso (kg)">
            <input className="field" type="number" step="0.1" min="30" max="250" value={draft.weightKg} onChange={(e) => setDraft({ ...draft, weightKg: Number(e.target.value) })} />
          </Field>
        </div>
        <Field label="Objetivo">
          <select className="field" value={draft.goal} onChange={(e) => setDraft({ ...draft, goal: e.target.value })}>
            {["Ganar masa", "Mantener", "Perder grasa", "Fuerza"].map((goal) => (
              <option key={goal}>{goal}</option>
            ))}
          </select>
        </Field>
        <div className="flex gap-2 pt-1">
          <button type="submit" className="btn-accent flex-1">Guardar</button>
          <button type="button" className="btn-line flex-1" onClick={() => setEditing(false)}>
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-panel p-3">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-accent/40 bg-panel-2 font-display text-sm font-bold text-accent">
          {initials || "H"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-cream">{profile.name}</p>
          <p className="truncate text-xs text-muted">{profile.goal}</p>
        </div>
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-xs font-semibold text-accent hover:bg-panel-2"
          onClick={() => {
            setDraft(profile);
            setEditing(true);
          }}
        >
          Editar
        </button>
      </div>
      {compact ? null : (
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center tabular-nums">
          <Stat label="Altura" value={`${profile.heightM.toFixed(2)} m`} />
          <Stat label="Peso" value={`${profile.weightKg} kg`} />
          <Stat label="IMC" value={bmi.toFixed(1)} />
        </dl>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-panel-2 px-1 py-1.5">
      <dt className="text-[10px] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="text-xs font-semibold text-cream">{value}</dd>
    </div>
  );
}

/* ---------- Carga y cumplimiento ---------- */

export function Bar({ value, max, color = "bg-accent", label }: { value: number; max: number; color?: string; label: string }) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel-2" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <div className={cn("h-full rounded-full transition-[width] duration-500", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function WeekStatsPanel() {
  const [meals] = useStored(KEYS.meals, EMPTY_MEALS);
  const [training] = useStored(KEYS.training, EMPTY_TRAINING);
  const today = dateOnly(new Date());
  const stats = weekStats(today, today, meals, training);
  return (
    <div className="space-y-3 rounded-xl border border-line bg-panel p-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold uppercase tracking-wider text-muted">Semana {isoWeek(today)}</span>
        <span className="text-muted">{stats.days} días</span>
      </div>
      <div>
        <div className="mb-1 flex justify-between"><span>Carga de entreno</span><span className="tabular-nums text-accent">{stats.load}%</span></div>
        <Bar value={stats.load} max={100} label="Carga de entreno" />
      </div>
      <div>
        <div className="mb-1 flex justify-between"><span>Comidas hechas</span><span className="tabular-nums text-rail-meal">{stats.meals}%</span></div>
        <Bar value={stats.meals} max={100} color="bg-rail-meal" label="Comidas hechas" />
      </div>
      <div className="flex justify-between border-t border-line pt-2">
        <span className="text-muted">Cumplimiento</span>
        <span className="font-semibold tabular-nums text-cream">{stats.compliance}%</span>
      </div>
      <p className="text-[11px] leading-snug text-muted">
        {stats.sessionsDone} entrenos completos y {stats.mealsEaten} de {stats.mealsPlanned} comidas marcadas hasta hoy.
      </p>
    </div>
  );
}

/* ---------- Eventos propios ---------- */

export function useEvents() {
  return useStored<CustomEvent[]>(KEYS.events, EMPTY_EVENTS);
}

export function eventsFor(events: CustomEvent[], iso: string): CustomEvent[] {
  return events.filter((event) => event.iso === iso).sort((a, b) => a.start.localeCompare(b.start));
}

export function NewEventButton({ iso, className }: { iso: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn("btn-accent inline-flex items-center justify-center gap-1.5", className)}>
        <span aria-hidden>+</span> Nuevo evento
      </button>
      <NewEventDialog open={open} onClose={() => setOpen(false)} iso={iso} />
    </>
  );
}

function NewEventDialog({ open, onClose, iso }: { open: boolean; onClose: () => void; iso: string }) {
  const [, setEvents] = useEvents();
  const [draft, setDraft] = useState({ title: "", iso, start: "18:00", end: "19:00", kind: "gym" as EventKind });
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) setDraft((current) => ({ ...current, iso }));
  }, [open, iso]);
  return (
    <Sheet open={open} onClose={onClose} title="Nuevo evento">
      <form
        className="space-y-3 text-sm"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.title.trim()) return setError("Ponle un nombre al evento.");
          if (draft.end <= draft.start) return setError("La hora de fin debe ser después del inicio.");
          setEvents((current) => [...current, { ...draft, title: draft.title.trim(), id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }]);
          setDraft((current) => ({ ...current, title: "" }));
          setError("");
          onClose();
        }}
      >
        <Field label="Nombre">
          <input className="field" autoFocus value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Ej. Reunión de proyecto" />
        </Field>
        <Field label="Fecha">
          <input className="field" type="date" min="2026-10-01" max="2027-02-28" value={draft.iso} onChange={(e) => e.target.value && setDraft({ ...draft, iso: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Inicio">
            <input className="field" type="time" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} />
          </Field>
          <Field label="Fin">
            <input className="field" type="time" value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} />
          </Field>
        </div>
        <Field label="Categoría (se filtra con ella)">
          <select className="field" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as EventKind })}>
            {(Object.keys(KIND_LABEL) as EventKind[]).map((kind) => (
              <option key={kind} value={kind}>{KIND_LABEL[kind]}</option>
            ))}
          </select>
        </Field>
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
        <button type="submit" className="btn-accent w-full">Guardar evento</button>
      </form>
    </Sheet>
  );
}

/* ---------- Notificaciones: lo que queda hoy ---------- */

type Upcoming = { key: string; start: number; label: string; kind: EventKind };

export function upcomingToday(now: Date, events: CustomEvent[]): Upcoming[] {
  const day = dateOnly(now);
  const minute = now.getHours() * 60 + now.getMinutes();
  const list: Upcoming[] = [];
  if (isInRange(day)) {
    for (const item of buildDay(day).items) {
      const label =
        item.kind === "clase" ? item.block.name : item.kind === "comida" ? item.meal.role : item.kind === "gym" ? `Gym: ${item.session.title}` : "Trabajo";
      list.push({ key: `${item.kind}-${item.start}`, start: item.start, label, kind: item.kind });
    }
  }
  for (const event of eventsFor(events, toIso(day))) {
    list.push({ key: event.id, start: parseClock(event.start), label: event.title, kind: event.kind });
  }
  return list.filter((item) => item.start >= minute).sort((a, b) => a.start - b.start);
}

export function NotificationsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [events] = useEvents();
  const now = useMemo(() => new Date(), [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const items = upcomingToday(now, events);
  return (
    <Sheet open={open} onClose={onClose} title="Lo que queda hoy" side="top">
      <p className="mb-3 text-xs text-muted">{formatLong(now).replace(/^./, (l) => l.toUpperCase())}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted">No quedan bloques para hoy.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.key} className="relative flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-line bg-panel py-2.5 pl-4 pr-3">
              <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px]", `tl-dot-${item.kind}`)} />
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted">{KIND_LABEL[item.kind]}</span>
                <span className="block truncate text-sm font-semibold">{item.label}</span>
              </span>
              <span className="shrink-0 text-xs tabular-nums text-accent">{formatClock(item.start)}</span>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}

/* ---------- Menú lateral móvil ---------- */

const SECTIONS = [
  { to: "/", label: "Calendario", end: true },
  { to: "/clases", label: "Clases", end: false },
  { to: "/semana", label: "Semana", end: false },
  { to: "/entreno", label: "Entreno", end: false },
  { to: "/comidas", label: "Comidas", end: false },
];

export function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="HIERRO" side="left">
      <nav aria-label="Secciones del menú" className="space-y-1">
        {SECTIONS.map((section) => (
          <NavLink
            key={section.to}
            to={section.to}
            end={section.end}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex min-h-11 items-center rounded-lg border-l-2 px-3 text-sm font-semibold",
                isActive ? "border-accent bg-panel-2 text-accent" : "border-transparent text-muted hover:text-cream",
              )
            }
          >
            {section.label}
          </NavLink>
        ))}
      </nav>
      <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-muted">Perfil</p>
      <ProfilePanel />
      <div className="mt-3">
        <WeekStatsPanel />
      </div>
    </Sheet>
  );
}

/* ---------- Entreno guiado ---------- */

export function GuidedWorkout({
  open,
  onClose,
  session,
  iso,
  checks,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  session: Session;
  iso: string;
  checks: Record<string, boolean>;
  onDone: (id: string, value: boolean) => void;
}) {
  const [index, setIndex] = useState(0);
  const [set, setSet] = useState(1);
  const [rest, setRest] = useState(0);
  const exercise = session.exercises[index];
  const total = exercise ? parseSets(exercise.reps) : 0;

  useEffect(() => {
    if (!open) return;
    const firstPending = session.exercises.findIndex((item) => !checks[`${iso}:${item.id}`]);
    setIndex(firstPending < 0 ? 0 : firstPending);
    setSet(1);
    setRest(0);
    // solo al abrir
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (rest <= 0) return;
    const timer = window.setTimeout(() => setRest((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [rest]);

  if (!exercise) return null;
  const done = Boolean(checks[`${iso}:${exercise.id}`]);
  const doneCount = session.exercises.filter((item) => checks[`${iso}:${item.id}`]).length;

  function go(next: number) {
    setIndex(Math.max(0, Math.min(session.exercises.length - 1, next)));
    setSet(1);
    setRest(0);
  }

  function completeSet() {
    if (set < total) {
      setSet(set + 1);
      setRest(parseRest(exercise!.reps));
      return;
    }
    onDone(exercise!.id, true);
    if (index < session.exercises.length - 1) go(index + 1);
  }

  return (
    <Sheet open={open} onClose={onClose} title={`Entreno guiado · ${session.title}`}>
      <div className="mb-3 flex items-center justify-between text-xs text-muted">
        <span>
          Ejercicio {index + 1} de {session.exercises.length}
        </span>
        <span className="tabular-nums">Hechos {doneCount} de {session.exercises.length}</span>
      </div>
      <Bar value={doneCount} max={session.exercises.length} label="Progreso del entreno" />
      <div className="mt-4 grid aspect-[4/3] place-items-center overflow-hidden rounded-xl border border-line bg-panel">
        <CoachView pose={exercise.pose} decorative className="h-full w-full" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-extrabold leading-tight">{exercise.name}</h3>
      <p className="mt-1 text-sm text-cream/85">{exercise.reps}</p>
      <p className="text-sm text-muted">{exercise.weight}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-line bg-panel p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Serie</p>
          <p className="font-display text-3xl font-extrabold tabular-nums">
            {done ? total : set}
            <span className="text-base text-muted"> / {total}</span>
          </p>
        </div>
        <div className={cn("rounded-xl border p-3", rest > 0 ? "border-accent/50 bg-panel-2" : "border-line bg-panel")}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Descanso</p>
          <p className={cn("font-display text-3xl font-extrabold tabular-nums", rest > 0 && "text-accent")} aria-live="polite">
            {rest > 0 ? `${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, "0")}` : "Listo"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {done ? (
          <button type="button" className="btn-line flex-1" onClick={() => onDone(exercise.id, false)}>
            Desmarcar
          </button>
        ) : (
          <button type="button" className="btn-accent flex-1" onClick={completeSet} disabled={rest > 0}>
            {set < total ? "Serie hecha" : "Terminar ejercicio"}
          </button>
        )}
        {rest > 0 ? (
          <button type="button" className="btn-line" onClick={() => setRest(0)}>
            Saltar descanso
          </button>
        ) : null}
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" className="btn-line flex-1" disabled={index === 0} onClick={() => go(index - 1)}>
          Anterior
        </button>
        <button type="button" className="btn-line flex-1" disabled={index === session.exercises.length - 1} onClick={() => go(index + 1)}>
          Siguiente
        </button>
      </div>
      {doneCount === session.exercises.length ? (
        <p className="mt-3 rounded-xl border border-rail-meal/40 bg-block-meal/40 px-3 py-2 text-sm text-rail-meal">Entreno completo.</p>
      ) : null}
    </Sheet>
  );
}
