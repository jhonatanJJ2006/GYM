import {
  SCENES,
  type FrontBody,
  type Gear,
  type Hand,
  type Motion,
  type Pt,
  type Scene,
  type SideBody,
} from "../data/figures.ts";
import type { PoseId } from "../data/poses.ts";

const SHIRT = "#ff7a59";
const SKIN = "#f2c7a4";
const PANTS = "#5c6fe0";
const SHOE = "#242a3a";
const GHOST_SHIRT = "#b7c6f2";
const GHOST_SKIN = "#d5def8";
const GHOST_PANTS = "#9aade6";
const GEAR = "#e7eeff";
const GEAR_EDGE = "#1b1a24";
const ARROW = "#ffe08a";

function isSide(body: SideBody | FrontBody): body is SideBody {
  return "shoulder" in body;
}

function resolve(body: SideBody | FrontBody, hand: Hand): Pt[] {
  if (isSide(body)) {
    if (hand === "far" && body.wristB) return [body.wristB];
    if (hand === "both") return body.wristB ? [body.wrist, body.wristB] : [body.wrist];
    return [body.wrist];
  }
  if (hand === "left") return [body.wristL];
  if (hand === "right") return [body.wristR];
  if (hand === "both") return [body.wristL, body.wristR];
  return [body.wristL, body.wristR];
}

function mid(points: Pt[]): Pt {
  const x = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const y = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  return [x, y];
}

function Limb({ a, b, color, width }: { a: Pt; b: Pt; color: string; width: number }) {
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#07080c" strokeWidth={width + 5} strokeLinecap="round" />
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={width} strokeLinecap="round" />
    </g>
  );
}

function Shoe({ at, toward, color }: { at: Pt; toward: Pt; color: string }) {
  const angle = (Math.atan2(at[1] - toward[1], at[0] - toward[0]) * 180) / Math.PI;
  return (
    <ellipse
      cx={at[0]}
      cy={at[1] + 2}
      rx={11}
      ry={5}
      fill={color}
      transform={`rotate(${angle} ${at[0]} ${at[1]})`}
    />
  );
}

function Hair({ head, ghost }: { head: Pt; ghost?: boolean }) {
  return (
    <g>
      <circle cx={head[0]} cy={head[1] - 3} r={16} fill={ghost ? "#8e9bbd" : "#3a342f"} />
      <circle cx={head[0]} cy={head[1] + 2} r={14} fill={ghost ? GHOST_SKIN : SKIN} />
    </g>
  );
}

function Nose({ head, face, ghost }: { head: Pt; face: SideBody["face"]; ghost?: boolean }) {
  const shift: Record<NonNullable<SideBody["face"]>, Pt> = {
    left: [-13, 2],
    right: [13, 2],
    up: [0, -14],
    down: [0, 14],
  };
  const [dx, dy] = shift[face ?? "left"];
  return <circle cx={head[0] + dx} cy={head[1] + dy} r={2.4} fill={ghost ? "#b7c4e4" : "#e0b08c"} />;
}

function SidePerson({ body, ghost }: { body: SideBody; ghost?: boolean }) {
  const shirt = ghost ? GHOST_SHIRT : SHIRT;
  const skin = ghost ? GHOST_SKIN : SKIN;
  const pants = ghost ? GHOST_PANTS : PANTS;
  const shoe = ghost ? "#7f8cab" : SHOE;
  return (
    <g opacity={ghost ? 0.55 : 1}>
      {body.kneeB && body.ankleB ? (
        <g opacity={0.75}>
          <Limb a={body.hip} b={body.kneeB} color={pants} width={12} />
          <Limb a={body.kneeB} b={body.ankleB} color={pants} width={10} />
          <Shoe at={body.ankleB} toward={body.kneeB} color={shoe} />
        </g>
      ) : null}
      {body.elbowB && body.wristB ? (
        <g opacity={0.75}>
          <Limb a={body.shoulder} b={body.elbowB} color={skin} width={9} />
          <Limb a={body.elbowB} b={body.wristB} color={skin} width={8} />
          <circle cx={body.wristB[0]} cy={body.wristB[1]} r={4.5} fill={skin} />
        </g>
      ) : null}
      <Limb a={body.shoulder} b={body.hip} color={shirt} width={26} />
      <Limb a={body.shoulder} b={body.head} color={skin} width={8} />
      <Limb a={body.hip} b={body.knee} color={pants} width={15} />
      <Limb a={body.knee} b={body.ankle} color={pants} width={12} />
      <Shoe at={body.ankle} toward={body.knee} color={shoe} />
      <Limb a={body.shoulder} b={body.elbow} color={skin} width={12} />
      <Limb a={body.elbow} b={body.wrist} color={skin} width={10} />
      <circle cx={body.elbow[0]} cy={body.elbow[1]} r={5.5} fill={skin} />
      <circle cx={body.knee[0]} cy={body.knee[1]} r={6} fill={pants} />
      <circle cx={body.wrist[0]} cy={body.wrist[1]} r={5} fill={skin} />
      <Hair head={body.head} ghost={ghost} />
      <Nose head={body.head} face={body.face} ghost={ghost} />
    </g>
  );
}

