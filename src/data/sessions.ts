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
    "El superávit de ~300 kcal sostiene esta hipertrofia. No hace falta un atracón después.",
    [
      ["Calentamiento", "6 min bici o elíptica + círculos de hombro + 2 series ligeras del primer press"],
      ["Press banca con barra o mancuernas", "4×6–8 · descanso 2 min"],
      ["Press inclinado con mancuernas", "3×8–10 · 90 s"],
      ["Aperturas en polea o contractor", "3×12 · 60 s"],
      ["Fondos en banco", "3×10–12 · 75 s"],
      ["Extensión de tríceps en polea", "3×10–12 · 60 s"],
      ["Elevaciones laterales", "2×15 · 60 s"],
    ],
  ),
  legs: session(
    "legs",
    "legs",
    "Pierna",
    "PI",
    "18:00–19:15",
    "unos 75 min",
    "El superávit de ~300 kcal sostiene esta hipertrofia.",
    [
      ["Calentamiento", "6 min + sentadilla al aire y 2 series ligeras"],
      ["Sentadilla goblet o con barra", "4×6–8 · 2 min"],
      ["Prensa", "3×10 · 90 s"],
      ["Peso muerto rumano", "3×8–10 · 2 min"],
      ["Zancadas caminando", "3×10 por pierna · 75 s"],
      ["Curl femoral", "3×12 · 60 s"],
      ["Gemelos de pie", "4×12 · 45 s"],
    ],
  ),
  pull: session(
    "pull",
    "pull",
    "Jalón · espalda",
    "JA",
    "18:00–19:15",
    "unos 70 min",
    "El superávit de ~300 kcal sostiene esta hipertrofia.",
    [
      ["Calentamiento", "5 min + jalón ligero"],
      ["Jalón al pecho o dominadas asistidas", "4×6–8 · 2 min"],
      ["Remo con barra o mancuerna", "4×8–10 · 2 min"],
      ["Remo en polea sentado", "3×10–12 · 75 s"],
      ["Face pull", "3×15 · 60 s"],
      ["Curl de bíceps con barra", "3×10–12 · 60 s"],
      ["Curl martillo", "2×12 · 60 s"],
    ],
  ),
  tri: session(
    "tri",
    "shoulder",
    "Hombro + tríceps",
    "HT",
    "19:15–20:30",
    "unos 70 min",
    "Semanas 1 y 3 del ciclo. No se entrena a las 18:00: esa hora es la tutoría virtual de Lógica Digital (18:00–18:59). El gym pasa a 19:15–20:30. El superávit sostiene el trabajo de hombro y brazo.",
    [
      ["Calentamiento", "5 min + mancuernas muy ligeras"],
      ["Press militar con mancuernas", "4×8 · 2 min"],
      ["Elevaciones laterales", "4×12–15 · 60 s"],
      ["Pájaros o elevaciones posteriores", "3×12–15 · 60 s"],
      ["Face pull", "3×15 · 60 s"],
      ["Extensión de tríceps sobre la cabeza", "3×10–12 · 75 s"],
      ["Extensión en polea", "3×12 · 60 s"],
      ["Patada de tríceps", "2×12 · 45 s"],
    ],
  ),
  bi: session(
    "bi",
    "shoulder",
    "Hombro + bíceps",
    "HB",
    "19:15–20:30",
    "unos 70 min",
    "Semanas 2 y 4 del ciclo. No se entrena a las 18:00: esa hora es la tutoría virtual de Lógica Digital (18:00–18:59). El gym pasa a 19:15–20:30. Luego el ciclo de 4 semanas se repite.",
    [
      ["Calentamiento", "5 min + bandas o mancuernas ligeras"],
      ["Press militar con mancuernas", "4×8 · 2 min"],
      ["Elevaciones laterales", "4×12–15 · 60 s"],
      ["Face pull", "3×12–15 · 60 s"],
      ["Pájaros", "3×12 · 60 s"],
      ["Curl con barra", "4×8–10 · 75 s"],
      ["Curl inclinado con mancuernas", "3×10–12 · 60 s"],
      ["Curl martillo", "3×12 · 60 s"],
    ],
  ),
  legsB: session(
    "legsB",
    "legs",
    "Pierna B · posterior",
    "PB",
    "18:00–19:15",
    "unos 70 min",
    "Segunda pierna de la semana. El superávit sostiene la hipertrofia.",
    [
      ["Calentamiento", "6 min + puente de glúteo"],
      ["Peso muerto rumano", "4×6–8 · 2 min"],
      ["Sentadilla búlgara o zancada", "3×8 por pierna · 90 s"],
      ["Hip thrust o puente con peso", "3×10 · 90 s"],
      ["Prensa, pies altos", "3×12 · 75 s"],
      ["Curl femoral", "3×12 · 60 s"],
      ["Gemelos sentado", "3×15 · 45 s"],
    ],
  ),
  absA: session(
    "absA",
    "abs",
    "Abdomen",
    "AB",
    "10:00–11:00",
    "60 min",
    "Fin de semana, sin clases. El mismo superávit de 2800 kcal; no bajes la comida solo porque no hay pesas.",
    [
      ["Camina o bici suave", "8 min"],
      ["Dead bug", "3×8 por lado, lento"],
      ["Plancha", "4×30–40 s"],
      ["Crunch en polea o en el suelo", "3×12"],
      ["Pallof press", "3×10 por lado"],
      ["Elevación de piernas", "3×10"],
      ["Plancha lateral", "3×25 s por lado"],
      ["Paseo del granjero con mancuernas", "3×30 m"],
    ],
  ),
  absB: session(
    "absB",
    "abs",
    "Abdomen · oblicuos",
    "AO",
    "10:00–11:00",
    "60 min",
    "Segunda sesión de abdomen. Misma comida del día, carbohidratos repartidos porque el gym es por la mañana.",
    [
      ["Camina", "8 min"],
      ["Plancha con toque de hombro", "3×10"],
      ["Bicho muerto con pausa", "3×6 por lado"],
      ["Giros con disco ligero, sentado", "3×12"],
      ["Escaladores lentos", "3×20"],
      ["Plancha lateral con cadera", "3×8 por lado"],
      ["Ab wheel o desplome de rodillas", "3×8"],
      ["Respiración acostado, costillas abajo", "3 min"],
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
