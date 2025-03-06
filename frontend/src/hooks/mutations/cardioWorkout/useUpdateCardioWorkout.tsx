import useCardioWorkoutApi from "@/hooks/api/useCardioWorkoutPreset";
import { IMutationProps } from "@/interfaces/interfaces";
import { ICardioExerciseItem } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";

import { useMutation } from "@tanstack/react-query";

const useUpdateCardiWorkout = ({
  onSuccess,
  onError,
}: IMutationProps<ApiResponse<ICardioExerciseItem>>) => {
  const { updateCardioWorkout } = useCardioWorkoutApi();

  return useMutation({
    mutationFn: ({ id, cardioWorkout }: { id: string; cardioWorkout: ICardioExerciseItem }) =>
      updateCardioWorkout(id, cardioWorkout),
    onSuccess,
    onError,
  });
};

export default useUpdateCardiWorkout;
