import { useCallback, useSyncExternalStore } from "react";

/** Estado persistido en localStorage y compartido entre componentes de la misma pestaña. */
const EVENT = "hierro-store";
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return fallback;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: unknown = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw);
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value as T;
}

export function writeStored<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sin almacenamiento disponible */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useStored<T>(key: string, fallback: T): [T, (next: T | ((current: T) => T)) => void] {
  const value = useSyncExternalStore(subscribe, () => read(key, fallback), () => fallback);
  const set = useCallback(
    (next: T | ((current: T) => T)) => {
      const current = read(key, fallback);
      writeStored(key, typeof next === "function" ? (next as (c: T) => T)(current) : next);
    },
    // fallback es un valor estable de cada llamada
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, set];
}

export const KEYS = {
  profile: "hierro.perfil",
  meals: "hierro.comidas.hechas",
  events: "hierro.eventos",
  training: "hierro.entreno.checks",
} as const;

export type Profile = { name: string; heightM: number; weightKg: number; goal: string };
export const DEFAULT_PROFILE: Profile = { name: "Jhonatan", heightM: 1.72, weightKg: 68, goal: "Ganar masa" };

export type EventKind = "clase" | "trabajo" | "gym" | "comida";
export type CustomEvent = { id: string; iso: string; start: string; end: string; title: string; kind: EventKind };

export type MealLog = Record<string, number[]>;
export type TrainingLog = Record<string, boolean>;

export const EMPTY_MEALS: MealLog = {};
export const EMPTY_EVENTS: CustomEvent[] = [];
export const EMPTY_TRAINING: TrainingLog = {};
