import { FIGURE_MOTIONS, playback, type Joints, type Motion } from "../data/figureMotions.ts";
import type { PoseId } from "../data/poses.ts";

/** El GLB trae esqueleto y ningún clip: estos ángulos se aplican a los huesos. */
export function durationSeconds(motion: Motion): number {
  const value = Number.parseFloat(motion.dur);
  return Number.isFinite(value) && value > 0 ? value : 2.8;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** El círculo de brazos salta de -290 a -20: se interpola por el arco corto. */
function lerpAngle(a: number, b: number, t: number): number {
  let delta = b - a;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return a + delta * t;
}

function lerpJoints(a: Joints, b: Joints, t: number): Joints {
  return {
    lift: lerp(a.lift, b.lift, t),
    shift: lerp(a.shift, b.shift, t),
    lean: lerpAngle(a.lean, b.lean, t),
    thighL: lerpAngle(a.thighL, b.thighL, t),
    thighR: lerpAngle(a.thighR, b.thighR, t),
    kneeL: lerpAngle(a.kneeL, b.kneeL, t),
    kneeR: lerpAngle(a.kneeR, b.kneeR, t),
    footL: lerpAngle(a.footL, b.footL, t),
    footR: lerpAngle(a.footR, b.footR, t),
    armL: lerpAngle(a.armL, b.armL, t),
    armR: lerpAngle(a.armR, b.armR, t),
    elbL: lerpAngle(a.elbL, b.elbL, t),
    elbR: lerpAngle(a.elbR, b.elbR, t),
  };
}

export function sampleMotion(motion: Motion, timeMs: number, reduced: boolean): Joints {
  const keys = playback(motion);
  const first = keys[0] ?? motion.frames[0];
  if (reduced || keys.length < 2) return first;
  const dur = durationSeconds(motion) * 1000;
  const u = (((timeMs % dur) + dur) % dur) / dur;
  const segments = keys.length - 1;
  const x = u * segments;
  const index = Math.min(segments - 1, Math.floor(x));
  return lerpJoints(keys[index], keys[index + 1], smoothstep(x - index));
}

export function motionFor(pose: PoseId): Motion {
  return FIGURE_MOTIONS[pose];
}
