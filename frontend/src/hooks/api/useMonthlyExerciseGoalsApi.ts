import { fetchData, updateItem, deleteItem } from "@/API/api";
import { ApiResponse } from "@/types/types";
import { IMonthlyExerciseGoal } from "@/interfaces/IMonthlyExerciseGoal";

const ENDPOINT = "monthlyExerciseGoals";

export const useMonthlyExerciseGoalsApi = () => {
  const list = (userId: string) =>
    fetchData<ApiResponse<IMonthlyExerciseGoal[]>>(`${ENDPOINT}?userId=${userId}`).then(
      (res) => res.data
    );

  const upsert = (payload: {
    userId: string;
    exercise: string;
    targetWeight: number;
    targetReps: number;
    note?: string;
  }) =>
    updateItem<ApiResponse<IMonthlyExerciseGoal>>(ENDPOINT, payload).then((res) => res.data);

  const remove = (userId: string, exercise: string) => {
    const q = `userId=${encodeURIComponent(userId)}&exercise=${encodeURIComponent(exercise)}`;
    return deleteItem<ApiResponse<{ ok: boolean }>>(`${ENDPOINT}?${q}`);
  };

  return { list, upsert, remove };
};
