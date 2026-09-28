import { QueryKeys } from "@/enums/QueryKeys";
import { useFavoritePresetIds } from "@/hooks/useFavoritePresetIds";

export function useFavoriteWorkoutPresets() {
  return useFavoritePresetIds({
    field: "favoriteWorkoutPresetIds",
    queryKey: QueryKeys.WORKOUT_PRESETS,
    errorMessage: "עדכון המועדפים של תבניות האימון נכשל",
  });
}
