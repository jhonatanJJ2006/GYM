import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  CanvasTexture,
  CircleGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  LoopRepeat,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  SkinnedMesh,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Material,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { PoseId } from "../data/poses.ts";
import { CLIPS, clipFor, clipSeconds, type ClipName, type GearFile } from "./coachClips.ts";

/**
 * El coach y su equipo vienen con clips hechos en Blender (scripts/3d). Aquí solo
 * se reproducen: el clip del coach y el clip del mismo nombre en el GLB del equipo,
 * con el mismo origen y el mismo tiempo, así las manos quedan en el agarre.
 */
const MODEL_URL = `${import.meta.env.BASE_URL}models/coach.glb`;
const GEAR_URL = `${import.meta.env.BASE_URL}models/gear`;

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

type Animated = {
  root: Object3D;
  mixer: AnimationMixer;
  actions: Map<string, AnimationAction>;
  current: AnimationAction | null;
};

type Rig = {
  stage: Group;
  coach: Animated;
  bones: Object3D[];
  gear: Map<GearFile, Animated>;
  gearLoading: Set<GearFile>;
  frames: Map<ClipName, { center: Vector3; radius: number }>;
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
let clock: ((canvas: HTMLCanvasElement) => number) | null = null;

const box = new Box3();
const meshBox = new Box3();
const point = new Vector3();
const camDir = new Vector3();

/** Solo para páginas de QA: fija el tiempo de cada lienzo. */
export function setCoachClock(fn: ((canvas: HTMLCanvasElement) => number) | null) {
  clock = fn;
  dirty = true;
}

function materialsOf(mesh: Mesh): Material[] {
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material];
}

function disposeObject(object: Object3D) {
  const materials = new Set<Material>();
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.geometry.dispose();
    for (const material of materialsOf(child)) materials.add(material);
  });
  for (const material of materials) {
    const mapped = material as Material & { map?: { dispose: () => void } | null };
    mapped.map?.dispose();
    material.dispose();
  }
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

function animated(root: Object3D, clips: AnimationClip[]): Animated {
  const mixer = new AnimationMixer(root);
  const actions = new Map<string, AnimationAction>();
  for (const clip of clips) {
    const action = mixer.clipAction(clip);
    action.setLoop(LoopRepeat, Infinity);
    actions.set(clip.name, action);
  }
  return { root, mixer, actions, current: null };
}

/** Deja activo solo `name` en el tiempo `t`. Si el GLB no trae ese clip, queda quieto. */
function seek(target: Animated, name: string, t: number) {
  const action = target.actions.get(name) ?? null;
  if (target.current !== action) {
    target.current?.stop();
    target.current = action;
    action?.reset().play();
  }
  if (!action) return;
  action.time = t;
  target.mixer.update(0);
}

