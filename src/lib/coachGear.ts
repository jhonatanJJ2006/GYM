import {
  Box3,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  TorusGeometry,
  Vector3,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Layout } from "../data/figureMotions.ts";
import type { PoseId } from "../data/poses.ts";

/** Piezas CC0 (3dassets.dev, Gym and Fitness Studio). El resto se arma con geometría. */
const GEAR_URL = `${import.meta.env.BASE_URL}models/gear`;

export type GearKind =
  | "barbell"
  | "dumbbell"
  | "bench"
  | "incline"
  | "cable"
  | "bike"
  | "press"
  | "pulldown"
  | "mat"
  | "treadmill"
  | "plyo"
  | "band"
  | "dip"
  | "wheel";

const POSE_GEAR: Record<PoseId, GearKind[]> = {
  bike: ["bike"],
  squat: ["barbell"],
  bench: ["bench", "barbell"],
  incline: ["incline", "barbell"],
  fly: ["bench", "dumbbell"],
  dip: ["dip"],
  pushdown: ["cable"],
  lateral: ["dumbbell"],
  pulldown: ["pulldown"],
  row: ["barbell"],
  "cable-row": ["cable"],
  face: ["cable"],
  curl: ["barbell"],
  hammer: ["dumbbell"],
  ohp: ["dumbbell"],
  rear: ["dumbbell"],
  overhead: ["dumbbell"],
  kickback: ["dumbbell"],
  "incline-curl": ["incline", "dumbbell"],
  rdl: ["barbell"],
  lunge: ["dumbbell"],
  "leg-curl": ["bench"],
  calf: ["plyo"],
  press: ["press"],
  bulgarian: ["bench", "dumbbell"],
  thrust: ["mat", "barbell"],
  "press-high": ["press"],
  "calf-seat": ["bench"],
  deadbug: ["mat"],
  plank: ["mat"],
  crunch: ["mat"],
  pallof: ["cable"],
  "leg-raise": ["mat"],
  "side-plank": ["mat"],
  farmer: ["dumbbell"],
  "plank-tap": ["mat"],
  twist: ["mat"],
  climber: ["mat"],
  "side-hip": ["mat"],
  abwheel: ["mat", "wheel"],
  breathe: ["mat"],
  walk: ["treadmill"],
  bridge: ["mat"],
  band: ["band"],
  circles: ["mat"],
};

const FILES: Record<string, string> = {
  barbell: "barbell.glb",
  dumbbell: "dumbbell.glb",
  bench: "bench.glb",
  incline: "incline.glb",
  cable: "cable.glb",
  bike: "bike.glb",
  press: "legpress.glb",
  pulldown: "pulldown.glb",
  mat: "mat.glb",
  treadmill: "treadmill.glb",
  plyo: "plyo.glb",
};

export type GearAnchors = {
  pose: PoseId;
  layout: Layout;
  hips: Vector3;
  head: Vector3;
  shoulder: Vector3;
  handL: Vector3;
  handR: Vector3;
  footL: Vector3;
  footR: Vector3;
  right: Vector3;
  up: Vector3;
  forward: Vector3;
};

export type GearKit = {
  group: Group;
  place: (anchors: GearAnchors) => void;
  dispose: () => void;
};

const metal = new MeshStandardMaterial({ color: 0xb7bdc6, metalness: 0.72, roughness: 0.32 });
const rubber = new MeshStandardMaterial({ color: 0x22262c, metalness: 0.05, roughness: 0.78 });
const bandMat = new MeshStandardMaterial({ color: 0xc4493d, roughness: 0.55 });

const qTmp = new Quaternion();
const vTmp = new Vector3();
const vTmp2 = new Vector3();
const flat = new Vector3();

function yawTo(zAxis: Vector3): Quaternion {
  flat.set(zAxis.x, 0, zAxis.z);
  if (flat.lengthSq() < 1e-6) flat.set(0, 0, 1);
  flat.normalize();
  return qTmp.setFromUnitVectors(new Vector3(0, 0, 1), flat);
}