function FrontPerson({ body, ghost, back }: { body: FrontBody; ghost?: boolean; back?: boolean }) {
  const shirt = ghost ? GHOST_SHIRT : SHIRT;
  const skin = ghost ? GHOST_SKIN : SKIN;
  const pants = ghost ? GHOST_PANTS : PANTS;
  const shoe = ghost ? "#7f8cab" : SHOE;
  const neck: Pt = [(body.shoulderL[0] + body.shoulderR[0]) / 2, (body.shoulderL[1] + body.shoulderR[1]) / 2];
  const hipL: Pt = [body.hip[0] - 16, body.hip[1]];
  const hipR: Pt = [body.hip[0] + 16, body.hip[1]];
  return (
    <g opacity={ghost ? 0.5 : 1}>
      <Limb a={hipL} b={body.kneeL} color={pants} width={13} />
      <Limb a={body.kneeL} b={body.ankleL} color={pants} width={11} />
      <Limb a={hipR} b={body.kneeR} color={pants} width={13} />
      <Limb a={body.kneeR} b={body.ankleR} color={pants} width={11} />
      <Shoe at={body.ankleL} toward={body.kneeL} color={shoe} />
      <Shoe at={body.ankleR} toward={body.kneeR} color={shoe} />
      <path
        d={`M ${body.shoulderL[0]} ${body.shoulderL[1]} L ${body.shoulderR[0]} ${body.shoulderR[1]} L ${hipR[0]} ${hipR[1]} L ${hipL[0]} ${hipL[1]} Z`}
        fill={shirt}
      />
      {back ? (
        <line
          x1={neck[0]}
          y1={neck[1] + 8}
          x2={body.hip[0]}
          y2={body.hip[1] - 6}
          stroke="#c4543a"
          strokeWidth={2}
          opacity={ghost ? 0.4 : 0.8}
        />
      ) : null}
      <Limb a={body.shoulderL} b={body.elbowL} color={skin} width={11} />
      <Limb a={body.elbowL} b={body.wristL} color={skin} width={9} />
      <Limb a={body.shoulderR} b={body.elbowR} color={skin} width={11} />
      <Limb a={body.elbowR} b={body.wristR} color={skin} width={9} />
      <circle cx={body.wristL[0]} cy={body.wristL[1]} r={5} fill={skin} />
      <circle cx={body.wristR[0]} cy={body.wristR[1]} r={5} fill={skin} />
      <Limb a={neck} b={body.head} color={skin} width={8} />
      <Hair head={body.head} ghost={ghost} />
      {back ? null : <Nose head={body.head} face="down" ghost={ghost} />}
    </g>
  );
}

function Dumbbell({ at, angle = 0 }: { at: Pt; angle?: number }) {
  return (
    <g transform={`rotate(${angle} ${at[0]} ${at[1]})`}>
      <line x1={at[0] - 15} y1={at[1]} x2={at[0] + 15} y2={at[1]} stroke={GEAR} strokeWidth={4} strokeLinecap="round" />
      <circle cx={at[0] - 16} cy={at[1]} r={7} fill="#c5d4ff" stroke={GEAR_EDGE} strokeWidth={1.4} />
      <circle cx={at[0] + 16} cy={at[1]} r={7} fill="#c5d4ff" stroke={GEAR_EDGE} strokeWidth={1.4} />
    </g>
  );
}

function BarbellEnd({ at }: { at: Pt }) {
  return (
    <g>
      <circle cx={at[0]} cy={at[1]} r={13} fill="#d5def8" stroke={GEAR_EDGE} strokeWidth={1.6} />
      <circle cx={at[0]} cy={at[1]} r={4} fill={GEAR_EDGE} />
    </g>
  );
}

function BarbellAcross({ a, b }: { a: Pt; b: Pt }) {
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const start: Pt = [a[0] - ux * 18, a[1] - uy * 18];
  const end: Pt = [b[0] + ux * 18, b[1] + uy * 18];
  return (
    <g>
      <line x1={start[0]} y1={start[1]} x2={end[0]} y2={end[1]} stroke={GEAR} strokeWidth={5} strokeLinecap="round" />
      <circle cx={start[0]} cy={start[1]} r={10} fill="#c5d4ff" stroke={GEAR_EDGE} strokeWidth={1.4} />
      <circle cx={end[0]} cy={end[1]} r={10} fill="#c5d4ff" stroke={GEAR_EDGE} strokeWidth={1.4} />
    </g>
  );
}

