import useExercisePresetApi from "@/hooks/api/useExercisePresetApi";
import { IMutationProps } from "@/interfaces/interfaces";
import { IExercisePresetItem } from "@/interfaces/IWorkoutPlan";
import { useMutation } from "@tanstack/react-query";

const useUpdateExercise = ({ onSuccess, onError }: IMutationProps<IExercisePresetItem>) => {
  const { updateExercise } = useExercisePresetApi();

  return useMutation({
    mutationFn: ({ id, exercise }: { id: string; exercise: IExercisePresetItem }) =>
      updateExercise(id, exercise),
    onSuccess,
    onError,
  });
};

export default useUpdateExercise;
