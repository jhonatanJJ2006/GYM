import type { PoseId } from "../data/poses.ts";

/**
 * Clips del coach (public/models/coach.glb) y el equipo que se anima con cada uno
 * (public/models/gear/<archivo>.glb, con un clip del mismo nombre). Todos comparten
 * el mismo origen: el coach y el equipo se colocan en (0, 0, 0) y se reproducen
 * al mismo tiempo. Un clip dura 90 cuadros a 30 fps y cierra en bucle.
 */
export type ClipName =
  | "Idle"
  | "BenchPress"
  | "InclinePress"
  | "CurlDumbbell"
  | "HammerCurl"
  | "SquatBarbell"
  | "RomanianDeadlift"
  | "BentOverRow"
  | "ShoulderPress"
  | "LateralRaise"
  | "Lunge"
  | "CalfRaise"
  | "FarmerCarry"
  | "LegPress"
  | "LegPressHigh"
  | "LatPulldown"
  | "CablePushdown"
  | "CableCrossover"
  | "TreadmillJog"
  | "TreadmillWalk"
  | "Bike"
  | "Plank"
  | "Crunch"
  | "Breathe"
  | "GluteBridge"
  | "LegRaise";

export type GearFile =
  | "bench_press"
  | "incline_press"
  | "dumbbells"
  | "squat"
  | "barbell_floor"
  | "leg_press"
  | "pulldown"
  | "cable_pushdown"
  | "cable_crossover"
  | "treadmill"
  | "bike"
  | "mat";

export type CameraView = "front" | "side" | "high";

export type ClipInfo = { gear: GearFile | null; view: CameraView };

export const CLIP_FPS = 30;
export const CLIP_FRAMES = 90;

export const CLIPS: Record<ClipName, ClipInfo> = {
  Idle: { gear: null, view: "front" },
  BenchPress: { gear: "bench_press", view: "high" },
  InclinePress: { gear: "incline_press", view: "front" },
  CurlDumbbell: { gear: "dumbbells", view: "front" },
  HammerCurl: { gear: "dumbbells", view: "front" },
  SquatBarbell: { gear: "squat", view: "front" },
  RomanianDeadlift: { gear: "barbell_floor", view: "front" },
  BentOverRow: { gear: "barbell_floor", view: "front" },
  ShoulderPress: { gear: "dumbbells", view: "front" },
  LateralRaise: { gear: "dumbbells", view: "front" },
  Lunge: { gear: "dumbbells", view: "front" },
  CalfRaise: { gear: "dumbbells", view: "front" },
  FarmerCarry: { gear: "dumbbells", view: "front" },
  LegPress: { gear: "leg_press", view: "front" },
  LegPressHigh: { gear: "leg_press", view: "front" },
  LatPulldown: { gear: "pulldown", view: "front" },
  CablePushdown: { gear: "cable_pushdown", view: "side" },
  CableCrossover: { gear: "cable_crossover", view: "front" },
  TreadmillJog: { gear: "treadmill", view: "side" },
  TreadmillWalk: { gear: "treadmill", view: "side" },
  Bike: { gear: "bike", view: "side" },
  Plank: { gear: "mat", view: "high" },
  Crunch: { gear: "mat", view: "high" },
  Breathe: { gear: "mat", view: "high" },
  GluteBridge: { gear: "mat", view: "high" },
  LegRaise: { gear: "mat", view: "high" },
};

/**
 * Cada ejercicio de la app usa un clip. Los marcados como aproximados reusan el
 * movimiento más cercano hasta que tengan su propio clip.
 */
export const POSE_CLIP: Record<PoseId, ClipName> = {
  bike: "Bike",
  squat: "SquatBarbell",
  bench: "BenchPress",
  incline: "InclinePress",
  fly: "CableCrossover",
  dip: "CablePushdown", // aproximado: tríceps
  pushdown: "CablePushdown",
  lateral: "LateralRaise",
  pulldown: "LatPulldown",
  row: "BentOverRow",
  "cable-row": "BentOverRow", // aproximado: remo
  face: "CableCrossover", // aproximado: polea alta
  curl: "CurlDumbbell",
  hammer: "HammerCurl",
  ohp: "ShoulderPress",
  rear: "LateralRaise", // aproximado: deltoide
  overhead: "ShoulderPress", // aproximado: brazos sobre la cabeza
  kickback: "BentOverRow", // aproximado: tronco inclinado
  "incline-curl": "CurlDumbbell", // aproximado
  rdl: "RomanianDeadlift",
  lunge: "Lunge",
  "leg-curl": "GluteBridge", // aproximado: isquios
  calf: "CalfRaise",
  press: "LegPress",
  bulgarian: "Lunge", // aproximado: zancada
  thrust: "GluteBridge",
  "press-high": "LegPressHigh",
  "calf-seat": "CalfRaise", // aproximado
  deadbug: "LegRaise", // aproximado
  plank: "Plank",
  crunch: "Crunch",
  pallof: "CablePushdown", // aproximado: polea de pie
  "leg-raise": "LegRaise",
  "side-plank": "Plank", // aproximado
  farmer: "FarmerCarry",
  "plank-tap": "Plank", // aproximado
  twist: "Crunch", // aproximado
  climber: "Plank", // aproximado
  "side-hip": "Plank", // aproximado
  abwheel: "Plank", // aproximado
  breathe: "Breathe",
  walk: "TreadmillWalk",
  bridge: "GluteBridge",
  band: "LateralRaise", // aproximado: sin banda
  circles: "LateralRaise", // aproximado
};

export function clipFor(pose: PoseId): ClipName {
  return POSE_CLIP[pose] ?? "Idle";
}

export function clipSeconds(): number {
  return CLIP_FRAMES / CLIP_FPS;
}
