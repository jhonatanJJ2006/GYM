import {
  Bone,
  Box3,
  CanvasTexture,
  CircleGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Quaternion,
  Scene,
  SkinnedMesh,
  Skeleton,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Material,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Joints, Layout } from "../data/figureMotions.ts";
import type { PoseId } from "../data/poses.ts";
import { loadGear, type GearAnchors, type GearKit } from "./coachGear.ts";
import { motionFor, sampleMotion } from "./coachSample.ts";

const DEG = Math.PI / 180;
const MODEL_URL = `${import.meta.env.BASE_URL}models/coach.glb`;
const RED_SHIRT = "Oliver";
const RED_MESH = "Oliver_body_Oliver_0";

const BONE = {
  hips: "Hips_01",
  spine: "Spine_012",
  chest: "Spine2_014",
  head: "Head_040",
  shoulderL: "LeftShoulder_015",
  shoulderR: "RightShoulder_042",
  armL: "LeftArm_016",
  foreL: "LeftForeArm_017",
  handL: "LeftHand_018",
  armR: "RightArm_043",
  foreR: "RightForeArm_044",
  handR: "RightHand_045",
  thighL: "LeftUpLeg_02",
  kneeL: "LeftLeg_03",
  footL: "LeftFoot_04",
  thighR: "RightUpLeg_07",
  kneeR: "RightLeg_08",
  footR: "RightFoot_09",
} as const;

type View = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  pose: PoseId;
  reduced: boolean;
  hero: boolean;
  cssW: number;
  cssH: number;
  visible: boolean;
};

type Rig = {
  stage: Group;
  poseRoot: Group;
  skeleton: Skeleton;
  bones: Record<keyof typeof BONE, Bone>;
  rests: Map<Bone, Quaternion>;
  localRight: Vector3;
  localUp: Vector3;
  localForward: Vector3;
  gear: GearKit;
  shadow: Mesh;
};

let renderer: WebGLRenderer | null = null;
let scene: Scene | null = null;
let camera: PerspectiveCamera | null = null;
let rig: Rig | null = null;
let loadPromise: Promise<void> | null = null;
let failed = false;
const views = new Set<View>();
let raf = 0;
let dirty = true;
let users = 0;
let disposeTimer = 0;

const worldUp = new Vector3();
const worldForward = new Vector3();
const worldRight = new Vector3();
const leanedUp = new Vector3();
const leanedForward = new Vector3();
const dir = new Vector3();
const parentQ = new Quaternion();
const deltaQ = new Quaternion();
const leanQ = new Quaternion();
const basisQ = new Quaternion();
const restDir = new Vector3();
const desiredLocal = new Vector3();
const rightLocal = new Vector3();
const anchor = {
  hips: new Vector3(),
  head: new Vector3(),
  shoulder: new Vector3(),
  handL: new Vector3(),
  handR: new Vector3(),
  footL: new Vector3(),
  footR: new Vector3(),
};
const scratch = new Vector3();
const gearBox = new Box3();
const meshBox = new Box3();
const flat = new Vector3();

function materialsOf(mesh: Mesh): Material[] {
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material];
}

function disposeMaterial(material: Material) {
  const mapped = material as Material & { map?: { dispose: () => void } | null };
  mapped.map?.dispose();
  material.dispose();
}

function disposeObject(object: Object3D) {
  const materials = new Set<Material>();
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.geometry.dispose();
    for (const material of materialsOf(child)) materials.add(material);
  });
  for (const material of materials) disposeMaterial(material);
}

function boneNamed(root: Object3D, name: string): Bone {
  const found = root.getObjectByName(name);
  if (!(found instanceof Bone)) throw new Error(`El muñeco no trae el hueso ${name}`);
  return found;
}

function keepSubtree(seed: Object3D, keep: Set<Object3D>) {
  keep.add(seed);
  for (const child of seed.children) keepSubtree(child, keep);
}