function buildRig(root: Object3D, clips: AnimationClip[]): Rig {
  const bones: Object3D[] = [];
  root.traverse((child) => {
    if (child instanceof SkinnedMesh) {
      child.frustumCulled = false;
      child.castShadow = false;
    }
    if ((child as Object3D & { isBone?: boolean }).isBone) bones.push(child);
  });
  if (bones.length === 0) throw new Error("El GLB del coach no trae esqueleto");
  const stage = new Group();
  const shadow = new Mesh(
    new CircleGeometry(0.55, 28),
    new MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.004;
  stage.add(root, shadow);
  return {
    stage,
    coach: animated(root, clips),
    bones,
    gear: new Map(),
    gearLoading: new Set(),
    frames: new Map(),
  };
}

function loadGear(file: GearFile) {
  if (!rig || rig.gear.has(file) || rig.gearLoading.has(file)) return;
  const target = rig;
  target.gearLoading.add(file);
  new GLTFLoader()
    .loadAsync(`${GEAR_URL}/${file}.glb`)
    .then((gltf) => {
      if (rig !== target) {
        disposeObject(gltf.scene);
        return;
      }
      gltf.scene.visible = false;
      target.stage.add(gltf.scene);
      target.gear.set(file, animated(gltf.scene, gltf.animations));
      target.frames.clear();
      dirty = true;
    })
    .catch((error: unknown) => {
      console.error(`No se pudo cargar el equipo ${file}.glb`, error);
    })
    .finally(() => target.gearLoading.delete(file));
}

function showClip(clip: ClipName, t: number) {
  if (!rig) return;
  const info = CLIPS[clip];
  seek(rig.coach, clip, t);
  for (const [file, gear] of rig.gear) {
    const on = file === info.gear;
    gear.root.visible = on;
    if (on) seek(gear, clip, t);
  }
  if (info.gear && !rig.gear.has(info.gear)) loadGear(info.gear);
  rig.stage.updateMatrixWorld(true);
}

/** Encuadre por clip: caja de huesos y equipo al inicio del bucle. */
function clipFrame(clip: ClipName): { center: Vector3; radius: number } {
  if (!rig) return { center: new Vector3(0, 0.9, 0), radius: 1 };
  const cached = rig.frames.get(clip);
  if (cached) return cached;
  box.makeEmpty();
  for (let i = 0; i < 3; i += 1) {
    showClip(clip, (clipSeconds() * i) / 3);
    for (const bone of rig.bones) box.expandByPoint(bone.getWorldPosition(point));
  }
  box.expandByScalar(0.12);
  box.min.y = Math.min(box.min.y, 0);
  const file = CLIPS[clip].gear;
  const gear = file ? rig.gear.get(file) : undefined;
  if (gear) {
    gear.root.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
      const bounds = child.geometry.boundingBox;
      if (!bounds) return;
      meshBox.copy(bounds).applyMatrix4(child.matrixWorld);
      box.union(meshBox);
    });
  }
  const center = box.getCenter(new Vector3());
  const radius = box.getSize(new Vector3()).length() / 2;
  const result = { center, radius };
  if (!file || gear) rig.frames.set(clip, result);
  return result;
}

function frameCamera(clip: ClipName, aspect: number) {
  if (!camera || !rig) return;
  const { center, radius } = clipFrame(clip);
  // El coach mira a +Z. "side" evita que la máquina tape el cuerpo.
  const view = CLIPS[clip].view;
  if (view === "side") camDir.set(-1, 0.32, 0.55);
  else if (view === "high") camDir.set(-0.55, 0.62, 1);
  else camDir.set(-0.5, 0.28, 1);
  camDir.normalize();
  const fov = (camera.fov * Math.PI) / 180;
  const fit = Math.min(1, aspect);
  const dist = (radius * 0.92) / Math.sin((fov * fit) / 2);
  camera.aspect = aspect;
  camera.position.copy(center).addScaledVector(camDir, dist);
  camera.near = Math.max(0.05, dist - radius * 2);
  camera.far = dist + radius * 3;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}

function paintFallback(view: View) {
  const w = Math.max(1, Math.round(view.cssW || view.canvas.width || 120));
  const h = Math.max(1, Math.round(view.cssH || view.canvas.height || 120));
  fitCanvas(view, w, h);
  const ctx = view.ctx;
  ctx.clearRect(0, 0, w, h);
  const s = Math.min(w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.fillStyle = "rgba(160,160,170,0.55)";
  const bar = s * 0.36;
  ctx.fillRect(-bar, -s * 0.02, bar * 2, s * 0.04);
  for (const side of [-1, 1]) {
    ctx.fillRect(side * bar - (side > 0 ? 0 : s * 0.08), -s * 0.12, s * 0.08, s * 0.24);
  }
  ctx.restore();
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
  if (!renderer || !camera || !rig || !scene) return;
  const clip = clipFor(view.pose);
  const seconds = clipSeconds();
  const ms = clock ? clock(view.canvas) : timeMs;
  const t = view.reduced ? 0 : (((ms / 1000) % seconds) + seconds) % seconds;
  frameCamera(clip, w / h);
  showClip(clip, t);
  renderer.render(scene, camera);
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
    loadPromise = new GLTFLoader()
      .loadAsync(MODEL_URL)
      .then((gltf) => {
        ensureRenderer();
        rig = buildRig(gltf.scene, gltf.animations);
        scene?.add(rig.stage);
        dirty = true;
        ensureLoop();
      })
      .catch((error: unknown) => {
        failed = true;
        loadPromise = null;
        renderer?.dispose();
        renderer = null;
        console.error("No se pudo cargar el coach 3D (public/models/coach.glb)", error);
        for (const view of views) paintFallback(view);
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
    rig.coach.mixer.stopAllAction();
    for (const gear of rig.gear.values()) gear.mixer.stopAllAction();
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
    paintFallback(view);
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
