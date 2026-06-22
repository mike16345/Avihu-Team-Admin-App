import { QueryKeys } from "@/enums/QueryKeys";
import { useFavoritePresetIds } from "@/hooks/useFavoritePresetIds";

export function useFavoriteDietPresets() {
  return useFavoritePresetIds({
    field: "favoriteDietPresetIds",
    queryKey: QueryKeys.DIET_PLAN_PRESETS,
    errorMessage: "עדכון המועדפים של תפריטי התזונה נכשל",
  });
}