/** Deja el modelo en pie y lleva un punto local (metros, antes de escalar) a `world`. */
function placeUpright(obj: Object3D, anchor: Vector3, world: Vector3, face: Vector3, scale: number) {
  obj.quaternion.copy(yawTo(face));
  obj.scale.setScalar(scale);
  vTmp.copy(anchor).multiplyScalar(scale).applyQuaternion(obj.quaternion);
  obj.position.copy(world).sub(vTmp);
  obj.visible = true;
}

function placeAlong(obj: Object3D, point: Vector3, axis: Vector3, localAxis: Vector3, localCenter: Vector3, scale: number) {
  const dir = vTmp2.copy(axis);
  if (dir.lengthSq() < 1e-6) dir.set(1, 0, 0);
  dir.normalize();
  obj.quaternion.setFromUnitVectors(localAxis, dir);
  obj.scale.setScalar(scale);
  vTmp.copy(localCenter).multiplyScalar(scale).applyQuaternion(obj.quaternion);
  obj.position.copy(point).sub(vTmp);
  obj.visible = true;
}

function span(mesh: Mesh, a: Vector3, b: Vector3) {
  vTmp.copy(b).sub(a);
  const len = Math.max(0.05, vTmp.length());
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), vTmp.multiplyScalar(1 / len));
  mesh.scale.set(1, len, 1);
  mesh.visible = true;
}

const STRAND_NAME = /cable|wire|rope/i;

/** Oculta cables horneados en el GLB (por nombre o por caja muy delgada); el cable real lo dibuja placePulley. */
function hideBakedStrands(root: Object3D) {
  root.updateMatrixWorld(true);
  const meshes: Mesh[] = [];
  root.traverse((child) => {
    if (child instanceof Mesh) meshes.push(child);
  });
  const named = meshes.filter((m) => STRAND_NAME.test(m.name) || STRAND_NAME.test(m.geometry.name ?? ""));
  const size = new Vector3();
  const thin = meshes.filter((m) => {
    if (named.includes(m)) return false;
    new Box3().setFromObject(m).getSize(size);
    const dims = [size.x, size.y, size.z].sort((x, y) => x - y);
    return dims[2] > 0.4 && dims[0] < 0.04 && dims[1] < 0.04;
  });
  const hide = [...named, ...thin];
  if (hide.length >= meshes.length) return;
  for (const mesh of hide) mesh.visible = false;
}

/** Baja o sube el modelo para que la base de su caja (solo mallas visibles) quede en `floorY`. */
function sitOnFloor(obj: Object3D, floorY: number) {
  obj.updateMatrixWorld(true);
  const box = new Box3();
  const part = new Box3();
  obj.traverse((child) => {
    if (!(child instanceof Mesh) || !child.visible) return;
    if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
    part.copy(child.geometry.boundingBox!).applyMatrix4(child.matrixWorld);
    box.union(part);
  });
  if (box.isEmpty()) return;
  if (obj.parent) box.applyMatrix4(obj.parent.matrixWorld.clone().invert());
  obj.position.y += floorY - box.min.y;
}

function prepare(root: Object3D) {
  root.traverse((child) => {
    if (child instanceof Mesh) child.frustumCulled = false;
  });
  root.visible = false;
  return root;
}

