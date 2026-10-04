import {
  Box3,
  CanvasTexture,
  CircleGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Material,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Joints, Layout } from "../data/figureMotions.ts";
import type { PoseId } from "../data/poses.ts";
import { motionFor, sampleMotion } from "./coachSample.ts";

const DEG = Math.PI / 180;
const REST_FOOT = -78;
const MODEL_URL = `${import.meta.env.BASE_URL}models/coach.glb`;

const FRAMING: Record<Layout, { position: Vector3; lookY: number }> = {
  stand: { position: new Vector3(1.25, 1.28, 4.05), lookY: 0.94 },
  sit: { position: new Vector3(1.35, 1.22, 4.15), lookY: 0.78 },
  kneel: { position: new Vector3(1.35, 1.12, 4.05), lookY: 0.7 },
  supine: { position: new Vector3(2.85, 2.05, 2.55), lookY: 0.38 },
  prone: { position: new Vector3(2.85, 2.05, 2.55), lookY: 0.38 },
};

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

type Limb = {
  pivot: Group;
  scaler: Group;
  hip: Vector3;
  l1: number;
  l2: number;
  bind: number;
  sneaker: Mesh;
};

type Arm = {
  pivot: Group;
};

type Rig = {
  fit: Group;
  layout: Group;
  pose: Group;
  lean: Group;
  armL: Arm;
  armR: Arm;
  legL: Limb;
  legR: Limb;
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
const box = new Box3();

function materialsOf(mesh: Mesh): Material[] {
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material];
}

function takeMesh(root: Object3D, name: string): Mesh {
  const found = root.getObjectByName(name);
  if (!(found instanceof Mesh)) throw new Error(`El GLB no trae la malla ${name}`);
  found.removeFromParent();
  return found;
}

function centerOf(mesh: Mesh): Box3 {
  mesh.geometry.computeBoundingBox();
  const bounds = mesh.geometry.boundingBox;
  if (!bounds) throw new Error("Geometría sin caja");
  return bounds;
}

function shadowTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Sin lienzo para la sombra");
  const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 62);
  gradient.addColorStop(0, "rgba(0,0,0,0.55)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function makeLeg(mesh: Mesh, sneaker: Mesh): Limb {
  const legBox = centerOf(mesh);
  const shoeBox = centerOf(sneaker);
  const hip = new Vector3(
    (legBox.min.x + legBox.max.x) / 2,
    legBox.max.y,
    (legBox.min.z + legBox.max.z) / 2,
  );
  const ankle = new Vector3(
    (shoeBox.min.x + shoeBox.max.x) / 2,
    shoeBox.max.y,
    shoeBox.min.z + (shoeBox.max.z - shoeBox.min.z) * 0.35,
  );
  const bind = Math.max(0.2, hip.y - legBox.min.y);
  mesh.geometry.translate(-hip.x, -hip.y, -hip.z);
  mesh.geometry.computeBoundingSphere();
  mesh.position.set(0, 0, 0);
  sneaker.geometry.translate(-ankle.x, -ankle.y, -ankle.z);
  sneaker.geometry.computeBoundingSphere();
  sneaker.position.set(0, 0, 0);

  const pivot = new Group();
  pivot.position.copy(hip);
  const scaler = new Group();
  scaler.add(mesh);
  pivot.add(scaler);

  return { pivot, scaler, hip, l1: bind * 0.54, l2: bind * 0.46, bind, sneaker };
}

function makeArm(mesh: Mesh): { arm: Arm; shoulder: Vector3 } {
  const armBox = centerOf(mesh);
  const shoulder = new Vector3(
    (armBox.min.x + armBox.max.x) / 2,
    armBox.max.y,
    (armBox.min.z + armBox.max.z) / 2,
  );
  mesh.geometry.translate(-shoulder.x, -shoulder.y, -shoulder.z);
  mesh.geometry.computeBoundingSphere();
  mesh.position.set(0, 0, 0);
  const pivot = new Group();
  pivot.add(mesh);
  return { arm: { pivot }, shoulder };
}

function boostShirt(torso: Mesh) {
  for (const material of materialsOf(torso)) {
    if (material instanceof MeshStandardMaterial && material.name === "Shirt") {
      material.color.multiplyScalar(8);
    }
  }
}

