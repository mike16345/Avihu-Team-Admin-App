import { useSubTrainersApi } from "@/hooks/api/useSubTrainersApi";
import { SubTrainer, SubTrainerId, UpdateSubTrainerBody } from "@/interfaces/trainers";
import { subTrainerKeys } from "@/hooks/queries/subTrainers/subTrainerKeys";
import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateSubTrainerVariables = {
  id: SubTrainerId;
  body: UpdateSubTrainerBody;
  trainerId?: string;
};

type UpdateSubTrainerOptions = Omit<
  UseMutationOptions<SubTrainer, unknown, UpdateSubTrainerVariables>,
  "mutationFn"
>;

export const useUpdateSubTrainer = (options?: UpdateSubTrainerOptions) => {
  const { updateSubTrainer } = useSubTrainersApi();
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, body, trainerId }: UpdateSubTrainerVariables) =>
      updateSubTrainer(id, { ...body, trainerId }),
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<SubTrainer[]>(subTrainerKeys.list(), (current) => {
        if (!current) return current;
        return current.map((subTrainer) => (subTrainer._id === variables.id ? data : subTrainer));
      });
      queryClient.invalidateQueries({ queryKey: subTrainerKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};
