import { useTrainersApi } from "@/hooks/api/useTrainersApi";
import { CreateTrainerBody, Trainer } from "@/interfaces/trainers";
import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { trainerKeys } from "@/hooks/queries/trainers/trainerKeys";

type CreateTrainerOptions = Omit<UseMutationOptions<Trainer, unknown, CreateTrainerBody>, "mutationFn">;

export const useCreateTrainer = (options?: CreateTrainerOptions) => {
  const { createTrainer } = useTrainersApi();
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createTrainer,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<Trainer[]>(trainerKeys.list(), (current) => {
        if (!current) return current;
        return [data, ...current.filter((trainer) => trainer._id !== data._id)];
      });
      queryClient.invalidateQueries({ queryKey: trainerKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};
