export type PoseId =
  | "bike"
  | "squat"
  | "bench"
  | "incline"
  | "fly"
  | "dip"
  | "pushdown"
  | "lateral"
  | "pulldown"
  | "row"
  | "cable-row"
  | "face"
  | "curl"
  | "hammer"
  | "ohp"
  | "rear"
  | "overhead"
  | "kickback"
  | "incline-curl"
  | "rdl"
  | "lunge"
  | "leg-curl"
  | "calf"
  | "press"
  | "bulgarian"
  | "thrust"
  | "press-high"
  | "calf-seat"
  | "deadbug"
  | "plank"
  | "crunch"
  | "pallof"
  | "leg-raise"
  | "side-plank"
  | "farmer"
  | "plank-tap"
  | "twist"
  | "climber"
  | "side-hip"
  | "abwheel"
  | "breathe"
  | "walk"
  | "bridge"
  | "band"
  | "circles";

export type Gear = "bar" | "db" | "cable" | "none";
export type Accent = "arms" | "legs" | "core";

type Side = {
  view: "side";
  hip: [number, number];
  torso: number;
  arm: [number, number];
  leg: [number, number];
  arm2?: [number, number];
  leg2?: [number, number];
  gear: Gear;
  accent: Accent;
  bench?: boolean;
  seat?: boolean;
};

type Front = {
  view: "front";
  hip: [number, number];
  armL: [number, number];
  armR: [number, number];
  legL: [number, number];
  legR: [number, number];
  gear: Gear;
  accent: Accent;
  lean?: number;
};

export type Pose = Side | Front;

const side = (
  hip: [number, number],
  torso: number,
  arm: [number, number],
  leg: [number, number],
  gear: Gear,
  accent: Accent,
  extra?: Partial<Pick<Side, "arm2" | "leg2" | "bench" | "seat">>,
): Side => ({ view: "side", hip, torso, arm, leg, gear, accent, ...extra });

const front = (
  hip: [number, number],
  armL: [number, number],
  armR: [number, number],
  legL: [number, number],
  legR: [number, number],
  gear: Gear,
  accent: Accent,
  lean = 0,
): Front => ({ view: "front", hip, armL, armR, legL, legR, gear, accent, lean });

export const POSES: Record<PoseId, Pose> = {
  circles: side([124, 112], -6, [-40, -70], [168, 176], "db", "arms", { leg2: [192, 184] }),
  bike: side([168, 104], -28, [70, 40], [20, 150], "none", "legs", { leg2: [130, 40] }),
  squat: side([132, 124], 24, [48, -130], [78, 168], "db", "legs", { leg2: [112, 176] }),
  bench: side([176, 102], -86, [-55, -8], [70, 150], "bar", "arms", { leg2: [96, 160], bench: true }),
  incline: side([168, 118], -52, [-70, -18], [80, 155], "db", "arms", { leg2: [100, 162], bench: true }),
  fly: front([120, 118], [-110, -40], [110, 40], [168, 176], [192, 184], "cable", "arms"),
  dip: side([150, 96], 8, [130, 70], [55, 130], "none", "arms", { leg2: [100, 145], bench: true }),
  pushdown: side([118, 112], 4, [18, 150], [170, 178], "cable", "arms", { leg2: [190, 182] }),
  lateral: front([120, 116], [-78, -78], [78, 78], [170, 178], [190, 182], "db", "arms"),
  pulldown: front([120, 116], [-18, 40], [18, 140], [168, 176], [192, 184], "bar", "arms", 0),
  row: side([128, 108], 72, [210, 130], [168, 176], "bar", "arms", { leg2: [188, 180] }),
  "cable-row": side([96, 116], 16, [200, 40], [70, 150], "cable", "arms", { leg2: [100, 160], seat: true }),
  face: front([120, 116], [-130, -40], [130, 40], [170, 178], [190, 182], "cable", "arms"),
  curl: side([122, 114], 2, [165, -20], [170, 178], "bar", "arms", { leg2: [190, 182] }),
  hammer: side([122, 114], 2, [160, 20], [170, 178], "db", "arms", { leg2: [190, 182] }),
  ohp: side([122, 114], -4, [-12, -8], [170, 178], "db", "arms", { leg2: [190, 182] }),
  rear: side([146, 100], 78, [-80, -70], [166, 176], "db", "arms", { arm2: [40, 50], leg2: [190, 180] }),
  overhead: side([122, 112], 6, [-150, -110], [170, 178], "db", "arms", { leg2: [190, 182] }),
  kickback: side([148, 104], 70, [250, 200], [168, 176], "db", "arms", { leg2: [188, 180] }),
  "incline-curl": side([168, 120], -40, [150, 40], [80, 155], "db", "arms", { leg2: [105, 160], bench: true }),
  rdl: side([118, 108], 78, [150, 165], [164, 174], "bar", "legs", { leg2: [188, 178] }),
  lunge: side([132, 118], 12, [150, 165], [70, 155], "db", "legs", { leg2: [145, 40] }),
  "leg-curl": side([168, 96], -88, [20, 40], [40, -30], "none", "legs", { leg2: [20, 20], bench: true }),
  calf: side([122, 100], 0, [165, 175], [175, 188], "none", "legs", { leg2: [185, 190] }),
  press: side([92, 108], 48, [20, 50], [40, 10], "none", "legs", { seat: true }),
  bulgarian: side([128, 112], 16, [155, 165], [62, 160], "db", "legs", { leg2: [130, -20], bench: true }),
  thrust: side([168, 108], -78, [40, 10], [20, 150], "bar", "legs", { leg2: [40, 155], bench: true }),
  "press-high": side([96, 112], 50, [16, 46], [18, -8], "none", "legs", { seat: true }),
  "calf-seat": side([110, 118], 8, [30, 20], [70, 150], "bar", "legs", { leg2: [100, 155], seat: true }),
  deadbug: side([150, 108], -88, [-40, -10], [-20, 20], "none", "core", { bench: false }),
  plank: side([150, 108], -86, [-100, -70], [150, 175], "none", "core", { leg2: [165, 178] }),
  crunch: side([150, 118], -60, [20, 70], [40, 150], "none", "core"),
  pallof: front([120, 116], [8, 8], [12, 12], [170, 178], [190, 182], "cable", "core"),
  "leg-raise": side([150, 112], -88, [10, 30], [-30, -10], "none", "core"),
  "side-plank": side([150, 100], -88, [-120, -100], [150, 176], "none", "core", { leg2: [160, 178] }),
  farmer: front([120, 114], [155, 168], [25, 12], [170, 178], [190, 182], "db", "core"),
  "plank-tap": side([148, 106], -84, [-130, -20], [152, 176], "none", "core", { leg2: [166, 178] }),
  twist: front([120, 124], [40, 80], [150, 20], [80, 150], [100, 155], "db", "core"),
  climber: side([148, 106], -84, [-110, -80], [40, 150], "none", "core", { leg2: [160, 176] }),
  "side-hip": side([148, 108], -88, [-120, -100], [40, 20], "none", "core", { leg2: [150, 176] }),
  abwheel: side([130, 118], 55, [40, 28], [100, 160], "none", "core", { leg2: [120, 165] }),
  breathe: side([150, 116], -88, [-20, 40], [30, 150], "none", "core"),
  walk: side([118, 108], -8, [40, 20], [40, 160], "none", "legs", { arm2: [200, 170], leg2: [150, 30] }),
  bridge: side([150, 112], -70, [10, 40], [30, 155], "none", "legs", { leg2: [50, 158] }),
  band: front([120, 114], [-100, -20], [100, 20], [170, 178], [190, 182], "none", "arms"),
};
