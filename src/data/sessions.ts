import { coachFor, describeReps } from "./coaching.ts";
import type { PoseId } from "./poses.ts";
import { cycleWeek } from "../lib/dates.ts";

export const SESSION_COLORS = {
  push: "#ff6b4a",
  legs: "#3dd6c6",
  pull: "#7aa2ff",
  shoulder: "#f0c14a",
  abs: "#c084fc",
} as const;

export type SessionColor = keyof typeof SESSION_COLORS;
export type SessionId = "push" | "legs" | "pull" | "tri" | "bi" | "legsB" | "absA" | "absB";

export type Exercise = {
  id: string;
  name: string;
  detail: string;
  reps: string;
  weight: string;
  weightSuggested: boolean;
  pose: PoseId;
  how: string;
};

export type Session = {
  id: SessionId;
  color: SessionColor;
  title: string;
  short: string;
  time: string;
  minutesLabel: string;
  note: string;
  exercises: Exercise[];
};

function exerciseId(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function session(
  id: SessionId,
  color: SessionColor,
  title: string,
  short: string,
  time: string,
  minutesLabel: string,
  note: string,
  exercises: [string, string][],
): Session {
  return {
    id,
    color,
    title,
    short,
    time,
    minutesLabel,
    note,
    exercises: exercises.map(([name, detail]) => {
      const coach = coachFor(name, detail);
      return {
        id: exerciseId(name),
        name,
        detail,
        reps: describeReps(detail),
        weight: coach.weight,
        weightSuggested: coach.suggested,
        pose: coach.pose,
        how: coach.how,
      };
    }),
  };
}

export const SESSIONS = {
  push: session(
    "push",
    "push",
    "Empuje · pecho y tríceps",
    "EM",
    "18:00–19:15",
    "1 h 15 min",
    "Pecho y tríceps, lunes, 18:00–19:15. Cabe después de Estadística (termina 16:59) y antes de la cena. El trabajo de 5 a 6 horas va en los huecos del día, sin pisar clases ni este bloque.",
    [
      ["Press de pecho en máquina", "4×8–10 · 90 s"],
      ["Press inclinado en máquina", "3×8–12 · 75 s"],
      ["Aperturas en pec deck", "3×12–15 · 60 s"],
      ["Cruces en polea", "3×12–15 · 60 s"],
      ["Cruces en polea baja", "3×12–15 · 60 s"],
      ["Extensión de tríceps en polea", "3×10–12 · 60 s"],
      ["Extensión de tríceps con cuerda", "3×12–15 · 60 s"],
      ["Extensión de tríceps sobre la cabeza en polea", "3×10–12 · 75 s"],
      ["Fondos en máquina asistida", "3×8–12 · 75 s"],
      ["Extensión de tríceps a un brazo en polea", "3×12 por brazo · 60 s"],
    ],
  ),
  legs: session(
    "legs",
    "legs",
    "Cuádriceps y gemelos",
    "CG",
    "18:00–19:15",
    "1 h 15 min",
    "Martes: cuádriceps y gemelos, 18:00–19:15. Lógica termina a las 16:59. No hay isquiotibiales este día; esos van el viernes.",
    [
      ["Prensa de piernas", "4×8–10 · 90 s"],
      ["Sentadilla hack", "4×8–10 · 2 min"],
      ["Extensión de cuádriceps", "3×12–15 · 60 s"],
      ["Prensa unilateral", "3×10 por pierna · 75 s"],
      ["Sentadilla en Smith", "3×8–10 · 90 s"],
      ["Elevación de gemelos de pie", "4×12–15 · 45 s"],
      ["Elevación de gemelos sentado", "3×12–15 · 45 s"],
      ["Elevación de gemelos en prensa", "3×15 · 45 s"],
      ["Elevación de gemelos a una pierna", "3×12 por pierna · 45 s"],
      ["Elevación de gemelos en Smith", "3×10–12 · 60 s"],
    ],
  ),
  pull: session(
    "pull",
    "pull",
    "Jalón · espalda",
    "JA",
    "18:00–19:15",
    "1 h 15 min",
    "Miércoles: espalda y bíceps, 18:00–19:15. Ingeniería Web termina a las 12:59, así que la tarde queda para trabajo y luego el gym.",
    [
      ["Jalón al pecho en máquina", "4×8–10 · 90 s"],
      ["Jalón agarre cerrado", "3×10–12 · 75 s"],
      ["Remo en polea sentado", "4×8–12 · 75 s"],
      ["Remo en máquina", "3×10–12 · 75 s"],
      ["Pullover en polea", "3×12–15 · 60 s"],
      ["Curl de bíceps en máquina", "3×10–12 · 60 s"],
      ["Curl en polea baja", "3×10–12 · 60 s"],
      ["Curl martillo en polea", "3×12 · 60 s"],
      ["Curl en polea alta", "3×12 · 60 s"],
      ["Curl predicador en máquina", "3×10–12 · 60 s"],
    ],
  ),
  tri: session(
    "tri",
    "shoulder",
    "Hombro + tríceps",
    "HT",
    "19:15–20:30",
    "1 h 15 min",
    "Semanas 1 y 3, jueves: hombro y tríceps. El primer jueves con clases es el 8 de octubre de 2026. De 17:00 a 18:59 hay tutorías virtuales, el snack pre-entreno es a las 19:00 y el gym entra a las 19:15.",
    [
      ["Press de hombro en máquina", "4×8–10 · 90 s"],
      ["Elevaciones laterales en máquina", "3×12–15 · 60 s"],
      ["Elevaciones laterales en polea", "3×12–15 · 60 s"],
      ["Deltoides posterior en máquina", "3×12–15 · 60 s"],
      ["Face pull en polea", "3×12–15 · 60 s"],
      ["Extensión de tríceps en polea", "3×10–12 · 60 s"],
      ["Extensión de tríceps con cuerda", "3×12–15 · 60 s"],
      ["Extensión de tríceps sobre la cabeza en polea", "3×10–12 · 75 s"],
      ["Fondos en máquina asistida", "3×8–12 · 75 s"],
      ["Extensión de tríceps a un brazo en polea", "3×12 por brazo · 60 s"],
    ],
  ),
  bi: session(
    "bi",
    "shoulder",
    "Hombro + bíceps",
    "HB",
    "19:15–20:30",
    "1 h 15 min",
    "Semanas 2 y 4, jueves: hombro y bíceps. Mismo horario que el otro jueves, 19:15–20:30, para no pisar la tutoría de Lógica (18:00–18:59) ni el snack de las 19:00.",
    [
      ["Press de hombro en máquina", "4×8–10 · 90 s"],
      ["Elevaciones laterales en máquina", "3×12–15 · 60 s"],
      ["Elevaciones laterales en polea", "3×12–15 · 60 s"],
      ["Deltoides posterior en máquina", "3×12–15 · 60 s"],
      ["Face pull en polea", "3×12–15 · 60 s"],
      ["Curl de bíceps en máquina", "3×10–12 · 60 s"],
      ["Curl en polea baja", "3×10–12 · 60 s"],
      ["Curl martillo en polea", "3×12 · 60 s"],
      ["Curl en polea alta", "3×12 · 60 s"],
      ["Curl predicador en máquina", "3×10–12 · 60 s"],
    ],
  ),
  legsB: session(
    "legsB",
    "legs",
    "Femoral, gemelos y glúteo",
    "FG",
    "18:00–19:15",
    "1 h 15 min",
    "Viernes: isquiotibiales, gemelos y glúteo, 18:00–19:15. Inteligencia de Negocios termina a las 12:59.",
    [
      ["Curl femoral acostado", "4×8–10 · 90 s"],
      ["Curl femoral sentado", "3×10–12 · 60 s"],
      ["Curl femoral de pie", "3×12 por pierna · 60 s"],
      ["Peso muerto rumano en Smith", "3×8–10 · 90 s"],
      ["Elevación de gemelos de pie", "3×12–15 · 45 s"],
      ["Elevación de gemelos sentado", "3×12–15 · 45 s"],
      ["Elevación de gemelos en prensa", "3×15 · 45 s"],
      ["Hip thrust en máquina", "3×8–10 · 75 s"],
      ["Patada de glúteo en polea", "3×12 por pierna · 60 s"],
      ["Puente de glúteo en máquina", "3×10–12 · 60 s"],
    ],
  ),
  absA: session(
    "absA",
    "abs",
    "Abdomen",
    "AB",
    "10:00–11:00",
    "1 h",
    "Sábado: abdomen, 10:00–11:00. Sin clases y sin trabajo. El post-entreno sigue a las 11:15.",
    [
      ["Crunch en máquina", "4×12–15 · 45 s"],
      ["Crunch en polea", "3×12–15 · 45 s"],
      ["Elevación de piernas en silla romana", "3×10–12 · 45 s"],
      ["Encogimiento en máquina declinada", "3×12 · 45 s"],
      ["Elevación de rodillas en polea", "3×12–15 · 45 s"],
    ],
  ),
  absB: session(
    "absB",
    "abs",
    "Abdomen · oblicuos",
    "AO",
    "10:00–11:00",
    "1 h",
    "Domingo: oblicuos, 10:00–11:00. Sin clases y sin trabajo. El post-entreno sigue a las 11:15.",
    [
      ["Giros en máquina de torso", "4×12 por lado · 45 s"],
      ["Pallof en polea", "3×10 por lado · 45 s"],
      ["Flexión lateral en polea", "3×12 por lado · 45 s"],
      ["Crunch oblicuo en polea", "3×12 por lado · 45 s"],
      ["Leñador en polea", "3×12 por lado · 45 s"],
    ],
  ),
} as const satisfies Record<SessionId, Session>;

export function sessionColor(item: Session): string {
  return SESSION_COLORS[item.color];
}

export function sessionFor(date: Date): Session {
  const week = cycleWeek(date);
  switch (date.getDay()) {
    case 1:
      return SESSIONS.push;
    case 2:
      return SESSIONS.legs;
    case 3:
      return SESSIONS.pull;
    case 4:
      return week === 1 || week === 3 ? SESSIONS.tri : SESSIONS.bi;
    case 5:
      return SESSIONS.legsB;
    case 6:
      return SESSIONS.absA;
    default:
      return SESSIONS.absB;
  }
}

export function shoulderFocus(week: number): "tríceps" | "bíceps" {
  return week === 1 || week === 3 ? "tríceps" : "bíceps";
}
