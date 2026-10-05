import { exercisePhoto } from "../data/photos.ts";
import type { PoseId } from "../data/poses.ts";
import { CoachView } from "./CoachView.tsx";
import { useExerciseView } from "../lib/exerciseView.ts";
import { PhotoHero } from "./PhotoHero.tsx";

export function ExerciseFigure({ pose, label }: { pose: PoseId; label: string }) {
  const { mode } = useExerciseView();
  if (mode === "figures") {
    return (
      <figure className="relative m-0 overflow-hidden bg-ink">
        <CoachView pose={pose} label={label} hero className="block aspect-[4/3] w-full" />
      </figure>
    );
  }
  const photo = exercisePhoto(pose, label);
  if (!photo) {
    return (
      <figure className="relative m-0 overflow-hidden bg-ink">
        <CoachView pose={pose} label={label} hero className="block aspect-[4/3] w-full" />
      </figure>
    );
  }
  return <PhotoHero photo={{ ...photo, alt: `${label}. ${photo.alt}` }} />;
}
