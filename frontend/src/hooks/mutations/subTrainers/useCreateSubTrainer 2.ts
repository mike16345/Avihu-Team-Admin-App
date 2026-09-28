import { useSubTrainersApi } from "@/hooks/api/useSubTrainersApi";
import { CreateSubTrainerBody, SubTrainer } from "@/interfaces/trainers";
import { subTrainerKeys } from "@/hooks/queries/subTrainers/subTrainerKeys";
import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";

type CreateSubTrainerOptions = Omit<
  UseMutationOptions<SubTrainer, unknown, CreateSubTrainerBody>,
  "mutationFn"
>;

export const useCreateSubTrainer = (options?: CreateSubTrainerOptions) => {
  const { createSubTrainer } = useSubTrainersApi();
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ body, trainerId }: any) => createSubTrainer({ ...body, trainerId }),
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<SubTrainer[]>(subTrainerKeys.list(), (current) => {
        if (!current) return current;
        return [data, ...current.filter((subTrainer) => subTrainer._id !== data._id)];
      });
      queryClient.invalidateQueries({ queryKey: subTrainerKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};
