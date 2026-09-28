import { useTrainersApi } from "@/hooks/api/useTrainersApi";
import { Trainer, TrainerId } from "@/interfaces/trainers";
import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { trainerKeys } from "@/hooks/queries/trainers/trainerKeys";

type DeleteTrainerOptions = Omit<UseMutationOptions<Trainer | null, unknown, TrainerId>, "mutationFn">;

export const useDeleteTrainer = (options?: DeleteTrainerOptions) => {
  const { deleteTrainer } = useTrainersApi();
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteTrainer,
    onSuccess: (data, variables, context) => {
      queryClient.removeQueries({ queryKey: trainerKeys.detail(variables) });
      queryClient.setQueryData<Trainer[]>(trainerKeys.list(), (current) => {
        if (!current) return current;
        return current.filter((trainer) => trainer._id !== variables);
      });
      queryClient.invalidateQueries({ queryKey: trainerKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};