export async function loadGear(): Promise<GearKit> {
  const loader = new GLTFLoader();
  const models = new Map<string, Object3D>();
  await Promise.all(
    Object.entries(FILES).map(async ([id, file]) => {
      const gltf = await loader.loadAsync(`${GEAR_URL}/${file}`);
      if (id === "cable" || id === "pulldown") hideBakedStrands(gltf.scene);
      models.set(id, prepare(gltf.scene));
    }),
  );

  const group = new Group();
  for (const model of models.values()) group.add(model);
  const dumbbellL = models.get("dumbbell")?.clone(true) ?? new Group();
  dumbbellL.name = "dumbbell-left";
  dumbbellL.visible = false;
  group.add(dumbbellL);

  const grip = new Mesh(new CylinderGeometry(0.02, 0.02, 1, 10), metal);
  const cableLine = new Mesh(new CylinderGeometry(0.008, 0.008, 1, 6), metal);
  const pulleyPost = new Mesh(new CylinderGeometry(0.016, 0.016, 1, 8), metal);
  const pulley = new Group();
  pulley.name = "pulley";
  const pulleyWheel = new Mesh(new TorusGeometry(0.05, 0.012, 10, 18), metal);
  pulleyWheel.name = "pulley-wheel";
  pulley.add(pulleyWheel);
  const band = new Mesh(new CylinderGeometry(0.012, 0.012, 1, 8), bandMat);
  const wheel = new Mesh(new TorusGeometry(0.11, 0.028, 8, 18), rubber);
  const dip = buildDip();
  const smith = buildSmith();
  for (const extra of [grip, cableLine, pulleyPost, pulley, band, wheel, dip, smith]) {
    extra.visible = false;
    extra.traverse((child) => {
      if (child instanceof Mesh) child.frustumCulled = false;
    });
    group.add(extra);
  }

  const sources = [...models.values(), grip, cableLine, pulleyPost, pulley, band, wheel, dip, smith];

  function hideAll() {
    for (const model of models.values()) model.visible = false;
    grip.visible = false;
    cableLine.visible = false;
    pulley.visible = false;
    pulleyPost.visible = false;
    band.visible = false;
    wheel.visible = false;
    dip.visible = false;
    smith.visible = false;
    dumbbellL.visible = false;
  }

  function place(a: GearAnchors) {
    hideAll();
    const kinds = POSE_GEAR[a.pose];
    const handMid = vHand(a);
    const footMid = vFoot(a);
    const lying = a.layout === "supine" || a.layout === "prone";
    const bodyAxis = a.head.clone().sub(a.hips);
    const face = a.forward.clone();

    if (kinds.includes("barbell")) {
      const bar = models.get("barbell");
      if (bar) {
        const onHips = a.pose === "thrust";
        const point = onHips ? a.hips.clone().addScaledVector(a.up, 0.08) : handMid;
        placeAlong(bar, point, a.right, new Vector3(1, 0, 0), new Vector3(0, 0.225, 0), 0.58);
      }
    }
    if (kinds.includes("dumbbell")) {
      const bell = models.get("dumbbell");
      if (bell) {
        const axis = new Vector3(1, 0, 0);
        const center = new Vector3(0, 0.064, 0);
        placeAlong(bell, a.handR, a.right, axis, center, 0.42);
        placeAlong(dumbbellL, a.handL, a.right, axis, center, 0.42);
      }
    }
    if (kinds.includes("bench") || kinds.includes("incline")) {
      const bench = models.get(kinds.includes("incline") ? "incline" : "bench");
      if (bench) {
        if (lying) {
          const mid = a.hips.clone().lerp(a.shoulder, 0.45);
          placeUpright(bench, new Vector3(0, 0.4, 0), mid, bodyAxis, 0.95);
        } else if (a.pose === "bulgarian") {
          const rear = a.footR.clone().addScaledVector(a.forward, -0.05);
          placeUpright(bench, new Vector3(0, 0.43, 0.15), rear, face, 0.85);
        } else {
          placeUpright(bench, new Vector3(0, 0.43, 0), a.hips, face, 0.9);
        }
      }
    }
    if (kinds.includes("bike")) {
      const bike = models.get("bike");
      if (bike) placeUpright(bike, new Vector3(0, 0.96, -0.02), a.hips, face.clone().negate(), 0.9);
    }
    if (kinds.includes("pulldown")) {
      const machine = models.get("pulldown");
      if (machine) placeUpright(machine, new Vector3(0, 0.5, 0.34), a.hips, face.clone().negate(), 0.7);
      placeAlong(grip, handMid, a.right, new Vector3(0, 1, 0), new Vector3(0, 0, 0), 0.62);
      const high = a.hips.clone().addScaledVector(face, 0.85).addScaledVector(a.up, 1.05);
      const topHand = a.handL.clone().dot(a.up) > a.handR.clone().dot(a.up) ? a.handL : a.handR;
      placePulley(pulley, pulleyPost, cableLine, high, topHand, a);
    }
    if (kinds.includes("press")) {
      const machine = models.get("press");
      if (machine) {
        const toFeet = footMid.clone().sub(a.hips);
        placeUpright(machine, new Vector3(0, 0.68, 0.45), footMid, toFeet, 0.82);
      }
    }
    if (kinds.includes("cable")) {
      const machine = models.get("cable");
      if (machine) {
        const spot = a.hips.clone().addScaledVector(face, -0.2);
        placeUpright(machine, new Vector3(0, 0, 0), spot, face.clone().negate(), 0.48);
        sitOnFloor(machine, Math.min(a.footL.y, a.footR.y));
      }
      placeAlong(grip, handMid, a.right, new Vector3(0, 1, 0), new Vector3(0, 0, 0), 0.48);
      const highCable = a.pose === "pushdown" || a.pose === "face" || a.pose === "pallof";
      const origin = highCable
        ? a.hips.clone().addScaledVector(face, 0.85).addScaledVector(a.up, 1.05)
        : a.hips.clone().addScaledVector(face, 0.95).addScaledVector(a.up, 0.35);
      const singleArm = a.pose === "pushdown" || a.pose === "face" || a.pose === "pallof" || a.pose === "kickback";
      const end = singleArm && a.handR.distanceTo(a.hips) > a.handL.distanceTo(a.hips) ? a.handR : handMid;
      placePulley(pulley, pulleyPost, cableLine, origin, end, a);
    }
    if (kinds.includes("mat")) {
      const mat = models.get("mat");
      if (mat) {
        const floorY = Math.min(a.hips.y, a.head.y, a.footL.y, a.footR.y, a.handL.y, a.handR.y);
        const mid = a.hips.clone().lerp(a.head, 0.2);
        mid.y = floorY;
        placeUpright(mat, new Vector3(0, 0.01, 0), mid, lying ? bodyAxis : face, 1.05);
      }
    }
    if (kinds.includes("treadmill")) {
      const mill = models.get("treadmill");
      if (mill) placeUpright(mill, new Vector3(0, 0.2, 0.05), footMid, face.clone().negate(), 0.82);
    }
    if (kinds.includes("plyo")) {
      const box = models.get("plyo");
      if (box) placeUpright(box, new Vector3(0, 0.6, 0), footMid, face, 0.55);
    }
    if (kinds.includes("band")) span(band, a.handL, a.handR);
    if (kinds.includes("dip")) placeDip(dip, a);
    if (a.pose === "rdl") placeSmith(smith, a, handMid);
    if (kinds.includes("wheel")) {
      wheel.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), a.right.clone().normalize());
      wheel.position.copy(handMid);
      wheel.scale.setScalar(1);
      wheel.visible = true;
    }
  }

  return {
    group,
    place,
    dispose() {
      for (const source of sources) {
        source.traverse((child) => {
          if (!(child instanceof Mesh)) return;
          child.geometry.dispose();
        });
      }
      metal.dispose();
      rubber.dispose();
      bandMat.dispose();
    },
  };
}


