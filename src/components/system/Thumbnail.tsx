import { exercisePhoto, mealPhoto, type Photo } from "../../data/photos.ts";
import type { PoseId } from "../../data/poses.ts";
import { useExerciseView } from "../../lib/exerciseView.ts";
import { CoachView } from "../CoachView.tsx";
import { ExerciseGlyph } from "../ExerciseGlyph.tsx";

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

export function ExerciseThumb({ pose, name }: { pose: PoseId; name?: string }) {
  const { mode } = useExerciseView();
  const photo = exercisePhoto(pose, name);
  if (mode === "figures" || !photo) {
    return (
      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-row bg-ink text-cream">
        {mode === "figures" ? (
          <CoachView pose={pose} decorative className="size-10" />
        ) : (
          <ExerciseGlyph pose={pose} label={name ?? ""} decorative className="size-10" />
        )}
      </span>
    );
  }
  return <Thumbnail photo={photo} />;
}
