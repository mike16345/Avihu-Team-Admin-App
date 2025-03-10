import useExercisePresetApi from "@/hooks/api/useExercisePresetApi";
import { IMutationProps } from "@/interfaces/interfaces";
import { IExercisePresetItem } from "@/interfaces/IWorkoutPlan";
import { useMutation } from "@tanstack/react-query";

const useAddExercise = ({ onSuccess, onError }: IMutationProps<IExercisePresetItem>) => {
  const { addExercise } = useExercisePresetApi();

  return useMutation({
    mutationFn: (exercise: IExercisePresetItem) => addExercise(exercise),
    onSuccess,
    onError,
  });
};

export default useAddExercise;