/** El GLB de la polea no trae una rueda usable. Esta polea es un toroide; el cable sale de su borde y llega a la mano. */
function placePulley(pulley: Group, post: Mesh, cable: Mesh, origin: Vector3, hand: Vector3, a: GearAnchors) {
  const dir = hand.clone().sub(origin);
  if (dir.lengthSq() < 1e-6) dir.set(0, -1, 0);
  dir.normalize();
  let axis = new Vector3().crossVectors(dir, a.up);
  if (axis.lengthSq() < 1e-4) axis = new Vector3().crossVectors(dir, a.right);
  axis.normalize();
  pulley.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), axis);
  pulley.position.copy(origin);
  pulley.scale.setScalar(1);
  pulley.visible = true;
  const footY = Math.min(a.footL.y, a.footR.y, a.hips.y);
  const bottom = origin.clone();
  bottom.y = footY;
  if (origin.y - footY > 0.2) span(post, bottom, origin);
  else post.visible = false;
  const rim = origin.clone().addScaledVector(dir, 0.05);
  span(cable, rim, hand);
}

function vHand(a: GearAnchors): Vector3 {
  return a.handL.clone().add(a.handR).multiplyScalar(0.5);
}

function vFoot(a: GearAnchors): Vector3 {
  return a.footL.clone().add(a.footR).multiplyScalar(0.5);
}