function FixedGear({ gear }: { gear: Gear }) {
  if (gear.kind === "pad") {
    const my = (gear.from[1] + gear.to[1]) / 2 + 22;
    return (
      <g>
        <line
          x1={gear.from[0]}
          y1={gear.from[1]}
          x2={gear.to[0]}
          y2={gear.to[1]}
          stroke="#5c657c"
          strokeWidth={16}
          strokeLinecap="round"
        />
        <line x1={gear.from[0] + 12} y1={gear.from[1]} x2={gear.from[0] + 12} y2={my} stroke="#3e465c" strokeWidth={5} />
        <line x1={gear.to[0] - 12} y1={gear.to[1]} x2={gear.to[0] - 12} y2={my} stroke="#3e465c" strokeWidth={5} />
      </g>
    );
  }
  if (gear.kind === "seat") {
    return (
      <g>
        <line x1={gear.at[0] - 28} y1={gear.at[1]} x2={gear.at[0] + 18} y2={gear.at[1]} stroke="#5c657c" strokeWidth={12} strokeLinecap="round" />
        <line x1={gear.at[0] - 24} y1={gear.at[1]} x2={gear.at[0] - 24} y2={gear.at[1] - 36} stroke="#5c657c" strokeWidth={12} strokeLinecap="round" />
      </g>
    );
  }
  if (gear.kind === "step") {
    return (
      <g>
        <rect x={gear.at[0]} y={gear.at[1]} width={gear.w} height={14} rx={3} fill="#6a738c" />
        <rect x={gear.at[0] + 8} y={gear.at[1] + 14} width={10} height={16} fill="#4a5168" />
        <rect x={gear.at[0] + gear.w - 18} y={gear.at[1] + 14} width={10} height={16} fill="#4a5168" />
      </g>
    );
  }
  if (gear.kind === "platform") {
    return (
      <g>
        <line
          x1={gear.from[0]}
          y1={gear.from[1]}
          x2={gear.to[0]}
          y2={gear.to[1]}
          stroke="#8b93ab"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <line
          x1={gear.from[0] + 10}
          y1={gear.from[1] - 6}
          x2={gear.to[0] + 10}
          y2={gear.to[1] - 6}
          stroke="#c5cbe0"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>
    );
  }
  if (gear.kind === "bike") {
    return (
      <g stroke={GEAR} fill="none" strokeWidth={4} strokeLinecap="round">
        <circle cx={108} cy={168} r={26} />
        <circle cx={214} cy={168} r={26} />
        <path d="M108 168 L150 168 L168 112 L214 168 L168 112 L132 112 L108 168" />
        <line x1={132} y1={112} x2={100} y2={86} />
      </g>
    );
  }
  if (gear.kind === "cable") {
    return <rect x={gear.anchor[0] - 8} y={gear.anchor[1] - 8} width={16} height={16} rx={3} fill="#9aa6c8" />;
  }
  return null;
}

function HeldGear({ gear, body }: { gear: Gear; body: SideBody | FrontBody }) {
  if (gear.kind === "dumbbell") {
    return (
      <g>
        {resolve(body, gear.hand).map((at, index) => (
          <Dumbbell key={index} at={at} angle={gear.angle ?? 0} />
        ))}
      </g>
    );
  }
  if (gear.kind === "goblet") {
    const at = resolve(body, gear.hand)[0];
    return (
      <g>
        <rect x={at[0] - 13} y={at[1] - 18} width={26} height={14} rx={3} fill="#d5def8" stroke={GEAR_EDGE} strokeWidth={1.2} />
        <line x1={at[0]} y1={at[1] - 4} x2={at[0]} y2={at[1] + 14} stroke="#d5def8" strokeWidth={5} strokeLinecap="round" />
      </g>
    );
  }
  if (gear.kind === "barbell") {
    const points = resolve(body, gear.hand);
    if (points.length >= 2) return <BarbellAcross a={points[0]} b={points[1]} />;
    return <BarbellEnd at={points[0]} />;
  }
  if (gear.kind === "cable") {
    const points = resolve(body, gear.hand);
    const to = mid(points);
    return <line x1={gear.anchor[0]} y1={gear.anchor[1]} x2={to[0]} y2={to[1]} stroke="#dbe4ff" strokeWidth={3} />;
  }
  if (gear.kind === "wheel") {
    const at = resolve(body, gear.hand)[0];
    return (
      <g>
        <circle cx={at[0]} cy={at[1]} r={14} fill="none" stroke={GEAR} strokeWidth={4} />
        <circle cx={at[0]} cy={at[1]} r={3} fill={GEAR} />
      </g>
    );
  }
  if (gear.kind === "disc") {
    const points = isSide(body) ? [body.wrist] : [body.wristL, body.wristR];
    const at = mid(points);
    return (
      <g>
        <circle cx={at[0]} cy={at[1]} r={16} fill="#ffd38a" stroke={GEAR_EDGE} strokeWidth={1.5} />
        <circle cx={at[0]} cy={at[1]} r={5} fill="none" stroke={GEAR_EDGE} strokeWidth={2} />
      </g>
    );
  }
  if (gear.kind === "band" && !isSide(body)) {
    return (
      <path
        d={`M ${body.wristL[0]} ${body.wristL[1]} Q 160 70 ${body.wristR[0]} ${body.wristR[1]}`}
        fill="none"
        stroke="#f0c14a"
        strokeWidth={5}
        strokeLinecap="round"
      />
    );
  }
  return null;
}

