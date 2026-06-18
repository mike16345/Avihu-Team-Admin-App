import React from "react";
import { FaRegStar, FaStar } from "react-icons/fa6";
import { useFavoriteDietPresets } from "@/hooks/useFavoriteDietPresets";

interface DietFavoriteStarProps {
  presetId?: string;
  size?: number;
  buttonSize?: "sm" | "md";
}

const getButtonSizeClassName = (buttonSize: "sm" | "md") => {
  if (buttonSize === "sm") return "h-7 w-7";
  return "h-8 w-8";
};

const getFavoriteLabel = (active: boolean) => {
  if (active) return "הסר ממועדפים";
  return "הוסף למועדפים";
};

const getFavoriteButtonClassName = (active: boolean) => {
  if (active) {
    return "bg-amber-50 text-amber-500 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300";
  }

  return "bg-transparent text-slate-300 hover:bg-slate-100 hover:text-amber-400 dark:text-slate-600 dark:hover:bg-slate-800";
};

const getFavoriteIcon = (active: boolean) => {
  if (active) return FaStar;
  return FaRegStar;
};

const DietFavoriteStar: React.FC<DietFavoriteStarProps> = ({
  presetId,
  size = 13,
  buttonSize = "md",
}) => {
  const { isFavorite, toggle } = useFavoriteDietPresets();
  const active = isFavorite(presetId);
  const label = getFavoriteLabel(active);
  const StarIcon = getFavoriteIcon(active);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        toggle(presetId);
      }}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`${getButtonSizeClassName(
        buttonSize
      )} flex shrink-0 items-center justify-center rounded-lg transition-all ${getFavoriteButtonClassName(
        active
      )}`}
    >
      <StarIcon size={size} />
    </button>
  );
};

export default DietFavoriteStar;
