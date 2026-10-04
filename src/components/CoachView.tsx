import { useEffect, useRef, useState } from "react";
import type { PoseId } from "../data/poses.ts";
import { motionFor } from "../lib/coachSample.ts";
import { attachCoachView, type CoachHandle } from "../lib/coachStage.ts";
import { cn } from "../lib/utils.ts";

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

/** Coach del GLB. Varias vistas comparten un solo renderer. */
export function CoachView({
  pose,
  label = "",
  className,
  decorative = false,
  hero = false,
}: {
  pose: PoseId;
  label?: string;
  className?: string;
  decorative?: boolean;
  hero?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<CoachHandle | null>(null);
  const reduced = usePrefersReducedMotion();
  const motion = motionFor(pose);
  const name = label ? `${label}. ${motion.blurb}` : motion.blurb;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handle = attachCoachView(canvas, { pose, reduced, hero });
    handleRef.current = handle;
    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      handle.setSize(rect.width, rect.height);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      handle.destroy();
      handleRef.current = null;
    };
  }, [hero, pose, reduced]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("bg-transparent", className)}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : name}
    />
  );
}
