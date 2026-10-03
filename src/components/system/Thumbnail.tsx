import { exercisePhoto, mealPhoto, type Photo } from "../../data/photos.ts";
import type { PoseId } from "../../data/poses.ts";
import { ExerciseGlyph } from "../ExerciseGlyph.tsx";
import { useExerciseView } from "../../lib/exerciseView.ts";

/** Miniatura de lista. La foto grande vive en el modal, no aquí. */
export function Thumbnail({ photo }: { photo: Photo }) {
  return (
    <img
      src={photo.src}
      alt=""
      aria-hidden="true"
      className="size-10 shrink-0 rounded-row object-cover"
    />
  );
}

export function MealThumb({ ingredients }: { ingredients: readonly string[] }) {
  return <Thumbnail photo={mealPhoto(ingredients)} />;
}

export function ExerciseThumb({ pose }: { pose: PoseId }) {
  const { mode } = useExerciseView();
  if (mode === "figures") {
    return (
      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-row bg-ink text-cream">
        <ExerciseGlyph pose={pose} label="" decorative className="size-10" />
      </span>
    );
  }
  return <Thumbnail photo={exercisePhoto(pose)} />;
}
