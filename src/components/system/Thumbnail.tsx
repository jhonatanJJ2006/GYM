import { exercisePhoto, mealPhoto, type Photo } from "../../data/photos.ts";
import type { PoseId } from "../../data/poses.ts";

/** Miniatura de lista. La foto grande vive en el modal, no aquí. */
export function Thumbnail({ photo }: { photo: Photo }) {
  return (
    <img
      src={photo.src}
      alt=""
      className="size-10 shrink-0 rounded-[var(--radius-row)] object-cover"
    />
  );
}

export function MealThumb({ ingredients }: { ingredients: readonly string[] }) {
  return <Thumbnail photo={mealPhoto(ingredients)} />;
}

export function ExerciseThumb({ pose }: { pose: PoseId }) {
  return <Thumbnail photo={exercisePhoto(pose)} />;
}
