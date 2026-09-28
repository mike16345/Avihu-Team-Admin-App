import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMonthlyExerciseGoalsApi } from "@/hooks/api/useMonthlyExerciseGoalsApi";
import { IMonthlyExerciseGoal } from "@/interfaces/IMonthlyExerciseGoal";

const KEY = "monthly-exercise-goals";

export const useMonthlyExerciseGoals = (userId?: string) => {
  const { list } = useMonthlyExerciseGoalsApi();
  return useQuery<IMonthlyExerciseGoal[]>({
    queryKey: [KEY, userId],
    queryFn: () => list(userId!),
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useUpsertMonthlyExerciseGoal = (userId: string) => {
  const { upsert } = useMonthlyExerciseGoalsApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, userId] });
    },
  });
};

export const useDeleteMonthlyExerciseGoal = (userId: string) => {
  const { remove } = useMonthlyExerciseGoalsApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ exercise }: { exercise: string }) => remove(userId, exercise),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, userId] });
    },
  });
};
