import { isInTerm } from "../lib/dates.ts";

export const COURSE_COLOR = {
  "Fundamentos de Ingeniería de Software": "#6ea8fe",
  "Practicum 2.1": "#2ec4b6",
  "Estadística y Probabilidad": "#f0c14a",
  "Sistemas Operativos": "#ff6b4a",
  "Lógica Digital": "#c084fc",
  "Ética y Moral": "#8fd99a",
  "Ingeniería Web": "#ff8fab",
  "Introducción a la Inteligencia de Negocios": "#f3a35c",
} as const;

export type CourseName = keyof typeof COURSE_COLOR;

export const COURSE_SHORT: Record<CourseName, string> = {
  "Fundamentos de Ingeniería de Software": "Fund. Ing. Software",
  "Practicum 2.1": "Practicum 2.1",
  "Estadística y Probabilidad": "Estadística",
  "Sistemas Operativos": "Sistemas Operativos",
  "Lógica Digital": "Lógica Digital",
  "Ética y Moral": "Ética y Moral",
  "Ingeniería Web": "Ingeniería Web",
  "Introducción a la Inteligencia de Negocios": "Inteligencia de Negocios",
};

export type ClassKind = "DOCENCIA" | "TUTORÍA" | "PRÁCTICA";
export type ClassMode = "presencial" | "distancia";

export type ClassBlock = {
  start: string;
  end: string;
  name: CourseName;
  type: ClassKind;
  mode: ClassMode;
  building: string;
  room: string;
  nrc: string;
  professor: string;
};

export type Weekday = 1 | 2 | 3 | 4 | 5;

function block(
  start: string,
  end: string,
  name: CourseName,
  type: ClassKind,
  mode: ClassMode,
  building = "",
  room = "",
  nrc = "",
  professor = "",
): ClassBlock {
  return { start, end, name, type, mode, building, room, nrc, professor };
}

export const CLASSES: Record<Weekday, ClassBlock[]> = {
  1: [
    block(
      "10:00",
      "11:59",
      "Fundamentos de Ingeniería de Software",
      "DOCENCIA",
      "presencial",
      "Edificio 05",
      "053I",
      "52604",
      "Guamán Coronel, Daniel Alejandro",
    ),
    block(
      "12:00",
      "12:29",
      "Practicum 2.1",
      "TUTORÍA",
      "presencial",
      "Edificio 01",
      "0132",
      "51625",
      "Ruiz Vivanco, Omar Alexander",
    ),
    block("12:30", "12:59", "Practicum 2.1", "PRÁCTICA", "presencial"),
    block(
      "15:00",
      "15:59",
      "Estadística y Probabilidad",
      "DOCENCIA",
      "presencial",
      "Edificio 10",
      "10405",
      "52001",
      "Torres Díaz, Juan Carlos",
    ),
    block("16:00", "16:59", "Estadística y Probabilidad", "PRÁCTICA", "presencial", "Edificio 10", "10405"),
  ],
  2: [
    block(
      "07:00",
      "07:59",
      "Sistemas Operativos",
      "DOCENCIA",
      "presencial",
      "Edificio 05",
      "053H",
      "51617",
      "Enciso Quispe, Liliana Elvira",
    ),
    block("08:00", "08:59", "Sistemas Operativos", "PRÁCTICA", "presencial", "Edificio 05", "053H"),
    block("10:00", "11:59", "Fundamentos de Ingeniería de Software", "PRÁCTICA", "presencial", "Edificio 05", "053I"),
    block("12:00", "12:59", "Fundamentos de Ingeniería de Software", "TUTORÍA", "presencial", "Edificio 05", "053I"),
    block(
      "15:00",
      "15:59",
      "Lógica Digital",
      "DOCENCIA",
      "presencial",
      "Edificio 10",
      "10501",
      "51909",
      "Dávila Vargas, Fernando Marcelo",
    ),
    block("16:00", "16:59", "Lógica Digital", "PRÁCTICA", "presencial", "Edificio 10", "10501"),
  ],
  3: [
    block(
      "07:00",
      "07:59",
      "Ética y Moral",
      "DOCENCIA",
      "presencial",
      "Edificio 01",
      "0133",
      "52015",
      "Serrano Cueva, Víctor Manuel",
    ),
    block("08:00", "08:59", "Ética y Moral", "PRÁCTICA", "presencial", "Edificio 01", "0133"),
    block(
      "10:00",
      "10:59",
      "Ingeniería Web",
      "DOCENCIA",
      "presencial",
      "Edificio 09",
      "093E",
      "51829",
      "Ramírez Coronel, Ramiro Leonardo",
    ),
    block("11:00", "11:59", "Ingeniería Web", "PRÁCTICA", "presencial", "Edificio 09", "093E"),
    block("12:00", "12:59", "Ingeniería Web", "TUTORÍA", "presencial", "Edificio 09", "093E"),
  ],
  4: [
    block("07:00", "07:59", "Ética y Moral", "TUTORÍA", "distancia", "Edificio virtual", "VIRTUAL"),
    block("09:00", "09:59", "Sistemas Operativos", "TUTORÍA", "distancia", "Edificio virtual", "VIRTUAL"),
    block("10:00", "12:59", "Practicum 2.1", "PRÁCTICA", "presencial"),
    block("17:00", "17:59", "Estadística y Probabilidad", "TUTORÍA", "distancia", "Edificio virtual", "VIRTUAL"),
    block("18:00", "18:59", "Lógica Digital", "TUTORÍA", "distancia", "Edificio virtual", "VIRTUAL"),
  ],
  5: [
    block("07:00", "08:59", "Practicum 2.1", "PRÁCTICA", "presencial"),
    block(
      "10:00",
      "10:59",
      "Introducción a la Inteligencia de Negocios",
      "DOCENCIA",
      "presencial",
      "Edificio 05",
      "052A",
      "51620",
      "Encalada Encalada, Ángel Eduardo",
    ),
    block(
      "11:00",
      "11:59",
      "Introducción a la Inteligencia de Negocios",
      "PRÁCTICA",
      "presencial",
      "Edificio 05",
      "052A",
    ),
    block(
      "12:00",
      "12:59",
      "Introducción a la Inteligencia de Negocios",
      "TUTORÍA",
      "presencial",
      "Edificio 05",
      "052A",
    ),
  ],
};

export function classesFor(date: Date): ClassBlock[] {
  if (!isInTerm(date)) return [];
  const dow = date.getDay();
  if (dow < 1 || dow > 5) return [];
  return CLASSES[dow as Weekday];
}

export function placeOf(block: ClassBlock): string {
  if (!block.building && !block.room) return "Sin salón asignado";
  const bits: string[] = [];
  if (block.building) bits.push(block.building);
  if (block.room) bits.push(`salón ${block.room}`);
  return bits.join(" · ");
}

export function modeLabel(block: ClassBlock): string {
  if (block.mode === "distancia") return "Distancia";
  if (!block.building && !block.room) return "Sin salón";
  return "Presencial";
}

export function courseColor(name: CourseName): string {
  return COURSE_COLOR[name];
}
