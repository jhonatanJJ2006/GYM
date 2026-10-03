import { POSES, type Gear, type Pose, type PoseId } from "../data/poses.ts";

type Pt = [number, number];

const BODY = "#f4f0ea";
const DIM = "#8a8496";
const ACCENT = "#ffb086";
const GEAR = "#c9d4ff";

function end(from: Pt, deg: number, len: number): Pt {
  const rad = (deg * Math.PI) / 180;
  return [from[0] + Math.sin(rad) * len, from[1] - Math.cos(rad) * len];
}

function Line({ a, b, color, width }: { a: Pt; b: Pt; color: string; width: number }) {
  return (
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={width} strokeLinecap="round" />
  );
}

function GearMark({ hand, gear }: { hand: Pt; gear: Gear }) {
  if (gear === "none") return null;
  if (gear === "db") {
    return (
      <g>
        <Line a={[hand[0] - 11, hand[1]]} b={[hand[0] + 11, hand[1]]} color={GEAR} width={5} />
        <circle cx={hand[0] - 13} cy={hand[1]} r={5} fill={GEAR} />
        <circle cx={hand[0] + 13} cy={hand[1]} r={5} fill={GEAR} />
      </g>
    );
  }
  if (gear === "cable") {
    return (
      <g>
        <Line a={hand} b={[hand[0], 18]} color={GEAR} width={3} />
        <rect x={hand[0] - 8} y={10} width={16} height={10} rx={2} fill={GEAR} />
      </g>
    );
  }
  return (
    <g>
      <Line a={[hand[0] - 34, hand[1]]} b={[hand[0] + 34, hand[1]]} color={GEAR} width={5} />
      <circle cx={hand[0] - 30} cy={hand[1]} r={8} fill="none" stroke={GEAR} strokeWidth={3} />
      <circle cx={hand[0] + 30} cy={hand[1]} r={8} fill="none" stroke={GEAR} strokeWidth={3} />
    </g>
  );
}

function FigureSide({ pose }: { pose: Extract<Pose, { view: "side" }> }) {
  const shoulder = end(pose.hip, pose.torso, 48);
  const head = end(shoulder, pose.torso, 16);
  const elbow = end(shoulder, pose.arm[0], 26);
  const hand = end(elbow, pose.arm[1], 22);
  const knee = end(pose.hip, pose.leg[0], 32);
  const foot = end(knee, pose.leg[1], 30);
  const knee2 = pose.leg2 ? end(pose.hip, pose.leg2[0], 32) : null;
  const foot2 = pose.leg2 && knee2 ? end(knee2, pose.leg2[1], 30) : null;
  const elbow2 = pose.arm2 ? end(shoulder, pose.arm2[0], 26) : null;
  const hand2 = pose.arm2 && elbow2 ? end(elbow2, pose.arm2[1], 22) : null;
  const armColor = pose.accent === "arms" ? ACCENT : BODY;
  const legColor = pose.accent === "legs" ? ACCENT : BODY;
  const core = pose.accent === "core" ? ACCENT : BODY;

  return (
    <g>
      {pose.bench ? <rect x={70} y={pose.hip[1] + 6} width={130} height={12} rx={4} fill="#2a2833" /> : null}
      {pose.seat ? <rect x={pose.hip[0] - 28} y={pose.hip[1] + 8} width={46} height={10} rx={3} fill="#2a2833" /> : null}
      <line x1={28} y1={168} x2={214} y2={168} stroke="#3a3648" strokeWidth={2} />
      {knee2 && foot2 ? (
        <g>
          <Line a={pose.hip} b={knee2} color={DIM} width={8} />
          <Line a={knee2} b={foot2} color={DIM} width={8} />
        </g>
      ) : null}
      {elbow2 && hand2 ? (
        <g>
          <Line a={shoulder} b={elbow2} color={DIM} width={8} />
          <Line a={elbow2} b={hand2} color={DIM} width={8} />
        </g>
      ) : null}
      <Line a={shoulder} b={pose.hip} color={core} width={11} />
      <Line a={shoulder} b={head} color={core} width={8} />
      <circle cx={head[0]} cy={head[1]} r={11} fill={core} />
      <Line a={pose.hip} b={knee} color={legColor} width={10} />
      <Line a={knee} b={foot} color={legColor} width={10} />
      <Line a={shoulder} b={elbow} color={armColor} width={10} />
      <Line a={elbow} b={hand} color={armColor} width={10} />
      <GearMark hand={hand} gear={pose.gear} />
    </g>
  );
}

function FigureFront({ pose }: { pose: Extract<Pose, { view: "front" }> }) {
  const shoulderY = pose.hip[1] - 50 + (pose.lean ?? 0);
  const head: Pt = [pose.hip[0], shoulderY - 18];
  const shL: Pt = [pose.hip[0] - 16, shoulderY];
  const shR: Pt = [pose.hip[0] + 16, shoulderY];
  const elbowL = end(shL, pose.armL[0], 26);
  const handL = end(elbowL, pose.armL[1], 22);
  const elbowR = end(shR, pose.armR[0], 26);
  const handR = end(elbowR, pose.armR[1], 22);
  const kneeL = end([pose.hip[0] - 8, pose.hip[1]], pose.legL[0], 32);
  const footL = end(kneeL, pose.legL[1], 28);
  const kneeR = end([pose.hip[0] + 8, pose.hip[1]], pose.legR[0], 32);
  const footR = end(kneeR, pose.legR[1], 28);
  const armColor = pose.accent === "arms" || pose.accent === "core" ? ACCENT : BODY;
  const legColor = pose.accent === "legs" ? ACCENT : BODY;

  return (
    <g>
      <line x1={28} y1={168} x2={214} y2={168} stroke="#3a3648" strokeWidth={2} />
      <Line a={[pose.hip[0], shoulderY]} b={pose.hip} color={pose.accent === "core" ? ACCENT : BODY} width={12} />
      <circle cx={head[0]} cy={head[1]} r={12} fill={BODY} />
      <Line a={shL} b={elbowL} color={armColor} width={9} />
      <Line a={elbowL} b={handL} color={armColor} width={9} />
      <Line a={shR} b={elbowR} color={armColor} width={9} />
      <Line a={elbowR} b={handR} color={armColor} width={9} />
      <Line a={[pose.hip[0] - 8, pose.hip[1]]} b={kneeL} color={legColor} width={9} />
      <Line a={kneeL} b={footL} color={legColor} width={9} />
      <Line a={[pose.hip[0] + 8, pose.hip[1]]} b={kneeR} color={legColor} width={9} />
      <Line a={kneeR} b={footR} color={legColor} width={9} />
      {pose.gear === "db" ? (
        <>
          <GearMark hand={handL} gear="db" />
          <GearMark hand={handR} gear="db" />
        </>
      ) : null}
      {pose.gear === "bar" ? <GearMark hand={[(handL[0] + handR[0]) / 2, (handL[1] + handR[1]) / 2]} gear="bar" /> : null}
      {pose.gear === "cable" ? <GearMark hand={handR} gear="cable" /> : null}
    </g>
  );
}

export function ExerciseFigure({ pose, label }: { pose: PoseId; label: string }) {
  const spec = POSES[pose];
  return (
    <svg viewBox="0 0 240 186" role="img" aria-label={`Esquema de ${label}`} className="h-44 w-full">
      <rect width="240" height="186" rx="18" fill="#12111a" />
      {spec.view === "side" ? <FigureSide pose={spec} /> : <FigureFront pose={spec} />}
    </svg>
  );
}
