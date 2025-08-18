import useExercisePresetApi from "@/hooks/api/useExercisePresetApi";
import { IMutationProps } from "@/interfaces/interfaces";
import { IExercisePresetItem } from "@/interfaces/IWorkoutPlan";
import { useMutation } from "@tanstack/react-query";

const useUpdateExercise = ({ onSuccess, onError }: IMutationProps<IExercisePresetItem>) => {
  const { updateExercise } = useExercisePresetApi();

  return useMutation({
    mutationFn: ({
      id,
      exercise,
      imageToDelete,
      imageToUpload,
    }: {
      id: string;
      exercise: IExercisePresetItem;
      imageToUpload?: string;
      imageToDelete?: string;
    }) => updateExercise(id, exercise, imageToUpload, imageToDelete),
    onSuccess,
    onError,
  });
};

export default useUpdateExercise;
