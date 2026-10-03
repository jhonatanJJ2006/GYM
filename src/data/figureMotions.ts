import type { PoseId } from "./poses.ts";

export type Layout = "stand" | "sit" | "supine" | "prone" | "kneel";

export type Gear = "floor" | "bench" | "incline" | "cable" | "bike" | "seat" | "band" | "wheel" | "bar";

/** Ángulos en grados. 0 deja el hueso colgando hacia +Y local (abajo, de pie). */
export type Joints = {
  lift: number;
  shift: number;
  lean: number;
  thighL: number;
  thighR: number;
  kneeL: number;
  kneeR: number;
  footL: number;
  footR: number;
  armL: number;
  armR: number;
  elbL: number;
  elbR: number;
};

export type Motion = {
  layout: Layout;
  gear: Gear;
  /** Texto breve para el nombre accesible de la figura. */
  blurb: string;
  rewind: boolean;
  dur: string;
  frames: Joints[];
};

const REST: Joints = {
  lift: 0,
  shift: 0,
  lean: 0,
  thighL: 4,
  thighR: 4,
  kneeL: 4,
  kneeR: 4,
  footL: -78,
  footR: -78,
  armL: 12,
  armR: 12,
  elbL: 8,
  elbR: 8,
};

function mirror(frame: Partial<Joints>): Joints {
  const next: Joints = { ...REST, ...frame };
  if (frame.armR === undefined && frame.armL !== undefined) next.armR = frame.armL;
  if (frame.elbR === undefined && frame.elbL !== undefined) next.elbR = frame.elbL;
  if (frame.thighR === undefined && frame.thighL !== undefined) next.thighR = frame.thighL;
  if (frame.kneeR === undefined && frame.kneeL !== undefined) next.kneeR = frame.kneeL;
  if (frame.footR === undefined && frame.footL !== undefined) next.footR = frame.footL;
  return next;
}

function motion(
  layout: Layout,
  gear: Gear,
  blurb: string,
  frames: Partial<Joints>[],
  opts?: { rewind?: boolean; dur?: string },
): Motion {
  return {
    layout,
    gear,
    blurb,
    rewind: opts?.rewind ?? true,
    dur: opts?.dur ?? "2.8s",
    frames: frames.map(mirror),
  };
}