function Arrow({ from, to }: { from: Pt; to: Pt }) {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const head = 14;
  const x1 = to[0] + Math.cos(angle + 2.6) * head;
  const y1 = to[1] + Math.sin(angle + 2.6) * head;
  const x2 = to[0] + Math.cos(angle - 2.6) * head;
  const y2 = to[1] + Math.sin(angle - 2.6) * head;
  return (
    <g>
      <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={ARROW} strokeWidth={5} strokeLinecap="round" />
      <polygon points={`${to[0]},${to[1]} ${x1},${y1} ${x2},${y2}`} fill={ARROW} />
    </g>
  );
}

function ArcArrow({ cx, cy, r, a0, a1 }: { cx: number; cy: number; r: number; a0: number; a1: number }) {
  const point = (deg: number): Pt => {
    const rad = (deg * Math.PI) / 180;
    return [cx + Math.cos(rad) * r, cy + Math.sin(rad) * r];
  };
  const start = point(a0);
  const end = point(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  const tangent = ((a1 + (a1 > a0 ? 90 : -90)) * Math.PI) / 180;
  const hx = end[0] + Math.cos(tangent) * 2;
  const hy = end[1] + Math.sin(tangent) * 2;
  return (
    <g>
      <path
        d={`M ${start[0]} ${start[1]} A ${r} ${r} 0 ${large} ${sweep} ${end[0]} ${end[1]}`}
        fill="none"
        stroke={ARROW}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <Arrow from={[hx, hy]} to={end} />
    </g>
  );
}

function Motions({ motion }: { motion: Motion[] }) {
  return (
    <g>
      {motion.map((item, index) => {
        if (item.type === "guide") {
          return (
            <line
              key={index}
              x1={item.from[0]}
              y1={item.from[1]}
              x2={item.to[0]}
              y2={item.to[1]}
              stroke={ARROW}
              strokeWidth={3}
              strokeDasharray="7 6"
              strokeLinecap="round"
            />
          );
        }
        if (item.type === "arc") return <ArcArrow key={index} {...item} />;
        return <Arrow key={index} from={item.from} to={item.to} />;
      })}
    </g>
  );
}

function Stage({ scene }: { scene: Scene }) {
  const fixed = scene.gear?.filter((gear) => ["pad", "seat", "step", "platform", "bike", "cable"].includes(gear.kind)) ?? [];
  const held = scene.gear?.filter((gear) => !["pad", "seat", "step", "platform", "bike"].includes(gear.kind)) ?? [];
  const back = scene.view === "back";
  return (
    <g>
      {fixed.map((gear, index) => (
        <FixedGear key={index} gear={gear} />
      ))}
      {scene.ghost ? (
        isSide(scene.ghost) ? (
          <SidePerson body={scene.ghost} ghost />
        ) : (
          <FrontPerson body={scene.ghost} ghost back={back} />
        )
      ) : null}
      {scene.ghost
        ? held.map((gear, index) => <HeldGear key={`g-${index}`} gear={gear} body={scene.ghost as SideBody | FrontBody} />)
        : null}
      {isSide(scene.body) ? <SidePerson body={scene.body} /> : <FrontPerson body={scene.body} back={back} />}
      {held.map((gear, index) => (
        <HeldGear key={`m-${index}`} gear={gear} body={scene.body} />
      ))}
      {scene.motion ? <Motions motion={scene.motion} /> : null}
    </g>
  );
}

export function ExerciseFigure({ pose, label }: { pose: PoseId; label: string }) {
  const scene = SCENES[pose];
  return (
    <svg
      viewBox="0 0 320 220"
      width={320}
      height={220}
      role="img"
      aria-label={`Cómo hacer ${label}: la figura naranja marca la posición y la flecha el movimiento`}
      className="block h-auto w-full max-w-full"
    >
      <rect width="320" height="220" fill="#101318" />
      <line x1="28" y1="200" x2="292" y2="200" stroke="#343246" strokeWidth="4" strokeLinecap="round" />
      <Stage scene={scene} />
    </svg>
  );
}
