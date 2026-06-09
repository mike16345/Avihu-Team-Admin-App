/**
 * DietFavoriteStar — toggle button for marking a diet preset as a
 * favourite. Mirror of FavoriteStar for the workout side; uses the
 * separate `useFavoriteDietPresets` hook so the two collections
 * don't share state.
 *
 * RTL-aware, primary affordance (always visible), amber when active,
 * slate when inactive. Stops propagation so it never opens the card.
 */
import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa6";
import { useFavoriteDietPresets } from "@/hooks/useFavoriteDietPresets";

interface DietFavoriteStarProps {
  presetId?: string;
  size?: number;
  buttonSize?: "sm" | "md";
}

const DietFavoriteStar: React.FC<DietFavoriteStarProps> = ({
  presetId,
  size = 13,
  buttonSize = "md",
}) => {
  const { isFavorite, toggle } = useFavoriteDietPresets();
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

export default DietFavoriteStar;