function withAncestors(obj: Object3D, keep: Set<Object3D>) {
  let cur: Object3D | null = obj;
  while (cur) {
    keep.add(cur);
    cur = cur.parent;
  }
}

function pruneExcept(root: Object3D, keep: Set<Object3D>) {
  const removed: Object3D[] = [];
  const walk = (obj: Object3D) => {
    for (const child of [...obj.children]) {
      if (keep.has(child)) walk(child);
      else {
        obj.remove(child);
        removed.push(child);
      }
    }
  };
  walk(root);
  for (const obj of removed) disposeObject(obj);
}

function shadowTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Sin lienzo para la sombra");
  const gradient = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
  gradient.addColorStop(0, "rgba(0,0,0,0.45)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function captureBasis(root: Object3D, bones: Rig["bones"]) {
  const left = new Vector3();
  const right = new Vector3();
  const hip = new Vector3();
  const chest = new Vector3();
  bones.thighL.getWorldPosition(left);
  bones.thighR.getWorldPosition(right);
  bones.hips.getWorldPosition(hip);
  bones.chest.getWorldPosition(chest);
  const across = right.sub(left).normalize();
  const up = chest.sub(hip).normalize();
  const forward = new Vector3().crossVectors(across, up).normalize();
  across.crossVectors(up, forward).normalize();
  root.getWorldQuaternion(basisQ).invert();
  return {
    right: across.applyQuaternion(basisQ),
    up: up.applyQuaternion(basisQ.clone()),
    forward: forward.applyQuaternion(basisQ),
  };
}

