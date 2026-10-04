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
    "07:30–09:30",
    "2 h",
    "Cinco máquinas de pecho y cinco de tríceps. El inicio ya no es 18:00: alargar esa hora a dos horas pisaba el post-entreno de las 19:25 y no dejaba cinco horas de trabajo por la tarde después de Estadística (15:00–17:00). El hueco libre es antes de Fundamentos, a las 10:00. Las clases y las comidas no se mueven.",
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
    "Pierna",
    "PI",
    "22:00–24:00",
    "2 h",
    "Cinco máquinas de cuádriceps y cinco de isquiotibiales. No cabe a las 18:00: por la mañana Sistemas Operativos ocupa 07:00–09:00 y Fundamentos 10:00–13:00, y por la tarde el trabajo necesita el hueco de después de las 17:00. El gym cierra el día, 22:00–24:00, sin mover clases ni comidas.",
    [
      ["Prensa de piernas", "4×8–10 · 90 s"],
      ["Sentadilla hack", "4×8–10 · 2 min"],
      ["Extensión de cuádriceps", "3×12–15 · 60 s"],
      ["Prensa unilateral", "3×10 por pierna · 75 s"],
      ["Sentadilla en Smith", "3×8–10 · 90 s"],
      ["Curl femoral acostado", "3×10–12 · 60 s"],
      ["Curl femoral sentado", "3×10–12 · 60 s"],
      ["Curl femoral de pie", "3×12 por pierna · 60 s"],
      ["Peso muerto rumano en Smith", "3×8–10 · 90 s"],
      ["Curl femoral en polea", "3×12 por pierna · 60 s"],
    ],
  ),
  pull: session(
    "pull",
    "pull",
    "Jalón · espalda",
    "JA",
    "15:10–17:10",
    "2 h",
    "Cinco máquinas de espalda y cinco de bíceps. El inicio se adelanta a las 15:10 porque entre el pre-entreno (acaba 17:35) y el post-entreno (19:25) no hay dos horas, y esas comidas no se mueven. Termina cuando empieza el pre-entreno.",
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
    "22:25–24:25",
    "2 h",
    "Semanas 1 y 3. Cinco máquinas de hombro y cinco de tríceps. No es a las 19:15: de 17:00 a 18:59 hay tutorías y el pre-entreno sigue a las 19:00. Para dejar cinco horas de trabajo por la tarde, el gym es 22:25–24:25. Clases y comidas quietas.",
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
    "22:25–24:25",
    "2 h",
    "Semanas 2 y 4. Cinco máquinas de hombro y cinco de bíceps. Mismo ajuste que el jueves de tríceps: 22:25–24:25 para no pisar las tutorías ni quitarle la tarde al trabajo. Luego el ciclo de 4 semanas se repite.",
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
    "Pierna B · posterior",
    "PB",
    "15:10–17:10",
    "2 h",
    "Cinco máquinas de isquiotibiales y cinco de glúteo. Segunda pierna de la semana. 15:10–17:10, antes del pre-entreno: el tramo 17:35–19:25 no da para dos horas sin mover la comida.",
    [
      ["Curl femoral acostado", "4×8–10 · 90 s"],
      ["Curl femoral sentado", "3×10–12 · 60 s"],
      ["Curl femoral de pie", "3×12 por pierna · 60 s"],
      ["Peso muerto rumano en Smith", "3×8–10 · 90 s"],
      ["Curl femoral en polea", "3×12 por pierna · 60 s"],
      ["Hip thrust en máquina", "4×8–10 · 90 s"],
      ["Patada de glúteo en polea", "3×12 por pierna · 60 s"],
      ["Puente de glúteo en máquina", "3×10–12 · 75 s"],
      ["Prensa con pies altos", "3×12 · 75 s"],
      ["Abducción de cadera en máquina", "3×12–15 · 60 s"],
    ],
  ),
  absA: session(
    "absA",
    "abs",
    "Abdomen",
    "AB",
    "09:15–11:15",
    "2 h",
    "Fin de semana, sin clases. Cinco ejercicios de abdomen en máquina o polea. Empieza 09:15 para que las dos horas terminen a las 11:15, cuando sigue el post-entreno. Esa comida no se mueve.",
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
    "09:15–11:15",
    "2 h",
    "Segunda sesión de abdomen, cinco ejercicios de oblicuos en máquina o polea. Mismo horario que el sábado, 09:15–11:15, para no pisar el post-entreno de las 11:15.",
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