export const FIGURE_MOTIONS = {
  bike: motion(
    "sit",
    "bike",
    "Pedalea sentado, con las piernas alternadas.",
    [
      { lean: 14, thighL: -58, kneeL: 72, thighR: -102, kneeR: 28, armL: -62, armR: -56, elbL: 18, elbR: 16, footL: -20, footR: -10 },
      { lean: 14, thighL: -102, kneeL: 28, thighR: -58, kneeR: 72, armL: -62, armR: -56, elbL: 18, elbR: 16, footL: -10, footR: -20 },
    ],
    { dur: "1.1s" },
  ),
  squat: motion("stand", "bar", "Baja en sentadilla y vuelve a subir.", [
    { lift: 24, thighL: -74, thighR: -68, kneeL: 82, kneeR: 76, armL: -96, armR: -90, elbL: 48, elbR: 44, footL: -96, footR: -96 },
    { lift: 0, thighL: 8, thighR: 4, kneeL: 8, kneeR: 6, armL: -72, armR: -66, elbL: 36, elbR: 32 },
  ]),
  bench: motion("supine", "bench", "Empuja desde el pecho hasta estirar los codos.", [
    { armL: -48, armR: -42, elbL: 98, elbR: 92, thighL: 6, thighR: 2, kneeL: 28, kneeR: 24, footL: -16, footR: -16 },
    { armL: -90, armR: -86, elbL: 6, elbR: 4, thighL: 6, thighR: 2, kneeL: 28, kneeR: 24, footL: -16, footR: -16 },
  ]),
  incline: motion("supine", "incline", "Empuja en el banco inclinado.", [
    { lean: -24, armL: -36, armR: -30, elbL: 96, elbR: 90, kneeL: 26, kneeR: 22, footL: -14, footR: -14 },
    { lean: -24, armL: -78, armR: -74, elbL: 8, elbR: 6, kneeL: 26, kneeR: 22, footL: -14, footR: -14 },
  ]),
  fly: motion("supine", "cable", "Abre los brazos y los junta sobre el pecho.", [
    { armL: 40, elbL: 10, kneeL: 24, footL: -12 },
    { armL: -96, elbL: 18, kneeL: 24, footL: -12 },
  ]),
  dip: motion("stand", "floor", "Baja doblando los codos y empuja hacia arriba.", [
    { lift: 22, armL: 34, armR: 40, elbL: 88, elbR: 82 },
    { lift: 0, armL: 20, armR: 26, elbL: 6, elbR: 8 },
  ]),
  pushdown: motion("stand", "cable", "Estira los codos hacia abajo, con el brazo pegado al cuerpo.", [
    { armL: 6, elbL: -108 },
    { armL: 16, elbL: 2 },
  ]),
  lateral: motion("stand", "floor", "Eleva los brazos hasta la altura del hombro.", [
    { armL: -102, armR: -94, elbL: 14, elbR: 16 },
    { armL: 16, armR: 20, elbL: 6, elbR: 8 },
  ]),
  pulldown: motion("sit", "cable", "Tira la barra desde arriba hacia el pecho.", [
    { thighL: -90, thighR: -86, kneeL: 88, kneeR: 84, footL: -8, footR: -8, armL: -168, armR: -160, elbL: 10, elbR: 12 },
    { thighL: -90, thighR: -86, kneeL: 88, kneeR: 84, footL: -8, footR: -8, armL: -36, armR: -30, elbL: 78, elbR: 72 },
  ]),
  row: motion("stand", "bar", "Con el tronco inclinado, tira la carga hacia la cadera.", [
    { lean: 60, kneeL: 14, kneeR: 12, armL: -46, armR: -42, elbL: 96, elbR: 90 },
    { lean: 64, kneeL: 14, kneeR: 12, armL: -58, armR: -54, elbL: 8, elbR: 10 },
  ]),
  "cable-row": motion("sit", "cable", "Sentado, tira el agarre hacia el abdomen.", [
    { lean: 0, thighL: -88, thighR: -84, kneeL: 86, kneeR: 82, footL: -6, footR: -6, armL: -8, armR: -4, elbL: 102, elbR: 96 },
    { lean: 8, thighL: -88, thighR: -84, kneeL: 86, kneeR: 82, footL: -6, footR: -6, armL: -58, armR: -52, elbL: 10, elbR: 12 },
  ]),
  face: motion("stand", "cable", "Tira hacia la cara, con los codos altos.", [
    { armL: -124, armR: -116, elbL: 78, elbR: 72 },
    { armL: -42, armR: -36, elbL: 16, elbR: 14 },
  ]),
  curl: motion("stand", "bar", "Flexiona los codos y baja la barra despacio.", [
    { armL: 14, armR: 18, elbL: -128, elbR: -122 },
    { armL: 8, armR: 12, elbL: 6, elbR: 8 },
  ]),
  hammer: motion("stand", "floor", "Alterna el curl con las palmas enfrentadas.", [
    { armL: 10, armR: 14, elbL: -124, elbR: 8 },
    { armL: 10, armR: 14, elbL: 8, elbR: -124 },
  ]),
  ohp: motion("stand", "floor", "Empuja desde los hombros hasta arriba.", [
    { armL: -176, armR: -170, elbL: 4, elbR: 2 },
    { armL: -128, armR: -120, elbL: 86, elbR: 80 },
  ]),
  rear: motion("stand", "floor", "Tronco inclinado: abre los brazos hacia los lados.", [
    { lean: 70, kneeL: 12, armL: -36, armR: -28, elbL: 12, elbR: 14 },
    { lean: 70, kneeL: 12, armL: 24, armR: 30, elbL: 8, elbR: 10 },
  ]),
  overhead: motion("stand", "floor", "Estira los codos por encima de la cabeza.", [
    { armL: -162, armR: -156, elbL: 88, elbR: 82 },
    { armL: -174, armR: -170, elbL: 6, elbR: 4 },
  ]),
  kickback: motion("stand", "floor", "Tronco inclinado: estira el antebrazo hacia atrás.", [
    { lean: 66, kneeL: 12, armL: 46, armR: 52, elbL: 4, elbR: 2 },
    { lean: 66, kneeL: 12, armL: 28, armR: 34, elbL: 86, elbR: 80 },
  ]),
  "incline-curl": motion("sit", "incline", "Brazos detrás del torso: flexiona sin adelantar el codo.", [
    { lean: -22, thighL: -86, thighR: -82, kneeL: 84, kneeR: 80, footL: -8, footR: -8, armL: 40, armR: 46, elbL: -118, elbR: -112 },
    { lean: -22, thighL: -86, thighR: -82, kneeL: 84, kneeR: 80, footL: -8, footR: -8, armL: 36, armR: 42, elbL: 16, elbR: 18 },
  ]),
  rdl: motion("stand", "bar", "Lleva la cadera atrás, rodillas blandas y espalda recta.", [
    { lean: 70, kneeL: 20, kneeR: 18, armL: -64, armR: -60, elbL: 8, elbR: 10, lift: 4 },
    { lean: 16, kneeL: 12, kneeR: 10, armL: -10, armR: -6, elbL: 6, elbR: 8 },
  ]),
  lunge: motion("stand", "floor", "Da un paso largo y baja la rodilla de atrás.", [
    { shift: 6, lift: 16, thighL: -80, kneeL: 86, thighR: 30, kneeR: 80, footL: -100, footR: -70 },
    { shift: 0, lift: 0, thighL: 8, thighR: 4, kneeL: 6, kneeR: 4 },
  ]),
  "leg-curl": motion("prone", "bench", "Lleva los talones hacia el glúteo y baja despacio.", [
    { kneeL: 108, kneeR: 100, armL: -70, armR: -64, elbL: 16, elbR: 14, footL: 16, footR: 16 },
    { kneeL: 10, kneeR: 8, armL: -70, armR: -64, elbL: 16, elbR: 14, footL: 10, footR: 10 },
  ]),
  calf: motion("stand", "floor", "Sube sobre las puntas y baja el talón.", [
    { lift: -10, footL: -108, footR: -108 },
    { lift: 4, footL: -52, footR: -52 },
  ], { dur: "1.8s" }),
  press: motion("sit", "seat", "Empuja la plataforma hasta casi estirar las rodillas.", [
    { thighL: -108, thighR: -102, kneeL: 104, kneeR: 98, footL: 8, footR: 8, armL: -16, armR: -12, elbL: 20, elbR: 18 },
    { thighL: -64, thighR: -58, kneeL: 14, kneeR: 12, footL: -8, footR: -8, armL: -16, armR: -12, elbL: 20, elbR: 18 },
  ]),
  bulgarian: motion("stand", "bench", "Pie de atrás elevado: baja en la pierna de adelante.", [
    { lift: 16, thighL: -84, kneeL: 90, thighR: 44, kneeR: 76, footL: -102, footR: -36 },
    { thighL: -28, kneeL: 24, thighR: 12, kneeR: 36, footR: -40 },
  ]),
  thrust: motion("supine", "floor", "Empuja la cadera hacia arriba, hombros apoyados.", [
    { lift: -16, thighL: -52, thighR: -46, kneeL: 58, kneeR: 52, footL: -90, footR: -90, armL: 8, armR: 12 },
    { lift: 8, thighL: -38, thighR: -32, kneeL: 74, kneeR: 68, footL: -90, footR: -90, armL: 8, armR: 12 },
  ]),
  "press-high": motion("sit", "seat", "Pies altos: extiende las piernas sin bloquear las rodillas.", [
    { thighL: -118, thighR: -112, kneeL: 112, kneeR: 106, footL: 12, footR: 12, armL: -18, elbL: 18 },
    { thighL: -78, thighR: -72, kneeL: 20, kneeR: 16, footL: -4, footR: -4, armL: -18, elbL: 18 },
  ]),
  "calf-seat": motion("sit", "seat", "Sentado, sube las puntas y baja el talón.", [
    { thighL: -90, thighR: -86, kneeL: 90, kneeR: 86, footL: -48, footR: -48, lift: 2, armL: -20, elbL: 24 },
    { thighL: -90, thighR: -86, kneeL: 90, kneeR: 86, footL: -110, footR: -110, lift: -4, armL: -20, elbL: 24 },
  ], { dur: "1.8s" }),
  deadbug: motion("supine", "floor", "Baja un brazo y la pierna contraria, lumbar quieta.", [
    { armL: -96, elbL: 6, armR: -18, elbR: 8, thighL: -8, kneeL: 8, thighR: -78, kneeR: 16, footL: -8, footR: -8 },
    { armL: -18, elbL: 8, armR: -96, elbR: 6, thighL: -78, kneeL: 16, thighR: -8, kneeR: 8, footL: -8, footR: -8 },
  ], { dur: "3.2s" }),
  plank: motion("prone", "floor", "Cuerpo en una línea, apoyado en los antebrazos.", [
    { armL: -86, armR: -80, elbL: 4, elbR: 6, lift: 0 },
    { armL: -86, armR: -80, elbL: 4, elbR: 6, lift: -3 },
  ], { dur: "2.2s" }),
  crunch: motion("supine", "floor", "Acerca el pecho a la pelvis, sin tirar del cuello.", [
    { lean: -34, lift: -2, armL: -52, armR: -46, elbL: 20, elbR: 18, kneeL: 18, footL: -10, footR: -10 },
    { lean: 0, armL: -28, armR: -22, elbL: 16, elbR: 14, kneeL: 18, footL: -10, footR: -10 },
  ]),
  pallof: motion("stand", "cable", "Empuja el agarre al frente y no dejes que el torso rote.", [
    { lean: 6, armL: -90, armR: -84, elbL: 6, elbR: 4 },
    { lean: -8, armL: -28, armR: -24, elbL: 72, elbR: 66 },
  ]),
  "leg-raise": motion("supine", "floor", "Sube las piernas juntas y bájalas sin arquear.", [
    { thighL: -86, thighR: -80, kneeL: 12, kneeR: 10, footL: -8, footR: -8, armL: 6, armR: 10 },
    { thighL: 14, thighR: 10, kneeL: 8, kneeR: 6, footL: -6, footR: -6, armL: 6, armR: 10 },
  ]),
  "side-plank": motion("prone", "floor", "Apoyado en un antebrazo, cadera arriba.", [
    { lift: 8, armL: -92, elbL: 2, armR: -150, elbR: 6 },
    { lift: -8, armL: -92, elbL: 2, armR: -150, elbR: 6 },
  ], { dur: "2.2s" }),
  farmer: motion("stand", "floor", "Camina erguido con las mancuernas al lado.", [
    { shift: -16, thighL: -36, kneeL: 42, thighR: 14, kneeR: 10, armL: 8, armR: 8, elbL: 4, elbR: 4 },
    { shift: 16, thighL: 14, kneeL: 10, thighR: -36, kneeR: 42, armL: 8, armR: 8, elbL: 4, elbR: 4 },
  ], { dur: "1.4s" }),
  "plank-tap": motion("prone", "floor", "En plancha alta, toca el hombro contrario.", [
    { armL: -158, armR: -84, elbL: 18, elbR: 4 },
    { armL: -88, armR: -84, elbL: 4, elbR: 4 },
  ]),
  twist: motion("sit", "floor", "Gira el tronco de un lado al otro, pecho alto.", [
    { lean: -24, thighL: -88, thighR: -84, kneeL: 86, kneeR: 82, footL: -6, footR: -6, armL: -74, armR: -68, elbL: 12, elbR: 14 },
    { lean: 24, thighL: -88, thighR: -84, kneeL: 86, kneeR: 82, footL: -6, footR: -6, armL: -74, armR: -68, elbL: 12, elbR: 14 },
  ]),
  climber: motion("prone", "floor", "Lleva una rodilla al pecho y vuelve despacio.", [
    { thighL: -66, kneeL: 58, thighR: 4, kneeR: 6, armL: -86, armR: -80, elbL: 4, elbR: 4 },
    { thighL: 4, kneeL: 6, thighR: -66, kneeR: 58, armL: -86, armR: -80, elbL: 4, elbR: 4 },
  ], { dur: "1.6s" }),
  "side-hip": motion("prone", "floor", "Baja la cadera y súbela por encima de la línea.", [
    { lift: 14, armL: -92, elbL: 2, armR: -150, elbR: 6, thighL: 6, thighR: 6, kneeL: 4, kneeR: 4 },
    { lift: -16, armL: -92, elbL: 2, armR: -150, elbR: 6, thighL: 6, thighR: 6, kneeL: 4, kneeR: 4 },
  ]),
  abwheel: motion("kneel", "wheel", "Rueda hacia adelante y vuelve con el abdomen firme.", [
    { thighL: -94, thighR: -90, kneeL: 92, kneeR: 88, footL: 0, footR: 0, armL: -72, armR: -66, elbL: 8, elbR: 8, lean: 6 },
    { shift: 18, lift: 8, thighL: -42, thighR: -38, kneeL: 36, kneeR: 32, footL: 0, footR: 0, armL: -12, armR: -8, elbL: 6, elbR: 6, lean: 50 },
  ], { dur: "3.2s" }),
  breathe: motion("supine", "floor", "Acostado, el pecho sube al inhalar y baja al exhalar.", [
    { lift: 0, armL: -36, armR: -24, elbL: 28, elbR: 22, kneeL: 16, footL: -8, footR: -8 },
    { lift: -6, armL: -32, armR: -20, elbL: 24, elbR: 18, kneeL: 16, footL: -8, footR: -8 },
  ], { dur: "3.4s" }),
  walk: motion("stand", "floor", "Camina a paso largo, brazos en vaivén.", [
    { shift: -18, thighL: -38, kneeL: 34, thighR: 16, kneeR: 12, armL: -36, armR: 28, elbL: 10, elbR: 12 },
    { shift: 18, thighL: 16, kneeL: 12, thighR: -38, kneeR: 34, armL: 28, armR: -36, elbL: 12, elbR: 10 },
  ], { dur: "1.3s" }),
  bridge: motion("supine", "floor", "Eleva la cadera y aprieta arriba un momento.", [
    { lift: -14, thighL: -56, thighR: -50, kneeL: 60, kneeR: 54, footL: -92, footR: -92, armL: 6, armR: 10 },
    { lift: 6, thighL: -42, thighR: -36, kneeL: 78, kneeR: 72, footL: -92, footR: -92, armL: 10, armR: 14 },
  ]),
  band: motion("stand", "band", "Abre la banda por delante del pecho.", [
    { armL: -118, armR: -36, elbL: 8, elbR: 12 },
    { armL: -28, armR: -22, elbL: 12, elbR: 10 },
  ]),
  circles: motion(
    "stand",
    "floor",
    "Hace círculos con los brazos.",
    [
      { armL: -110, armR: -104, elbL: 8, elbR: 10 },
      { armL: -200, armR: -194, elbL: 6, elbR: 8 },
      { armL: -290, armR: -284, elbL: 8, elbR: 10 },
      { armL: -20, armR: -14, elbL: 6, elbR: 8 }
    ],
    { rewind: false, dur: "3.6s" },
  ),
} satisfies Record<PoseId, Motion>;

export function playback(motion: Motion): Joints[] {
  const frames = motion.frames;
  if (frames.length < 2) return [...frames];
  if (!motion.rewind) return [...frames, frames[0]];
  const back = frames.slice(1, -1).reverse();
  return [...frames, ...back, frames[0]];
}
