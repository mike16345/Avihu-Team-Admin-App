import useExercisePresetApi from "@/hooks/api/useExercisePresetApi";
import { IMutationProps } from "@/interfaces/interfaces";
import { IExercisePresetItem } from "@/interfaces/IWorkoutPlan";
import { useMutation } from "@tanstack/react-query";

const useAddExercise = ({ onSuccess, onError }: IMutationProps<IExercisePresetItem>) => {
  const { addExercise } = useExercisePresetApi();

  return useMutation({
    mutationFn: ({ exercise, image }: { exercise: IExercisePresetItem; image?: string }) =>
      addExercise(exercise, image),
    onSuccess,
    onError,
  });
};

export default useAddExercise;
