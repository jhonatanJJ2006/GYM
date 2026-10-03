import type { PoseId } from "./poses.ts";

export type Pt = [number, number];

export type SideBody = {
  head: Pt;
  shoulder: Pt;
  hip: Pt;
  knee: Pt;
  ankle: Pt;
  elbow: Pt;
  wrist: Pt;
  kneeB?: Pt;
  ankleB?: Pt;
  elbowB?: Pt;
  wristB?: Pt;
  face?: "left" | "right" | "up" | "down";
};

export type FrontBody = {
  head: Pt;
  shoulderL: Pt;
  shoulderR: Pt;
  hip: Pt;
  elbowL: Pt;
  wristL: Pt;
  elbowR: Pt;
  wristR: Pt;
  kneeL: Pt;
  ankleL: Pt;
  kneeR: Pt;
  ankleR: Pt;
};

export type Hand = "near" | "far" | "left" | "right" | "both";

export type Gear =
  | { kind: "pad"; from: Pt; to: Pt }
  | { kind: "seat"; at: Pt }
  | { kind: "step"; at: Pt; w: number }
  | { kind: "platform"; from: Pt; to: Pt }
  | { kind: "bike" }
  | { kind: "cable"; anchor: Pt; hand: Hand }
  | { kind: "barbell"; hand: Hand }
  | { kind: "dumbbell"; hand: Hand; angle?: number }
  | { kind: "goblet"; hand: Hand }
  | { kind: "band" }
  | { kind: "wheel"; hand: Hand }
  | { kind: "disc" };

export type Motion =
  | { type: "arrow"; from: Pt; to: Pt }
  | { type: "guide"; from: Pt; to: Pt }
  | { type: "arc"; cx: number; cy: number; r: number; a0: number; a1: number };

export type Scene = {
  view: "side" | "front" | "back";
  body: SideBody | FrontBody;
  ghost?: SideBody | FrontBody;
  gear?: Gear[];
  motion?: Motion[];
};

const STAND: SideBody = {
  head: [132, 42],
  shoulder: [138, 64],
  hip: [140, 112],
  knee: [138, 148],
  ankle: [136, 184],
  elbow: [126, 98],
  wrist: [118, 128],
  kneeB: [154, 150],
  ankleB: [158, 184],
  face: "left",
};

const FRONT: FrontBody = {
  head: [160, 36],
  shoulderL: [136, 60],
  shoulderR: [184, 60],
  hip: [160, 112],
  elbowL: [122, 96],
  wristL: [114, 130],
  elbowR: [198, 96],
  wristR: [206, 130],
  kneeL: [146, 150],
  ankleL: [144, 186],
  kneeR: [174, 150],
  ankleR: [176, 186],
};

function side(over: Partial<SideBody>): SideBody {
  return { ...STAND, ...over };
}

function front(over: Partial<FrontBody>): FrontBody {
  return { ...FRONT, ...over };
}

const benchMain = side({
  head: [62, 96],
  shoulder: [98, 102],
  hip: [172, 106],
  knee: [208, 128],
  ankle: [198, 184],
  elbow: [108, 62],
  wrist: [112, 34],
  kneeB: [216, 132],
  ankleB: [220, 184],
  face: "up",
});

const inclineMain = side({
  head: [70, 72],
  shoulder: [108, 92],
  hip: [176, 124],
  knee: [214, 142],
  ankle: [200, 184],
  elbow: [118, 58],
  wrist: [126, 30],
  kneeB: [222, 148],
  ankleB: [214, 184],
  face: "up",
});

const dipBottom = side({
  head: [124, 78],
  shoulder: [156, 96],
  hip: [150, 138],
  knee: [112, 156],
  ankle: [92, 184],
  elbow: [176, 118],
  wrist: [198, 104],
  kneeB: [124, 162],
  ankleB: [108, 184],
  face: "left",
});

const rowMain = side({
  head: [78, 86],
  shoulder: [112, 98],
  hip: [176, 124],
  knee: [186, 152],
  ankle: [180, 184],
  elbow: [132, 108],
  wrist: [156, 116],
  kneeB: [196, 154],
  ankleB: [198, 184],
  face: "left",
});