function buildRig(root: Object3D, gear: GearKit): Rig {
  const oliver = root.getObjectByName(RED_SHIRT);
  const body = root.getObjectByName(RED_MESH);
  if (!oliver) throw new Error("El GLB no trae el muñeco Oliver (camisa roja)");
  if (!(body instanceof SkinnedMesh)) throw new Error("El GLB no trae la malla de la camisa roja");

  const keep = new Set<Object3D>();
  withAncestors(oliver, keep);
  withAncestors(body, keep);
  keepSubtree(oliver, keep);
  keepSubtree(body, keep);
  pruneExcept(root, keep);

  body.frustumCulled = false;
  const bones = {} as Rig["bones"];
  for (const key of Object.keys(BONE) as (keyof typeof BONE)[]) {
    bones[key] = boneNamed(oliver, BONE[key]);
  }
  const rests = new Map<Bone, Quaternion>();
  for (const bone of body.skeleton.bones) rests.set(bone, bone.quaternion.clone());

  const poseRoot = new Group();
  poseRoot.add(root);
  poseRoot.updateMatrixWorld(true);
  const basis = captureBasis(poseRoot, bones);
  // La cruz de caderas apunta a la espalda: la cámara y los brazos miran al pecho.
  basis.forward.negate();
  const head = bones.head.getWorldPosition(new Vector3());
  const foot = bones.footL.getWorldPosition(new Vector3());
  const height = Math.abs(head.y - foot.y);
  if (height > 0.4 && (height < 1.05 || height > 2.1)) poseRoot.scale.setScalar(1.65 / height);

  const stage = new Group();
  const shadow = new Mesh(
    new CircleGeometry(0.46, 28),
    new MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.008;
  stage.add(poseRoot, gear.group, shadow);

  return {
    stage,
    poseRoot,
    skeleton: body.skeleton,
    bones,
    rests,
    localRight: basis.right,
    localUp: basis.up,
    localForward: basis.forward,
    gear,
    shadow,
  };
}

function layoutAngle(layout: Layout): number {
  // El eje lateral del muñeco apunta al otro lado del eje mundo, así que el
  // signo queda al revés de la regla de la mano derecha: +90 deja el pecho arriba.
  if (layout === "supine") return Math.PI / 2;
  if (layout === "prone") return -Math.PI / 2;
  return 0;
}

function limbDir(up: Vector3, forward: Vector3, angleDeg: number, out: Vector3) {
  const a = angleDeg * DEG;
  out.copy(up).multiplyScalar(-Math.cos(a));
  out.addScaledVector(forward, -Math.sin(a));
  if (out.lengthSq() < 1e-8) out.copy(up).multiplyScalar(-1);
  return out.normalize();
}

function aim(bone: Bone, worldDir: Vector3, rests: Map<Bone, Quaternion>) {
  const parent = bone.parent;
  const rest = rests.get(bone);
  if (!parent || !rest) return;
  parent.updateWorldMatrix(true, false);
  parent.getWorldQuaternion(parentQ);
  desiredLocal.copy(worldDir).applyQuaternion(parentQ.invert());
  if (desiredLocal.lengthSq() < 1e-8) return;
  desiredLocal.normalize();
  restDir.set(0, 1, 0).applyQuaternion(rest).normalize();
  if (restDir.dot(desiredLocal) < -0.9995) deltaQ.setFromAxisAngle(restDir, Math.PI);
  else deltaQ.setFromUnitVectors(restDir, desiredLocal);
  bone.quaternion.copy(deltaQ).multiply(rest);
  bone.updateMatrixWorld(true);
}

function applyLean(spine: Bone, right: Vector3, leanDeg: number, rests: Map<Bone, Quaternion>) {
  const parent = spine.parent;
  const rest = rests.get(spine);
  if (!parent || !rest) return;
  parent.updateWorldMatrix(true, false);
  parent.getWorldQuaternion(parentQ);
  rightLocal.copy(right).applyQuaternion(parentQ.clone().invert());
  if (rightLocal.lengthSq() < 1e-8) return;
  rightLocal.normalize();
  leanQ.setFromAxisAngle(rightLocal, -leanDeg * DEG);
  spine.quaternion.copy(leanQ).multiply(rest);
  spine.updateMatrixWorld(true);
}

function worldBasis(root: Group, localRight: Vector3, localUp: Vector3, localForward: Vector3) {
  root.getWorldQuaternion(basisQ);
  worldRight.copy(localRight).applyQuaternion(basisQ);
  worldUp.copy(localUp).applyQuaternion(basisQ);
  worldForward.copy(localForward).applyQuaternion(basisQ);
}

function readAnchors(bones: Rig["bones"]): GearAnchors {
  bones.hips.getWorldPosition(anchor.hips);
  bones.head.getWorldPosition(anchor.head);
  bones.shoulderL.getWorldPosition(anchor.shoulder);
  bones.shoulderR.getWorldPosition(scratch);
  anchor.shoulder.add(scratch).multiplyScalar(0.5);
  bones.handL.getWorldPosition(anchor.handL);
  bones.handR.getWorldPosition(anchor.handR);
  bones.footL.getWorldPosition(anchor.footL);
  bones.footR.getWorldPosition(anchor.footR);
  return {
    pose: "squat",
    layout: "stand",
    hips: anchor.hips,
    head: anchor.head,
    shoulder: anchor.shoulder,
    handL: anchor.handL,
    handR: anchor.handR,
    footL: anchor.footL,
    footR: anchor.footR,
    right: worldRight,
    up: worldUp,
    forward: worldForward,
  };
}

function shown(obj: Object3D): boolean {
  let cur: Object3D | null = obj;
  while (cur) {
    if (!cur.visible) return false;
    cur = cur.parent;
  }
  return true;
}

function frameStage() {
  if (!rig) return;
  rig.stage.position.set(0, 0, 0);
  rig.stage.updateMatrixWorld(true);
  const points = [anchor.hips, anchor.head, anchor.handL, anchor.handR, anchor.footL, anchor.footR];
  let minY = Infinity;
  for (const point of points) minY = Math.min(minY, point.y);
  gearBox.makeEmpty();
  rig.gear.group.traverse((child) => {
    if (!(child instanceof Mesh) || child instanceof SkinnedMesh || !shown(child)) return;
    if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
    const bounds = child.geometry.boundingBox;
    if (!bounds) return;
    meshBox.copy(bounds).applyMatrix4(child.matrixWorld);
    gearBox.union(meshBox);
  });
  if (!gearBox.isEmpty()) minY = Math.min(minY, gearBox.min.y);
  if (!Number.isFinite(minY)) minY = 0;
  rig.stage.position.set(-anchor.hips.x, -minY, -anchor.hips.z);
}

function applyPose(joints: Joints, layout: Layout, pose: PoseId) {
  if (!rig) return;
  for (const [bone, rest] of rig.rests) bone.quaternion.copy(rest);
  rig.poseRoot.quaternion.setFromAxisAngle(rig.localRight, layoutAngle(layout));
  rig.poseRoot.position.set(joints.shift * 0.012, joints.lift * 0.008, 0);
  rig.poseRoot.updateMatrixWorld(true);
  worldBasis(rig.poseRoot, rig.localRight, rig.localUp, rig.localForward);
  applyLean(rig.bones.spine, worldRight, joints.lean, rig.rests);
  rig.poseRoot.updateMatrixWorld(true);
  worldBasis(rig.poseRoot, rig.localRight, rig.localUp, rig.localForward);

  aim(rig.bones.thighL, limbDir(worldUp, worldForward, joints.thighL, dir), rig.rests);
  aim(rig.bones.kneeL, limbDir(worldUp, worldForward, joints.thighL + joints.kneeL, dir), rig.rests);
  aim(rig.bones.thighR, limbDir(worldUp, worldForward, joints.thighR, dir), rig.rests);
  aim(rig.bones.kneeR, limbDir(worldUp, worldForward, joints.thighR + joints.kneeR, dir), rig.rests);
  aim(rig.bones.footL, limbDir(worldUp, worldForward, joints.footL, dir), rig.rests);
  aim(rig.bones.footR, limbDir(worldUp, worldForward, joints.footR, dir), rig.rests);

  leanQ.setFromAxisAngle(worldRight, -joints.lean * DEG);
  leanedUp.copy(worldUp).applyQuaternion(leanQ);
  leanedForward.copy(worldForward).applyQuaternion(leanQ);
  aim(rig.bones.armL, limbDir(leanedUp, leanedForward, joints.armL, dir), rig.rests);
  aim(rig.bones.foreL, limbDir(leanedUp, leanedForward, joints.armL + joints.elbL, dir), rig.rests);
  aim(rig.bones.armR, limbDir(leanedUp, leanedForward, joints.armR, dir), rig.rests);
  aim(rig.bones.foreR, limbDir(leanedUp, leanedForward, joints.armR + joints.elbR, dir), rig.rests);

  rig.skeleton.update();
  rig.poseRoot.updateMatrixWorld(true);
  const anchors = readAnchors(rig.bones);
  anchors.pose = pose;
  anchors.layout = layout;
  rig.gear.place(anchors);
  frameStage();
}

function frameCamera(layout: Layout) {
  if (!camera) return;
  flat.set(worldForward.x, 0, worldForward.z);
  if (flat.lengthSq() < 0.12) flat.set(worldRight.x, 0, worldRight.z);
  if (flat.lengthSq() < 1e-6) flat.set(0, 0, 1);
  flat.normalize();
  const side = scratch.set(worldRight.x, 0, worldRight.z);
  if (side.lengthSq() > 1e-4) flat.addScaledVector(side.normalize(), 0.42).normalize();
  const lying = layout === "supine" || layout === "prone";
  const dist = lying ? 3.45 : 3.2;
  camera.position.set(flat.x * dist, lying ? 1.65 : 1.2, flat.z * dist);
  camera.lookAt(0, lying ? 0.42 : 0.84, 0);
}

const atlas = document.createElement("canvas");
const atlasCtx = atlas.getContext("2d", { alpha: true });

function pixelSize(view: View): { w: number; h: number } | null {
  if (view.cssW < 2 || view.cssH < 2) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cap = view.hero ? 800 : 96;
  const w = Math.max(1, Math.round(view.cssW * dpr));
  const h = Math.max(1, Math.round(view.cssH * dpr));
  const scale = Math.min(1, cap / Math.max(w, h));
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)) };
}

