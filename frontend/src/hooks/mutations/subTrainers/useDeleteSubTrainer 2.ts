import { useSubTrainersApi } from "@/hooks/api/useSubTrainersApi";
import { SubTrainer, SubTrainerId } from "@/interfaces/trainers";
import { subTrainerKeys } from "@/hooks/queries/subTrainers/subTrainerKeys";
import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";

type DeleteSubTrainerOptions = Omit<
  UseMutationOptions<SubTrainer | null, unknown, SubTrainerId>,
  "mutationFn"
>;

export const useDeleteSubTrainer = (options?: DeleteSubTrainerOptions) => {
  const { deleteSubTrainer } = useSubTrainersApi();
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteSubTrainer,
    onSuccess: (data, variables, context) => {
      queryClient.removeQueries({ queryKey: subTrainerKeys.detail(variables) });
      queryClient.setQueryData<SubTrainer[]>(subTrainerKeys.list(), (current) => {
        if (!current) return current;
        return current.filter((subTrainer) => subTrainer._id !== variables);
      });
      queryClient.invalidateQueries({ queryKey: subTrainerKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};