const rdlMain = side({
  head: [86, 78],
  shoulder: [114, 92],
  hip: [176, 112],
  knee: [178, 148],
  ankle: [174, 184],
  elbow: [132, 124],
  wrist: [152, 148],
  kneeB: [190, 150],
  ankleB: [192, 184],
  face: "left",
});

const kickMain = side({
  head: [92, 78],
  shoulder: [118, 96],
  hip: [168, 122],
  knee: [176, 152],
  ankle: [172, 184],
  elbow: [150, 100],
  wrist: [196, 92],
  kneeB: [188, 154],
  ankleB: [190, 184],
  face: "left",
});

const curlTop = side({
  elbow: [124, 102],
  wrist: [108, 68],
});

const ohpTop = side({
  elbow: [132, 46],
  wrist: [128, 22],
});

const overheadTop = side({
  elbow: [146, 58],
  wrist: [146, 26],
  face: "left",
});

const plankBody = side({
  head: [58, 108],
  shoulder: [96, 114],
  hip: [168, 118],
  knee: [214, 120],
  ankle: [258, 122],
  elbow: [96, 136],
  wrist: [68, 142],
  kneeB: [220, 126],
  ankleB: [262, 128],
  face: "left",
});

const sidePlankUp = side({
  head: [58, 78],
  shoulder: [96, 92],
  hip: [168, 98],
  knee: [214, 102],
  ankle: [256, 106],
  elbow: [96, 128],
  wrist: [64, 136],
  elbowB: [96, 62],
  wristB: [96, 32],
  face: "left",
});

