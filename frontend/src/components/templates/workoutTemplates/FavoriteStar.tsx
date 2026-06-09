/**
 * FavoriteStar — small toggle button used on every workout-preset
 * card (grid + WorkoutPresetPicker modal) to mark/unmark favourites.
 *
 * RTL-aware: sits at the leading edge of the card (top-right in
 * Hebrew). Stops propagation so toggling never opens the underlying
 * card. Optimistic UI — toggles instantly via the shared in-memory
 * store (see `useFavoriteWorkoutPresets`).
 */
import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa6";
import { useFavoriteWorkoutPresets } from "@/hooks/useFavoriteWorkoutPresets";

interface FavoriteStarProps {
  presetId?: string;
  size?: number;
  /** Size of the surrounding hit-target button. */
  buttonSize?: "sm" | "md";
}

const FavoriteStar: React.FC<FavoriteStarProps> = ({
  presetId,
  size = 13,
  buttonSize = "md",
}) => {
  const { isFavorite, toggle } = useFavoriteWorkoutPresets();
  const active = isFavorite(presetId);
  const dims = buttonSize === "sm" ? "h-7 w-7" : "h-8 w-8";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle(presetId);
      }}
      aria-pressed={active}
      aria-label={active ? "הסר ממועדפים" : "הוסף למועדפים"}
      title={active ? "הסר ממועדפים" : "הוסף למועדפים"}
      className={`${dims} flex shrink-0 items-center justify-center rounded-lg transition-all ${
        active
          ? "bg-amber-50 text-amber-500 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
          : "bg-transparent text-slate-300 hover:bg-slate-100 hover:text-amber-400 dark:text-slate-600 dark:hover:bg-slate-800"
      }`}
    >
      {active ? <FaStar size={size} /> : <FaRegStar size={size} />}
    </button>
  );
};

export default FavoriteStar;
