import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";

const WORKOUT_PLAN_ENDPOINT = "workoutPlans";

export const useWorkoutPlanApi = () => {
  const addWorkoutPlan = (userId: string, workoutPlan: ICompleteWorkoutPlan) => {
    return sendData<ICompleteWorkoutPlan>(WORKOUT_PLAN_ENDPOINT, workoutPlan, null, { id: userId });
  };

  const updateWorkoutPlan = (userId: string, workoutPlan: ICompleteWorkoutPlan) =>
    updateItem(`${WORKOUT_PLAN_ENDPOINT}/one`, workoutPlan, null, { userId });

  const updateWorkoutPlanByUserId = (userId: string, workoutPlan: ICompleteWorkoutPlan) =>
    updateItem<ApiResponse<ICompleteWorkoutPlan>>(
      `${WORKOUT_PLAN_ENDPOINT}/one/user`,
      workoutPlan,
      null,
      { userId }
    );

  const deleteWorkoutPlan = (userId: string) =>
    deleteItem(`${WORKOUT_PLAN_ENDPOINT}/one`, { userId });

  const getWorkoutPlanByUserId = (userId: string) =>
    fetchData<ApiResponse<ICompleteWorkoutPlan>>(`${WORKOUT_PLAN_ENDPOINT}/user`, { userId });

  const getWorkoutPlan = (id: string) =>
    fetchData<ICompleteWorkoutPlan>(WORKOUT_PLAN_ENDPOINT + id);

  const getWorkoutPlanHistory = (userId: string) =>
    fetchData<ApiResponse<ICompleteWorkoutPlan[]>>(`${WORKOUT_PLAN_ENDPOINT}/history`, { userId });

  const swapWorkoutPlan = (
    userId: string,
    payload: ICompleteWorkoutPlan & { temporaryUntil?: Date | string; assignmentLabel?: string }
  ) => sendData<ICompleteWorkoutPlan>(`${WORKOUT_PLAN_ENDPOINT}/swap`, payload, null, { userId });

  const restoreWorkoutPlan = (userId: string, archivedPlanId: string) =>
    sendData<ICompleteWorkoutPlan>(
      `${WORKOUT_PLAN_ENDPOINT}/restore`,
      { assignedBy: userId },
      null,
      {
        userId,
        archivedPlanId,
      }
    );

  return {
    getWorkoutPlan,
    getWorkoutPlanByUserId,
    deleteWorkoutPlan,
    updateWorkoutPlanByUserId,
    updateWorkoutPlan,
    addWorkoutPlan,
    getWorkoutPlanHistory,
    swapWorkoutPlan,
    restoreWorkoutPlan,
  };
};
