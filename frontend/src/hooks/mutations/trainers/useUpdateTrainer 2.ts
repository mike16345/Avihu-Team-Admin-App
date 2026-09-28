import { useTrainersApi } from "@/hooks/api/useTrainersApi";
import { Trainer, TrainerId, UpdateTrainerBody } from "@/interfaces/trainers";
import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { trainerKeys } from "@/hooks/queries/trainers/trainerKeys";

type UpdateTrainerVariables = {
  id: TrainerId;
  body: UpdateTrainerBody;
};

type UpdateTrainerOptions = Omit<
  UseMutationOptions<Trainer, unknown, UpdateTrainerVariables>,
  "mutationFn"
>;

export const useUpdateTrainer = (options?: UpdateTrainerOptions) => {
  const { updateTrainer } = useTrainersApi();
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, body }: UpdateTrainerVariables) => updateTrainer(id, body),
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<Trainer[]>(trainerKeys.list(), (current) => {
        if (!current) return current;
        return current.map((trainer) => (trainer._id === variables.id ? data : trainer));
      });
      queryClient.invalidateQueries({ queryKey: trainerKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};
