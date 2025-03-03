import { QueryKeys } from "@/enums/QueryKeys";
import useCardioWorkoutApi from "@/hooks/api/useCardioWorkoutPreset";
import { onError, onSuccess } from "@/lib/query";

import { useMutation } from "@tanstack/react-query";

const useDeleteCardioWorkout = () => {
  const { deleteCardioWorkout } = useCardioWorkoutApi();

  return useMutation({
    mutationFn: (id: string) => deleteCardioWorkout(id),
    onSuccess: () => onSuccess(`שיטת ביצוע נמחקה בהצלחה!`, [QueryKeys.CARDIO_WORKOUT_PRESET]),
    onError: onError,
  });
};

export default useDeleteCardioWorkout;