function fitCanvas(view: View, w: number, h: number) {
  if (view.canvas.width !== w || view.canvas.height !== h) {
    view.canvas.width = w;
    view.canvas.height = h;
  }
}

function paintView(view: View, timeMs: number, w: number, h: number) {
  if (!renderer || !camera || !rig) return;
  const motion = motionFor(view.pose);
  applyPose(sampleMotion(motion, timeMs, view.reduced), motion.layout, view.pose);
  frameCamera(motion.layout);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.render(scene!, camera);
}

function renderHero(view: View, timeMs: number) {
  if (!renderer) return;
  const size = pixelSize(view);
  if (!size) return;
  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, size.w, size.h);
  if (renderer.domElement.width !== size.w || renderer.domElement.height !== size.h) {
    renderer.setSize(size.w, size.h, false);
  }
  paintView(view, timeMs, size.w, size.h);
  fitCanvas(view, size.w, size.h);
  view.ctx.clearRect(0, 0, size.w, size.h);
  view.ctx.drawImage(renderer.domElement, 0, 0, size.w, size.h);
}

function renderThumbs(thumbs: View[], timeMs: number) {
  if (!renderer || !atlasCtx || thumbs.length === 0) return;
  const cells: { sample: View; targets: View[]; w: number; h: number }[] = [];
  const index = new Map<string, number>();
  for (const view of thumbs) {
    const size = pixelSize(view);
    if (!size) continue;
    const key = `${view.pose}|${size.w}x${size.h}|${view.reduced ? "still" : "move"}`;
    const found = index.get(key);
    if (found === undefined) {
      index.set(key, cells.length);
      cells.push({ sample: view, targets: [view], w: size.w, h: size.h });
    } else {
      cells[found].targets.push(view);
    }
  }
  if (cells.length === 0) return;
  const w = cells[0].w;
  const h = cells[0].h;
  if (!cells.every((cell) => cell.w === w && cell.h === h)) {
    for (const cell of cells) {
      renderHero(cell.sample, timeMs);
      for (const target of cell.targets) {
        if (target === cell.sample) continue;
        fitCanvas(target, cell.w, cell.h);
        target.ctx.clearRect(0, 0, cell.w, cell.h);
        target.ctx.drawImage(cell.sample.canvas, 0, 0);
      }
    }
    return;
  }
  const cols = Math.ceil(Math.sqrt(cells.length));
  const rows = Math.ceil(cells.length / cols);
  const atlasW = cols * w;
  const atlasH = rows * h;
  renderer.setSize(atlasW, atlasH, false);
  renderer.setScissorTest(true);
  cells.forEach((cell, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const glY = (rows - 1 - row) * h;
    renderer!.setViewport(col * w, glY, w, h);
    renderer!.setScissor(col * w, glY, w, h);
    paintView(cell.sample, timeMs, w, h);
  });
  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, atlasW, atlasH);
  if (atlas.width !== atlasW || atlas.height !== atlasH) {
    atlas.width = atlasW;
    atlas.height = atlasH;
  }
  atlasCtx.clearRect(0, 0, atlasW, atlasH);
  atlasCtx.drawImage(renderer.domElement, 0, 0);
  cells.forEach((cell, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    for (const target of cell.targets) {
      fitCanvas(target, w, h);
      target.ctx.clearRect(0, 0, w, h);
      target.ctx.drawImage(atlas, col * w, row * h, w, h, 0, 0, w, h);
    }
  });
}

