import useCardioWorkoutApi from "@/hooks/api/useCardioWorkoutPreset";
import { IMutationProps } from "@/interfaces/interfaces";
import { ICardioExerciseItem } from "@/interfaces/IWorkoutPlan";
import { useMutation } from "@tanstack/react-query";

const useAddCardioWorkout = ({ onSuccess, onError }: IMutationProps<ICardioExerciseItem>) => {
  const { addCardioWorkout } = useCardioWorkoutApi();

  return useMutation({
    mutationFn: addCardioWorkout,
    onSuccess: onSuccess,
    onError: onError,
  });
};

export default useAddCardioWorkout;
