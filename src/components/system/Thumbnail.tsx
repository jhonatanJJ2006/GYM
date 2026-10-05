import { mealPhoto, type Photo } from "../../data/photos.ts";
import type { PoseId } from "../../data/poses.ts";
import { CoachView } from "../CoachView.tsx";

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

/** Los ejercicios siempre muestran el coach 3D, también en miniatura. */
export function ExerciseThumb({ pose }: { pose: PoseId; name?: string }) {
  return (
    <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-row bg-ink text-cream">
      <CoachView pose={pose} decorative className="size-10" />
    </span>
  );
}
