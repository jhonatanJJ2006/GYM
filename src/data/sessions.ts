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
    "unos 70 min",
    "Cuatro máquinas de pecho y cuatro de tríceps. Antes, cinco minutos de bici. El superávit de ~300 kcal sostiene esta hipertrofia. No hace falta un atracón después.",
    [
      ["Press de pecho en máquina", "4×8–10 · 90 s"],
      ["Press inclinado en máquina", "3×8–12 · 75 s"],
      ["Aperturas en pec deck", "3×12–15 · 60 s"],
      ["Cruces en polea", "3×12–15 · 60 s"],
      ["Extensión de tríceps en polea", "3×10–12 · 60 s"],
      ["Extensión de tríceps con cuerda", "3×12–15 · 60 s"],
      ["Extensión de tríceps sobre la cabeza en polea", "3×10–12 · 75 s"],
      ["Fondos en máquina asistida", "3×8–12 · 75 s"],
    ],
  ),
  legs: session(
    "legs",
    "legs",
    "Pierna",
    "PI",
    "18:00–19:15",
    "unos 75 min",
    "Cuatro máquinas de cuádriceps y cuatro de isquiotibiales, el mismo reparto que ya mezclaba esta pierna. El superávit de ~300 kcal sostiene esta hipertrofia.",
    [
      ["Prensa de piernas", "4×8–10 · 90 s"],
      ["Sentadilla hack", "4×8–10 · 2 min"],
      ["Extensión de cuádriceps", "3×12–15 · 60 s"],
      ["Prensa unilateral", "3×10 por pierna · 75 s"],
      ["Curl femoral acostado", "3×10–12 · 60 s"],
      ["Curl femoral sentado", "3×10–12 · 60 s"],
      ["Curl femoral de pie", "3×12 por pierna · 60 s"],
      ["Peso muerto rumano en Smith", "3×8–10 · 90 s"],
    ],
  ),
  pull: session(
    "pull",
    "pull",
    "Jalón · espalda",
    "JA",
    "18:00–19:15",
    "unos 70 min",
    "Cuatro máquinas de espalda y cuatro de bíceps: el jalón ya cerraba con curl. El superávit de ~300 kcal sostiene esta hipertrofia.",
    [
      ["Jalón al pecho en máquina", "4×8–10 · 90 s"],
      ["Jalón agarre cerrado", "3×10–12 · 75 s"],
      ["Remo en polea sentado", "4×8–12 · 75 s"],
      ["Remo en máquina", "3×10–12 · 75 s"],
      ["Curl de bíceps en máquina", "3×10–12 · 60 s"],
      ["Curl en polea baja", "3×10–12 · 60 s"],
      ["Curl martillo en polea", "3×12 · 60 s"],
      ["Curl en polea alta", "3×12 · 60 s"],
    ],
  ),
  tri: session(
    "tri",
    "shoulder",
    "Hombro + tríceps",
    "HT",
    "19:15–20:30",
    "unos 70 min",
    "Semanas 1 y 3 del ciclo. Cuatro máquinas de hombro y cuatro de tríceps. No se entrena a las 18:00: esa hora es la tutoría virtual de Lógica Digital (18:00–18:59). El gym pasa a 19:15–20:30. El superávit sostiene el trabajo de hombro y brazo.",
    [
      ["Press de hombro en máquina", "4×8–10 · 90 s"],
      ["Elevaciones laterales en máquina", "3×12–15 · 60 s"],
      ["Elevaciones laterales en polea", "3×12–15 · 60 s"],
      ["Deltoides posterior en máquina", "3×12–15 · 60 s"],
      ["Extensión de tríceps en polea", "3×10–12 · 60 s"],
      ["Extensión de tríceps con cuerda", "3×12–15 · 60 s"],
      ["Extensión de tríceps sobre la cabeza en polea", "3×10–12 · 75 s"],
      ["Fondos en máquina asistida", "3×8–12 · 75 s"],
    ],
  ),
  bi: session(
    "bi",
    "shoulder",
    "Hombro + bíceps",
    "HB",
    "19:15–20:30",
    "unos 70 min",
    "Semanas 2 y 4 del ciclo. Cuatro máquinas de hombro y cuatro de bíceps. No se entrena a las 18:00: esa hora es la tutoría virtual de Lógica Digital (18:00–18:59). El gym pasa a 19:15–20:30. Luego el ciclo de 4 semanas se repite.",
    [
      ["Press de hombro en máquina", "4×8–10 · 90 s"],
      ["Elevaciones laterales en máquina", "3×12–15 · 60 s"],
      ["Elevaciones laterales en polea", "3×12–15 · 60 s"],
      ["Deltoides posterior en máquina", "3×12–15 · 60 s"],
      ["Curl de bíceps en máquina", "3×10–12 · 60 s"],
      ["Curl en polea baja", "3×10–12 · 60 s"],
      ["Curl martillo en polea", "3×12 · 60 s"],
      ["Curl en polea alta", "3×12 · 60 s"],
    ],
  ),
  legsB: session(
    "legsB",
    "legs",
    "Pierna B · posterior",
    "PB",
    "18:00–19:15",
    "unos 70 min",
    "Cuatro máquinas de isquiotibiales y cuatro de glúteo. Segunda pierna de la semana. El superávit sostiene la hipertrofia.",
    [
      ["Curl femoral acostado", "4×8–10 · 90 s"],
      ["Curl femoral sentado", "3×10–12 · 60 s"],
      ["Curl femoral de pie", "3×12 por pierna · 60 s"],
      ["Peso muerto rumano en Smith", "3×8–10 · 90 s"],
      ["Hip thrust en máquina", "4×8–10 · 90 s"],
      ["Patada de glúteo en polea", "3×12 por pierna · 60 s"],
      ["Puente de glúteo en máquina", "3×10–12 · 75 s"],
      ["Prensa con pies altos", "3×12 · 75 s"],
    ],
  ),
  absA: session(
    "absA",
    "abs",
    "Abdomen",
    "AB",
    "10:00–11:00",
    "60 min",
    "Fin de semana, sin clases. Un solo grupo: abdomen en máquina, no un día de dos músculos. El mismo superávit de 2800 kcal; no bajes la comida solo porque no hay pesas.",
    [
      ["Crunch en máquina", "4×12–15 · 45 s"],
      ["Crunch en polea", "3×12–15 · 45 s"],
      ["Elevación de piernas en silla romana", "3×10–12 · 45 s"],
      ["Encogimiento en máquina declinada", "3×12 · 45 s"],
    ],
  ),
  absB: session(
    "absB",
    "abs",
    "Abdomen · oblicuos",
    "AO",
    "10:00–11:00",
    "60 min",
    "Segunda sesión de abdomen, solo oblicuos en máquina o polea. Misma comida del día, carbohidratos repartidos porque el gym es por la mañana.",
    [
      ["Giros en máquina de torso", "4×12 por lado · 45 s"],
      ["Pallof en polea", "3×10 por lado · 45 s"],
      ["Flexión lateral en polea", "3×12 por lado · 45 s"],
      ["Crunch oblicuo en polea", "3×12 por lado · 45 s"],
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