function buildSmith(): Group {
  const root = new Group();
  const railGeo = new CylinderGeometry(0.018, 0.018, 1, 10);
  const footGeo = new CylinderGeometry(0.02, 0.02, 1, 8);
  for (const side of [-1, 1]) {
    const rail = new Mesh(railGeo, metal);
    rail.name = `smith-rail-${side}`;
    const foot = new Mesh(footGeo, metal);
    foot.name = `smith-foot-${side}`;
    root.add(rail, foot);
  }
  const base = new Mesh(footGeo, metal);
  base.name = "smith-base";
  root.add(base);
  return root;
}

function placeSmith(smith: Group, a: GearAnchors, handMid: Vector3) {
  const footY = Math.min(a.footL.y, a.footR.y, a.hips.y);
  const top = Math.max(a.head.y, handMid.y, a.shoulder.y) + 0.45;
  const across = a.right.clone().normalize();
  const reach = 0.62;
  for (const side of [-1, 1]) {
    const at = handMid.clone().addScaledVector(across, side * reach);
    const bottom = at.clone();
    bottom.y = footY;
    const up = at.clone();
    up.y = top;
    span(smith.getObjectByName(`smith-rail-${side}`) as Mesh, bottom, up);
    const foot = smith.getObjectByName(`smith-foot-${side}`) as Mesh;
    const back = bottom.clone().addScaledVector(a.forward, -0.28);
    span(foot, bottom, back);
  }
  const left = handMid.clone().addScaledVector(across, -reach);
  const right = handMid.clone().addScaledVector(across, reach);
  left.y = footY;
  right.y = footY;
  span(smith.getObjectByName("smith-base") as Mesh, left, right);
  smith.visible = true;
}

function buildDip(): Group {
  const root = new Group();
  const barGeo = new CylinderGeometry(0.028, 0.028, 1, 10);
  const postGeo = new CylinderGeometry(0.03, 0.03, 1, 8);
  for (const side of [-1, 1]) {
    const bar = new Mesh(barGeo, metal);
    bar.name = `dip-bar-${side}`;
    const postL = new Mesh(postGeo, metal);
    const postR = new Mesh(postGeo, metal);
    postL.name = `dip-post-a-${side}`;
    postR.name = `dip-post-b-${side}`;
    root.add(bar, postL, postR);
  }
  return root;
}

function placeDip(dip: Group, a: GearAnchors) {
  const footY = Math.min(a.footL.y, a.footR.y);
  for (const side of [-1, 1]) {
    const hand = side < 0 ? a.handL : a.handR;
    const bar = dip.getObjectByName(`dip-bar-${side}`) as Mesh;
    const across = a.right.clone().normalize();
    bar.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), across);
    bar.scale.set(1, 0.62, 1);
    bar.position.copy(hand);
    for (const [name, end] of [
      [`dip-post-a-${side}`, -0.22],
      [`dip-post-b-${side}`, 0.22],
    ] as const) {
      const post = dip.getObjectByName(name) as Mesh;
      const top = hand.clone().addScaledVector(across, end);
      const bottom = top.clone();
      bottom.y = footY;
      span(post, bottom, top);
    }
  }
  dip.visible = true;
}
