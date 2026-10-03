import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { FIGURE_MOTIONS, playback, type Gear, type Joints, type Layout, type Motion } from "../data/figureMotions.ts";
import type { PoseId } from "../data/poses.ts";
import { cn } from "../lib/utils.ts";

const TORSO = 40;
const SHOULDER = 32;
const UPPER = 22;
const FORE = 18;
const THIGH = 28;
const SHIN = 26;
const FOOT = 12;

const LAYOUT: Record<Layout, string> = {
  stand: "translate(104 84)",
  sit: "translate(92 78)",
  kneel: "translate(96 98)",
  supine: "translate(116 80) rotate(-90)",
  prone: "translate(116 76) rotate(-90) scale(1 -1)",
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  return reduced;
}

function numbers(frames: Joints[], pick: (frame: Joints) => number): string | null {
  const values = frames.map(pick);
  if (values.every((value) => value === values[0])) return null;
  return values.join(";");
}

function shifts(frames: Joints[]): string | null {
  const values = frames.map((frame) => `${frame.shift} ${frame.lift}`);
  if (values.every((value) => value === values[0])) return null;
  return values.join(";");
}

function Spin({
  still,
  values,
  dur,
  children,
}: {
  still: number;
  values: string | null;
  dur: string;
  children: ReactNode;
}) {
  return (
    <g transform={`rotate(${still})`}>
      {values ? (
        <animateTransform attributeName="transform" type="rotate" values={values} dur={dur} repeatCount="indefinite" />
      ) : null}
      {children}
    </g>
  );
}

function Slide({
  still,
  values,
  dur,
  children,
}: {
  still: Joints;
  values: string | null;
  dur: string;
  children: ReactNode;
}) {
  return (
    <g transform={`translate(${still.shift} ${still.lift})`}>
      {values ? (
        <animateTransform attributeName="transform" type="translate" values={values} dur={dur} repeatCount="indefinite" />
      ) : null}
      {children}
    </g>
  );
}

function GearMark({ gear }: { gear: Gear }) {
  const props = {
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    opacity: 0.38,
  };
  return (
    <g {...props}>
      <line x1="16" y1="132" x2="184" y2="132" />
      {gear === "bench" ? (
        <>
          <rect x="38" y="100" width="124" height="7" rx="1" />
          <line x1="50" y1="107" x2="46" y2="126" />
          <line x1="150" y1="107" x2="154" y2="126" />
        </>
      ) : null}
      {gear === "incline" ? (
        <>
          <line x1="46" y1="112" x2="150" y2="112" />
          <line x1="46" y1="112" x2="78" y2="86" />
          <line x1="78" y1="86" x2="154" y2="86" />
          <line x1="58" y1="112" x2="54" y2="128" />
          <line x1="146" y1="100" x2="150" y2="128" />
        </>
      ) : null}
      {gear === "cable" ? (
        <>
          <line x1="26" y1="18" x2="26" y2="132" />
          <circle cx="26" cy="22" r="3" />
        </>
      ) : null}
      {gear === "bike" ? (
        <>
          <circle cx="72" cy="118" r="14" />
          <circle cx="132" cy="118" r="14" />
          <line x1="72" y1="118" x2="104" y2="96" />
          <line x1="104" y1="96" x2="132" y2="118" />
          <line x1="104" y1="96" x2="118" y2="118" />
        </>
      ) : null}
      {gear === "seat" ? <rect x="48" y="108" width="78" height="8" rx="1" /> : null}
      {gear === "band" ? <path d="M78 70h44" /> : null}
      {gear === "wheel" ? <circle cx="158" cy="124" r="8" /> : null}
      {gear === "bar" ? (
        <>
          <line x1="64" y1="128" x2="148" y2="128" />
          <line x1="70" y1="122" x2="70" y2="132" />
          <line x1="142" y1="122" x2="142" y2="132" />
        </>
      ) : null}
    </g>
  );
}

function Limb({
  still,
  values,
  dur,
  length,
  children,
}: {
  still: number;
  values: string | null;
  dur: string;
  length: number;
  children?: ReactNode;
}) {
  return (
    <Spin still={still} values={values} dur={dur}>
      <line x1="0" y1="0" x2="0" y2={length} />
      <g transform={`translate(0 ${length})`}>{children}</g>
    </Spin>
  );
}

function FigureBody({ motion, frames, animate }: { motion: Motion; frames: Joints[]; animate: boolean }) {
  const dur = motion.dur;
  const still = frames[0] ?? motion.frames[0];
  const arm = (side: "L" | "R", x: number) => {
    const upper = side === "L" ? "armL" : "armR";
    const elbow = side === "L" ? "elbL" : "elbR";
    return (
      <g key={side} transform={`translate(${x} ${-SHOULDER})`} opacity={side === "R" ? 0.42 : 1}>
        <Limb
          still={still[upper]}
          values={animate ? numbers(frames, (frame) => frame[upper]) : null}
          dur={dur}
          length={UPPER}
        >
          <Limb
            still={still[elbow]}
            values={animate ? numbers(frames, (frame) => frame[elbow]) : null}
            dur={dur}
            length={FORE}
          >
            <circle cx="0" cy="0" r="1.7" fill="currentColor" stroke="none" />
          </Limb>
        </Limb>
      </g>
    );
  };
  const leg = (side: "L" | "R", x: number) => {
    const thigh = side === "L" ? "thighL" : "thighR";
    const knee = side === "L" ? "kneeL" : "kneeR";
    const foot = side === "L" ? "footL" : "footR";
    return (
      <g key={side} transform={`translate(${x} 0)`} opacity={side === "R" ? 0.42 : 1}>
        <Limb
          still={still[thigh]}
          values={animate ? numbers(frames, (frame) => frame[thigh]) : null}
          dur={dur}
          length={THIGH}
        >
          <Limb
            still={still[knee]}
            values={animate ? numbers(frames, (frame) => frame[knee]) : null}
            dur={dur}
            length={SHIN}
          >
            <Spin still={still[foot]} values={animate ? numbers(frames, (frame) => frame[foot]) : null} dur={dur}>
              <line x1="0" y1="0" x2={FOOT} y2="0" />
            </Spin>
          </Limb>
        </Limb>
      </g>
    );
  };

  return (
    <Slide still={still} values={animate ? shifts(frames) : null} dur={dur}>
      <g transform={LAYOUT[motion.layout]}>
        <Spin still={still.lean} values={animate ? numbers(frames, (frame) => frame.lean) : null} dur={dur}>
          <line x1="0" y1="0" x2="0" y2={-TORSO} />
          <circle cx="0" cy={-TORSO - 9} r="7" />
          <line x1="-6" y1={-SHOULDER} x2="6" y2={-SHOULDER} />
          {arm("R", -5)}
          {arm("L", 0)}
        </Spin>
        {leg("R", -6)}
        {leg("L", 0)}
      </g>
    </Slide>
  );
}

export function ExerciseGlyph({
  pose,
  label,
  className,
  decorative = false,
}: {
  pose: PoseId;
  label: string;
  className?: string;
  decorative?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const motion = FIGURE_MOTIONS[pose];
  const frames = playback(motion);
  const name = label ? `${label}. ${motion.blurb}` : motion.blurb;
  return (
    <svg
      viewBox="0 0 200 150"
      className={cn("exercise-glyph text-cream", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.15}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : name}
    >
      <GearMark gear={motion.gear} />
      <FigureBody motion={motion} frames={frames} animate={!reduced} />
    </svg>
  );
}