function loop(timeMs: number) {
  raf = window.requestAnimationFrame(loop);
  if (document.hidden || !rig) return;
  const ready = [...views].filter((view) => view.visible && pixelSize(view));
  const moving = ready.some((view) => !view.reduced);
  if (!moving && !dirty) return;
  dirty = false;
  for (const view of ready) {
    if (view.hero) renderHero(view, timeMs);
  }
  renderThumbs(ready.filter((view) => !view.hero), timeMs);
}

function ensureLoop() {
  if (raf || failed || !rig) return;
  raf = window.requestAnimationFrame(loop);
}

function ensureRenderer() {
  if (renderer) return;
  renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = SRGBColorSpace;
  scene = new Scene();
  camera = new PerspectiveCamera(32, 1, 0.05, 40);
  scene.add(new HemisphereLight(0xf7f3ec, 0x3a312c, 1.25));
  const key = new DirectionalLight(0xfff6ec, 2.8);
  key.position.set(1.8, 3.4, 2.6);
  const fill = new DirectionalLight(0xd5e2f6, 1.2);
  fill.position.set(-2.6, 1.8, -1.4);
  const rim = new DirectionalLight(0xffd8b0, 1.45);
  rim.position.set(-1.4, 2.4, -2.8);
  scene.add(key, fill, rim);
}