export const SCENES: Record<PoseId, Scene> = {
  circles: {
    view: "side",
    body: side({ elbow: [108, 78], wrist: [86, 52] }),
    ghost: side({ elbow: [112, 96], wrist: [96, 128] }),
    gear: [{ kind: "dumbbell", hand: "near" }],
    motion: [{ type: "arc", cx: 138, cy: 64, r: 52, a0: 110, a1: 300 }],
  },
  bike: {
    view: "side",
    body: side({
      head: [156, 48],
      shoulder: [142, 68],
      hip: [178, 104],
      knee: [148, 126],
      ankle: [164, 152],
      elbow: [118, 76],
      wrist: [100, 88],
      kneeB: [190, 128],
      ankleB: [174, 158],
    }),
    gear: [{ kind: "bike" }],
    motion: [{ type: "arc", cx: 168, cy: 156, r: 18, a0: 20, a1: 300 }],
  },
  squat: {
    view: "side",
    body: side({
      head: [128, 62],
      shoulder: [136, 82],
      hip: [158, 124],
      knee: [112, 150],
      ankle: [108, 184],
      elbow: [150, 100],
      wrist: [158, 86],
      kneeB: [128, 154],
      ankleB: [124, 184],
    }),
    ghost: side({
      head: [168, 40],
      shoulder: [174, 62],
      hip: [176, 110],
      knee: [174, 148],
      ankle: [172, 184],
      elbow: [162, 88],
      wrist: [156, 108],
      kneeB: [188, 150],
      ankleB: [190, 184],
    }),
    gear: [{ kind: "goblet", hand: "near" }],
    motion: [{ type: "arrow", from: [158, 124], to: [176, 78] }],
  },
  bench: {
    view: "side",
    body: benchMain,
    ghost: { ...benchMain, elbow: [100, 118], wrist: [114, 128] },
    gear: [
      { kind: "pad", from: [52, 112], to: [196, 112] },
      { kind: "barbell", hand: "near" },
    ],
    motion: [{ type: "arrow", from: [154, 128], to: [154, 34] }],
  },
  incline: {
    view: "side",
    body: inclineMain,
    ghost: { ...inclineMain, elbow: [112, 108], wrist: [124, 112] },
    gear: [
      { kind: "pad", from: [64, 112], to: [196, 140] },
      { kind: "dumbbell", hand: "near", angle: -20 },
    ],
    motion: [{ type: "arrow", from: [156, 112], to: [156, 30] }],
  },
  fly: {
    view: "front",
    body: front({
      elbowL: [124, 84],
      wristL: [152, 102],
      elbowR: [196, 84],
      wristR: [168, 102],
    }),
    ghost: front({
      elbowL: [104, 72],
      wristL: [58, 92],
      elbowR: [216, 72],
      wristR: [262, 92],
    }),
    gear: [
      { kind: "cable", anchor: [28, 28], hand: "left" },
      { kind: "cable", anchor: [292, 28], hand: "right" },
    ],
    motion: [
      { type: "arrow", from: [58, 92], to: [148, 102] },
      { type: "arrow", from: [262, 92], to: [172, 102] },
    ],
  },
  dip: {
    view: "side",
    body: dipBottom,
    ghost: side({
      head: [124, 42],
      shoulder: [156, 62],
      hip: [150, 104],
      knee: [118, 132],
      ankle: [100, 168],
      elbow: [184, 78],
      wrist: [198, 104],
      kneeB: [130, 138],
      ankleB: [116, 172],
    }),
    gear: [{ kind: "pad", from: [176, 108], to: [250, 108] }],
    motion: [{ type: "arrow", from: [124, 78], to: [124, 46] }],
  },
  pushdown: {
    view: "side",
    body: side({ elbow: [126, 100], wrist: [124, 146] }),
    ghost: side({ elbow: [126, 100], wrist: [108, 74] }),
    gear: [{ kind: "cable", anchor: [70, 22], hand: "near" }],
    motion: [{ type: "arrow", from: [96, 74], to: [96, 146] }],
  },
  lateral: {
    view: "front",
    body: front({
      elbowL: [96, 64],
      wristL: [58, 68],
      elbowR: [224, 64],
      wristR: [262, 68],
    }),
    ghost: front({
      elbowL: [124, 92],
      wristL: [116, 132],
      elbowR: [196, 92],
      wristR: [204, 132],
    }),
    gear: [{ kind: "dumbbell", hand: "both" }],
    motion: [
      { type: "arrow", from: [116, 132], to: [52, 68] },
      { type: "arrow", from: [204, 132], to: [268, 68] },
    ],
  },
  pulldown: {
    view: "front",
    body: front({
      hip: [160, 132],
      elbowL: [118, 78],
      wristL: [142, 96],
      elbowR: [202, 78],
      wristR: [178, 96],
      kneeL: [124, 156],
      ankleL: [112, 184],
      kneeR: [196, 156],
      ankleR: [208, 184],
    }),
    ghost: front({
      hip: [160, 132],
      elbowL: [146, 42],
      wristL: [152, 24],
      elbowR: [174, 42],
      wristR: [168, 24],
      kneeL: [124, 156],
      ankleL: [112, 184],
      kneeR: [196, 156],
      ankleR: [208, 184],
    }),
    gear: [
      { kind: "seat", at: [160, 138] },
      { kind: "barbell", hand: "both" },
      { kind: "cable", anchor: [160, 12], hand: "both" },
    ],
    motion: [{ type: "arrow", from: [160, 24], to: [160, 96] }],
  },
  row: {
    view: "side",
    body: rowMain,
    ghost: { ...rowMain, elbow: [118, 124], wrist: [112, 156] },
    gear: [{ kind: "barbell", hand: "near" }],
    motion: [{ type: "arrow", from: [112, 156], to: [164, 110] }],
  },
  "cable-row": {
    view: "side",
    body: side({
      head: [78, 96],
      shoulder: [104, 112],
      hip: [150, 128],
      knee: [196, 120],
      ankle: [228, 142],
      elbow: [118, 124],
      wrist: [148, 120],
      kneeB: [188, 132],
      ankleB: [214, 156],
    }),
    ghost: side({
      head: [78, 96],
      shoulder: [104, 112],
      hip: [150, 128],
      knee: [196, 120],
      ankle: [228, 142],
      elbow: [150, 114],
      wrist: [196, 112],
      kneeB: [188, 132],
      ankleB: [214, 156],
    }),
    gear: [
      { kind: "seat", at: [132, 136] },
      { kind: "cable", anchor: [268, 112], hand: "near" },
    ],
    motion: [{ type: "arrow", from: [206, 104], to: [140, 112] }],
  },
  face: {
    view: "side",
    body: side({
      elbow: [112, 70],
      wrist: [138, 52],
    }),
    ghost: side({
      elbow: [118, 86],
      wrist: [86, 84],
    }),
    gear: [{ kind: "cable", anchor: [36, 78], hand: "near" }],
    motion: [{ type: "arrow", from: [78, 84], to: [142, 48] }],
  },
  curl: {
    view: "side",
    body: curlTop,
    ghost: side({ elbow: [124, 102], wrist: [116, 146] }),
    gear: [{ kind: "barbell", hand: "near" }],
    motion: [{ type: "arrow", from: [92, 146], to: [92, 64] }],
  },
  hammer: {
    view: "side",
    body: side({ elbow: [124, 102], wrist: [112, 70] }),
    ghost: side({ elbow: [124, 102], wrist: [118, 146] }),
    gear: [{ kind: "dumbbell", hand: "near", angle: 80 }],
    motion: [{ type: "arrow", from: [96, 146], to: [96, 66] }],
  },
  ohp: {
    view: "side",
    body: ohpTop,
    ghost: side({ elbow: [124, 78], wrist: [116, 92] }),
    gear: [{ kind: "dumbbell", hand: "near" }],
    motion: [{ type: "arrow", from: [96, 96], to: [96, 22] }],
  },
  rear: {
    view: "back",
    body: front({
      head: [160, 78],
      shoulderL: [136, 98],
      shoulderR: [184, 98],
      hip: [160, 150],
      elbowL: [96, 92],
      wristL: [58, 86],
      elbowR: [224, 92],
      wristR: [262, 86],
      kneeL: [148, 176],
      ankleL: [146, 198],
      kneeR: [172, 176],
      ankleR: [174, 198],
    }),
    ghost: front({
      head: [160, 78],
      shoulderL: [136, 98],
      shoulderR: [184, 98],
      hip: [160, 150],
      elbowL: [128, 122],
      wristL: [122, 152],
      elbowR: [192, 122],
      wristR: [198, 152],
      kneeL: [148, 176],
      ankleL: [146, 198],
      kneeR: [172, 176],
      ankleR: [174, 198],
    }),
    gear: [{ kind: "dumbbell", hand: "both" }],
    motion: [
      { type: "arrow", from: [122, 152], to: [52, 80] },
      { type: "arrow", from: [198, 152], to: [268, 80] },
    ],
  },
  overhead: {
    view: "side",
    body: overheadTop,
    ghost: { ...overheadTop, wrist: [164, 96] },
    gear: [{ kind: "dumbbell", hand: "near", angle: 90 }],
    motion: [{ type: "arrow", from: [176, 100], to: [168, 22] }],
  },
  kickback: {
    view: "side",
    body: kickMain,
    ghost: { ...kickMain, wrist: [154, 128] },
    gear: [{ kind: "dumbbell", hand: "near" }],
    motion: [{ type: "arrow", from: [154, 132], to: [214, 84] }],
  },
  "incline-curl": {
    view: "side",
    body: side({
      head: [168, 58],
      shoulder: [150, 80],
      hip: [176, 124],
      knee: [206, 148],
      ankle: [196, 184],
      elbow: [132, 102],
      wrist: [112, 74],
      kneeB: [214, 152],
      ankleB: [208, 184],
      face: "left",
    }),
    ghost: side({
      head: [168, 58],
      shoulder: [150, 80],
      hip: [176, 124],
      knee: [206, 148],
      ankle: [196, 184],
      elbow: [132, 102],
      wrist: [114, 142],
      kneeB: [214, 152],
      ankleB: [208, 184],
      face: "left",
    }),
    gear: [
      { kind: "pad", from: [112, 96], to: [196, 140] },
      { kind: "dumbbell", hand: "near", angle: 70 },
    ],
    motion: [{ type: "arrow", from: [96, 146], to: [96, 68] }],
  },
  rdl: {
    view: "side",
    body: rdlMain,
    ghost: side({
      elbow: [128, 118],
      wrist: [124, 142],
    }),
    gear: [{ kind: "barbell", hand: "near" }],
    motion: [{ type: "arrow", from: [124, 142], to: [168, 156] }],
  },
  lunge: {
    view: "side",
    body: side({
      head: [132, 40],
      shoulder: [138, 62],
      hip: [146, 112],
      knee: [108, 146],
      ankle: [100, 184],
      elbow: [126, 100],
      wrist: [120, 136],
      kneeB: [186, 150],
      ankleB: [214, 184],
    }),
    ghost: side({
      head: [150, 36],
      shoulder: [156, 58],
      hip: [158, 106],
      knee: [150, 146],
      ankle: [146, 184],
      elbow: [144, 96],
      wrist: [140, 130],
      kneeB: [172, 146],
      ankleB: [176, 184],
    }),
    gear: [{ kind: "dumbbell", hand: "near" }],
    motion: [{ type: "arrow", from: [146, 100], to: [146, 132] }],
  },
  "leg-curl": {
    view: "side",
    body: side({
      head: [58, 108],
      shoulder: [92, 112],
      hip: [164, 116],
      knee: [206, 108],
      ankle: [186, 68],
      elbow: [78, 124],
      wrist: [58, 136],
      kneeB: [214, 114],
      ankleB: [194, 74],
      face: "left",
    }),
    ghost: side({
      head: [58, 108],
      shoulder: [92, 112],
      hip: [164, 116],
      knee: [206, 116],
      ankle: [248, 124],
      elbow: [78, 124],
      wrist: [58, 136],
      kneeB: [214, 122],
      ankleB: [252, 130],
      face: "left",
    }),
    gear: [{ kind: "pad", from: [48, 122], to: [210, 122] }],
    motion: [{ type: "arrow", from: [252, 120], to: [184, 60] }],
  },
  calf: {
    view: "side",
    body: side({
      head: [140, 28],
      shoulder: [146, 50],
      hip: [148, 98],
      knee: [146, 136],
      ankle: [144, 168],
      elbow: [134, 86],
      wrist: [128, 116],
      kneeB: [160, 138],
      ankleB: [164, 170],
    }),
    ghost: side({
      head: [140, 46],
      shoulder: [146, 68],
      hip: [148, 116],
      knee: [146, 150],
      ankle: [144, 186],
      elbow: [134, 104],
      wrist: [128, 134],
      kneeB: [160, 152],
      ankleB: [164, 188],
    }),
    gear: [{ kind: "step", at: [112, 176], w: 70 }],
    motion: [{ type: "arrow", from: [188, 168], to: [188, 36] }],
  },
  press: {
    view: "side",
    body: side({
      head: [62, 96],
      shoulder: [90, 112],
      hip: [128, 136],
      knee: [176, 104],
      ankle: [214, 78],
      elbow: [104, 124],
      wrist: [118, 140],
      kneeB: [184, 112],
      ankleB: [220, 86],
      face: "left",
    }),
    ghost: side({
      head: [62, 96],
      shoulder: [90, 112],
      hip: [128, 136],
      knee: [158, 128],
      ankle: [186, 112],
      elbow: [104, 124],
      wrist: [118, 140],
      kneeB: [166, 136],
      ankleB: [192, 120],
      face: "left",
    }),
    gear: [
      { kind: "seat", at: [108, 144] },
      { kind: "platform", from: [196, 52], to: [236, 100] },
    ],
    motion: [{ type: "arrow", from: [176, 124], to: [230, 64] }],
  },
  bulgarian: {
    view: "side",
    body: side({
      head: [118, 42],
      shoulder: [126, 64],
      hip: [138, 114],
      knee: [100, 148],
      ankle: [92, 184],
      elbow: [116, 100],
      wrist: [110, 134],
      kneeB: [176, 118],
      ankleB: [198, 100],
    }),
    ghost: side({
      head: [118, 34],
      shoulder: [126, 56],
      hip: [132, 100],
      knee: [108, 140],
      ankle: [104, 184],
      elbow: [116, 90],
      wrist: [110, 122],
      kneeB: [168, 108],
      ankleB: [198, 100],
    }),
    gear: [
      { kind: "pad", from: [176, 104], to: [236, 104] },
      { kind: "dumbbell", hand: "near" },
    ],
    motion: [{ type: "arrow", from: [138, 96], to: [138, 128] }],
  },
  thrust: {
    view: "side",
    body: side({
      head: [62, 124],
      shoulder: [98, 128],
      hip: [168, 92],
      knee: [206, 112],
      ankle: [214, 168],
      elbow: [130, 112],
      wrist: [160, 90],
      kneeB: [214, 118],
      ankleB: [226, 172],
      face: "up",
    }),
    ghost: side({
      head: [62, 140],
      shoulder: [98, 144],
      hip: [168, 140],
      knee: [206, 128],
      ankle: [214, 176],
      elbow: [130, 140],
      wrist: [160, 138],
      kneeB: [214, 134],
      ankleB: [226, 180],
      face: "up",
    }),
    gear: [
      { kind: "pad", from: [48, 136], to: [120, 136] },
      { kind: "barbell", hand: "near" },
    ],
    motion: [{ type: "arrow", from: [168, 148], to: [168, 78] }],
  },
  "press-high": {
    view: "side",
    body: side({
      head: [58, 108],
      shoulder: [86, 122],
      hip: [124, 146],
      knee: [170, 112],
      ankle: [214, 62],
      elbow: [100, 136],
      wrist: [112, 152],
      kneeB: [178, 120],
      ankleB: [220, 70],
      face: "left",
    }),
    ghost: side({
      head: [58, 108],
      shoulder: [86, 122],
      hip: [124, 146],
      knee: [156, 138],
      ankle: [186, 100],
      elbow: [100, 136],
      wrist: [112, 152],
      kneeB: [164, 144],
      ankleB: [194, 108],
      face: "left",
    }),
    gear: [
      { kind: "seat", at: [104, 154] },
      { kind: "platform", from: [196, 36], to: [240, 112] },
    ],
    motion: [{ type: "arrow", from: [170, 136], to: [228, 48] }],
  },
  "calf-seat": {
    view: "side",
    body: side({
      head: [78, 72],
      shoulder: [100, 90],
      hip: [136, 124],
      knee: [186, 120],
      ankle: [196, 148],
      elbow: [118, 108],
      wrist: [168, 112],
      kneeB: [192, 126],
      ankleB: [202, 154],
      face: "left",
    }),
    ghost: side({
      head: [86, 84],
      shoulder: [108, 102],
      hip: [140, 132],
      knee: [186, 128],
      ankle: [196, 172],
      elbow: [124, 118],
      wrist: [170, 124],
      kneeB: [192, 134],
      ankleB: [202, 178],
      face: "left",
    }),
    gear: [
      { kind: "seat", at: [118, 132] },
      { kind: "barbell", hand: "near" },
    ],
    motion: [{ type: "arrow", from: [214, 176], to: [214, 140] }],
  },
  deadbug: {
    view: "side",
    body: side({
      head: [70, 132],
      shoulder: [104, 136],
      hip: [176, 140],
      knee: [160, 96],
      ankle: [150, 62],
      elbow: [128, 112],
      wrist: [150, 88],
      elbowB: [90, 120],
      wristB: [62, 108],
      kneeB: [210, 132],
      ankleB: [252, 128],
      face: "up",
    }),
    ghost: side({
      head: [70, 132],
      shoulder: [104, 136],
      hip: [176, 140],
      knee: [168, 96],
      ankle: [160, 62],
      elbow: [120, 104],
      wrist: [112, 72],
      elbowB: [96, 112],
      wristB: [84, 84],
      kneeB: [196, 100],
      ankleB: [204, 66],
      face: "up",
    }),
    motion: [
      { type: "arrow", from: [112, 72], to: [52, 112] },
      { type: "arrow", from: [204, 66], to: [258, 128] },
    ],
  },
  plank: {
    view: "side",
    body: plankBody,
    gear: [],
    motion: [{ type: "guide", from: [48, 104], to: [270, 124] }],
  },
  crunch: {
    view: "side",
    body: side({
      head: [108, 96],
      shoulder: [132, 112],
      hip: [186, 136],
      knee: [210, 104],
      ankle: [198, 74],
      elbow: [118, 100],
      wrist: [100, 86],
      kneeB: [220, 112],
      ankleB: [208, 80],
      face: "up",
    }),
    ghost: side({
      head: [78, 132],
      shoulder: [112, 136],
      hip: [186, 140],
      knee: [210, 108],
      ankle: [198, 78],
      elbow: [96, 128],
      wrist: [78, 116],
      kneeB: [220, 116],
      ankleB: [208, 84],
      face: "up",
    }),
    motion: [{ type: "arrow", from: [72, 136], to: [112, 88] }],
  },
  pallof: {
    view: "side",
    body: side({ elbow: [156, 92], wrist: [204, 90] }),
    ghost: side({ elbow: [140, 96], wrist: [152, 98] }),
    gear: [{ kind: "cable", anchor: [28, 96], hand: "near" }],
    motion: [{ type: "arrow", from: [152, 108], to: [214, 82] }],
  },
  "leg-raise": {
    view: "side",
    body: side({
      head: [58, 132],
      shoulder: [92, 136],
      hip: [164, 140],
      knee: [176, 96],
      ankle: [184, 58],
      elbow: [110, 148],
      wrist: [132, 156],
      kneeB: [184, 100],
      ankleB: [192, 62],
      face: "up",
    }),
    ghost: side({
      head: [58, 132],
      shoulder: [92, 136],
      hip: [164, 140],
      knee: [200, 136],
      ankle: [244, 140],
      elbow: [110, 148],
      wrist: [132, 156],
      kneeB: [208, 144],
      ankleB: [250, 148],
      face: "up",
    }),
    motion: [{ type: "arrow", from: [248, 144], to: [196, 52] }],
  },
  "side-plank": {
    view: "side",
    body: sidePlankUp,
    motion: [{ type: "arrow", from: [168, 132], to: [168, 86] }],
  },
  farmer: {
    view: "front",
    body: front({
      wristL: [108, 142],
      wristR: [212, 142],
      elbowL: [120, 104],
      elbowR: [200, 104],
      kneeL: [132, 150],
      ankleL: [118, 186],
      kneeR: [184, 146],
      ankleR: [196, 186],
    }),
    gear: [{ kind: "dumbbell", hand: "both" }],
    motion: [{ type: "arrow", from: [40, 120], to: [86, 120] }],
  },
  "plank-tap": {
    view: "side",
    body: side({
      head: [64, 78],
      shoulder: [104, 88],
      hip: [176, 92],
      knee: [220, 94],
      ankle: [262, 96],
      elbow: [104, 118],
      wrist: [104, 156],
      elbowB: [118, 74],
      wristB: [108, 60],
      kneeB: [226, 100],
      ankleB: [266, 102],
      face: "left",
    }),
    ghost: side({
      head: [64, 78],
      shoulder: [104, 88],
      hip: [176, 92],
      knee: [220, 94],
      ankle: [262, 96],
      elbow: [104, 118],
      wrist: [104, 156],
      elbowB: [150, 120],
      wristB: [168, 156],
      kneeB: [226, 100],
      ankleB: [266, 102],
      face: "left",
    }),
    motion: [{ type: "arrow", from: [176, 156], to: [112, 52] }],
  },
  twist: {
    view: "front",
    body: front({
      hip: [160, 132],
      elbowL: [176, 96],
      wristL: [196, 112],
      elbowR: [188, 108],
      wristR: [208, 124],
      kneeL: [132, 160],
      ankleL: [120, 186],
      kneeR: [188, 160],
      ankleR: [200, 186],
    }),
    ghost: front({
      hip: [160, 132],
      elbowL: [132, 108],
      wristL: [112, 124],
      elbowR: [144, 96],
      wristR: [124, 112],
      kneeL: [132, 160],
      ankleL: [120, 186],
      kneeR: [188, 160],
      ankleR: [200, 186],
    }),
    gear: [
      { kind: "seat", at: [160, 140] },
      { kind: "disc" },
    ],
    motion: [{ type: "arrow", from: [112, 118], to: [210, 118] }],
  },
  climber: {
    view: "side",
    body: side({
      head: [62, 82],
      shoulder: [100, 92],
      hip: [176, 98],
      knee: [128, 112],
      ankle: [116, 132],
      elbow: [100, 122],
      wrist: [100, 160],
      kneeB: [214, 104],
      ankleB: [256, 110],
      face: "left",
    }),
    ghost: side({
      head: [62, 82],
      shoulder: [100, 92],
      hip: [176, 98],
      knee: [210, 104],
      ankle: [250, 110],
      elbow: [100, 122],
      wrist: [100, 160],
      kneeB: [214, 108],
      ankleB: [256, 116],
      face: "left",
    }),
    motion: [{ type: "arrow", from: [230, 112], to: [120, 108] }],
  },
  "side-hip": {
    view: "side",
    body: sidePlankUp,
    ghost: {
      ...sidePlankUp,
      hip: [168, 132],
      knee: [214, 128],
      ankle: [256, 132],
    },
    motion: [{ type: "arrow", from: [188, 136], to: [188, 86] }],
  },
  abwheel: {
    view: "side",
    body: side({
      head: [214, 86],
      shoulder: [184, 100],
      hip: [112, 142],
      knee: [108, 168],
      ankle: [78, 176],
      elbow: [220, 108],
      wrist: [252, 114],
      kneeB: [118, 170],
      ankleB: [88, 178],
      face: "left",
    }),
    ghost: side({
      head: [132, 62],
      shoulder: [138, 84],
      hip: [140, 132],
      knee: [136, 164],
      ankle: [112, 176],
      elbow: [156, 108],
      wrist: [176, 124],
      kneeB: [148, 166],
      ankleB: [124, 178],
      face: "left",
    }),
    gear: [{ kind: "wheel", hand: "near" }],
    motion: [{ type: "arrow", from: [184, 124], to: [262, 108] }],
  },
  breathe: {
    view: "side",
    body: side({
      head: [70, 124],
      shoulder: [104, 128],
      hip: [180, 134],
      knee: [214, 112],
      ankle: [206, 82],
      elbow: [140, 116],
      wrist: [156, 128],
      kneeB: [222, 118],
      ankleB: [214, 88],
      face: "up",
    }),
    motion: [
      { type: "arrow", from: [156, 150], to: [156, 112] },
      { type: "arrow", from: [176, 112], to: [176, 150] },
    ],
  },
  walk: {
    view: "side",
    body: side({
      head: [132, 40],
      shoulder: [140, 62],
      hip: [146, 112],
      knee: [112, 146],
      ankle: [96, 184],
      elbow: [118, 90],
      wrist: [104, 112],
      elbowB: [164, 84],
      wristB: [180, 104],
      kneeB: [176, 142],
      ankleB: [204, 184],
    }),
    motion: [{ type: "arrow", from: [214, 120], to: [268, 120] }],
  },
  bridge: {
    view: "side",
    body: side({
      head: [70, 128],
      shoulder: [104, 132],
      hip: [170, 96],
      knee: [210, 116],
      ankle: [218, 168],
      elbow: [120, 140],
      wrist: [146, 148],
      kneeB: [218, 122],
      ankleB: [228, 172],
      face: "up",
    }),
    ghost: side({
      head: [70, 146],
      shoulder: [104, 150],
      hip: [170, 148],
      knee: [210, 132],
      ankle: [218, 176],
      elbow: [120, 156],
      wrist: [146, 162],
      kneeB: [218, 138],
      ankleB: [228, 180],
      face: "up",
    }),
    motion: [{ type: "arrow", from: [170, 156], to: [170, 84] }],
  },
  band: {
    view: "front",
    body: front({
      elbowL: [112, 78],
      wristL: [72, 84],
      elbowR: [208, 78],
      wristR: [248, 84],
    }),
    ghost: front({
      elbowL: [146, 86],
      wristL: [152, 100],
      elbowR: [174, 86],
      wristR: [168, 100],
    }),
    gear: [{ kind: "band" }],
    motion: [
      { type: "arrow", from: [152, 100], to: [64, 84] },
      { type: "arrow", from: [168, 100], to: [256, 84] },
    ],
  },
};