function buildRig(root: Object3D): Rig {
  const head = takeMesh(root, "Head");
  const torso = takeMesh(root, "Torso");
  const shorts = takeMesh(root, "Shorts");
  const armLeft = takeMesh(root, "ArmLeft");
  const armRight = takeMesh(root, "ArmRight");
  const legLeft = takeMesh(root, "LegLeft");
  const legRight = takeMesh(root, "LegRight");
  const sneakerLeft = takeMesh(root, "SneakerLeft");
  const sneakerRight = takeMesh(root, "SneakerRight");
  boostShirt(torso);

  const legL = makeLeg(legLeft, sneakerLeft);
  const legR = makeLeg(legRight, sneakerRight);
  const { arm: armL, shoulder: shoulderL } = makeArm(armLeft);
  const { arm: armR, shoulder: shoulderR } = makeArm(armRight);
  const hipY = (legL.hip.y + legR.hip.y) / 2;

  const lean = new Group();
  lean.position.set(0, hipY, 0);
  for (const mesh of [torso, shorts, head]) {
    mesh.position.set(0, -hipY, 0);
    lean.add(mesh);
  }
  armL.pivot.position.set(shoulderL.x, shoulderL.y - hipY, shoulderL.z);
  armR.pivot.position.set(shoulderR.x, shoulderR.y - hipY, shoulderR.z);
  lean.add(armL.pivot, armR.pivot);

  const pose = new Group();
  pose.add(lean, legL.pivot, legR.pivot, legL.sneaker, legR.sneaker);

  const layout = new Group();
  layout.add(pose);

  const fit = new Group();
  fit.add(layout);

  const shadow = new Mesh(
    new CircleGeometry(0.55, 28),
    new MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.006;

  return { fit, layout, pose, lean, armL, armR, legL, legR, shadow };
}

function layoutAngle(layout: Layout): number {
  if (layout === "supine") return -Math.PI / 2;
  if (layout === "prone") return Math.PI / 2;
  return 0;
}

function chord(upper: number, lower: number, l1: number, l2: number): { pitch: number; length: number } {
  const a = upper * DEG;
  const b = (upper + lower) * DEG;
  const y = -Math.cos(a) * l1 - Math.cos(b) * l2;
  const z = -Math.sin(a) * l1 - Math.sin(b) * l2;
  const length = Math.max(0.05, Math.hypot(y, z));
  return { pitch: Math.atan2(-z, -y), length };
}

function poseArm(arm: Arm, shoulder: number, elbow: number) {
  const { pitch } = chord(shoulder, elbow, 0.38, 0.62);
  arm.pivot.rotation.set(pitch, 0, 0);
}

function poseLeg(limb: Limb, thigh: number, knee: number, foot: number, planted: boolean) {
  const { pitch, length } = chord(thigh, knee, limb.l1, limb.l2);
  limb.pivot.rotation.set(pitch, 0, 0);
  limb.scaler.scale.set(1, length / limb.bind, 1);
  const a = thigh * DEG;
  const b = (thigh + knee) * DEG;
  const ankleY = limb.hip.y - Math.cos(a) * limb.l1 - Math.cos(b) * limb.l2;
  const ankleZ = limb.hip.z - Math.sin(a) * limb.l1 - Math.sin(b) * limb.l2;
  limb.sneaker.position.set(limb.hip.x, ankleY, ankleZ);
  const flex = Math.min(0.7, Math.max(-0.7, (foot - REST_FOOT) * DEG));
  const pitchFoot = planted ? flex : -(thigh + knee) * DEG + flex;
  limb.sneaker.rotation.set(pitchFoot, 0, 0);
}

function applyPose(joints: Joints, layout: Layout) {
  if (!rig) return;
  const planted = layout === "stand" || layout === "sit" || layout === "kneel";
  rig.layout.rotation.set(layoutAngle(layout), 0, 0);
  rig.pose.position.set(0, -joints.lift * 0.008, joints.shift * 0.01);
  rig.lean.rotation.set(joints.lean * DEG, 0, 0);
  poseArm(rig.armL, joints.armL, joints.elbL);
  poseArm(rig.armR, joints.armR, joints.elbR);
  poseLeg(rig.legL, joints.thighL, joints.kneeL, joints.footL, planted);
  poseLeg(rig.legR, joints.thighR, joints.kneeR, joints.footR, planted);

  rig.fit.position.set(0, 0, 0);
  rig.fit.updateMatrixWorld(true);
  box.setFromObject(rig.layout);
  const spanX = box.max.x - box.min.x;
  const spanZ = box.max.z - box.min.z;
  rig.shadow.scale.set(Math.max(0.85, spanX * 0.62), Math.max(0.85, spanZ * 0.62), 1);
  rig.fit.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
}

function frameCamera(layout: Layout) {
  if (!camera) return;
  const framing = FRAMING[layout];
  camera.position.copy(framing.position);
  camera.lookAt(0, framing.lookY, 0);
}

const atlas = document.createElement("canvas");
const atlasCtx = atlas.getContext("2d", { alpha: true });

function pixelSize(view: View): { w: number; h: number } | null {
  if (view.cssW < 2 || view.cssH < 2) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, view.hero ? 2 : 2);
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
  applyPose(sampleMotion(motion, timeMs, view.reduced), motion.layout);
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
  scene.add(new HemisphereLight(0xf7f3ec, 0x3a312c, 1.15));
  const key = new DirectionalLight(0xfff6ec, 2.6);
  key.position.set(1.8, 3.4, 2.6);
  const fill = new DirectionalLight(0xd5e2f6, 1.15);
  fill.position.set(-2.6, 1.8, -1.4);
  const rim = new DirectionalLight(0xffd8b0, 1.35);
  rim.position.set(-1.4, 2.4, -2.8);
  scene.add(key, fill, rim);
}

async function ensureModel() {
  if (rig || failed) return;
  if (!loadPromise) {
    loadPromise = new GLTFLoader().loadAsync(MODEL_URL).then((gltf) => {
      ensureRenderer();
      rig = buildRig(gltf.scene);
      if (!scene) return;
      scene.add(rig.fit, rig.shadow);
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

function disposeMaterial(material: Material) {
  const mapped = material as Material & { map?: { dispose: () => void } | null };
  mapped.map?.dispose();
  material.dispose();
}

function disposeObject(object: Object3D) {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.geometry.dispose();
    for (const material of materialsOf(child)) disposeMaterial(material);
  });
}

function disposeStage() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  if (rig && scene) {
    scene.remove(rig.fit, rig.shadow);
    disposeObject(rig.fit);
    disposeObject(rig.shadow);
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