async function ensureModel() {
  if (rig || failed) return;
  if (!loadPromise) {
    loadPromise = Promise.all([
      new GLTFLoader().loadAsync(MODEL_URL),
      loadGear(),
    ]).then(([gltf, gear]) => {
      ensureRenderer();
      rig = buildRig(gltf.scene, gear);
      scene?.add(rig.stage);
      dirty = true;
      ensureLoop();
    }).catch((error: unknown) => {
      failed = true;
      loadPromise = null;
      console.error("No se pudo cargar public/models/coach.glb", error);
      throw error;
    });
  }
  await loadPromise;
}

function disposeStage() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  if (rig && scene) {
    scene.remove(rig.stage);
    rig.gear.dispose();
    disposeObject(rig.stage);
  }
  rig = null;
  scene = null;
  camera = null;
  renderer?.dispose();
  renderer = null;
  loadPromise = null;
  failed = false;
  dirty = true;
}

export type CoachHandle = {
  setPose: (pose: PoseId) => void;
  setReduced: (reduced: boolean) => void;
  setSize: (cssW: number, cssH: number) => void;
  destroy: () => void;
};

export function attachCoachView(
  canvas: HTMLCanvasElement,
  options: { pose: PoseId; reduced: boolean; hero: boolean },
): CoachHandle {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("El lienzo 2D no está disponible");
  if (disposeTimer) {
    window.clearTimeout(disposeTimer);
    disposeTimer = 0;
  }
  users += 1;
  const view: View = {
    canvas,
    ctx,
    pose: options.pose,
    reduced: options.reduced,
    hero: options.hero,
    cssW: canvas.clientWidth,
    cssH: canvas.clientHeight,
    visible: true,
  };
  views.add(view);
  dirty = true;
  const observer = new IntersectionObserver((entries) => {
    view.visible = entries.some((entry) => entry.isIntersecting);
    dirty = true;
  });
  observer.observe(canvas);
  void ensureModel().then(() => {
    dirty = true;
    ensureLoop();
  }).catch(() => {
    canvas.dataset.coach = "error";
  });

  return {
    setPose(pose) {
      view.pose = pose;
      dirty = true;
    },
    setReduced(reduced) {
      view.reduced = reduced;
      dirty = true;
    },
    setSize(cssW, cssH) {
      view.cssW = cssW;
      view.cssH = cssH;
      dirty = true;
    },
    destroy() {
      observer.disconnect();
      views.delete(view);
      users -= 1;
      if (users > 0) return;
      disposeTimer = window.setTimeout(() => {
        if (users === 0) disposeStage();
      }, 0);
    },
  };
}
