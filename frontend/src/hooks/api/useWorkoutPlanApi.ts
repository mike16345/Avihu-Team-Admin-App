import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";

const WORKOUT_PLAN_ENDPOINT = "workoutPlans";

export const useWorkoutPlanApi = () => {
  const addWorkoutPlan = (userId: string, workoutPlan: ICompleteWorkoutPlan) => {
    const endpoint = WORKOUT_PLAN_ENDPOINT + userId;

    return sendData<ICompleteWorkoutPlan>(endpoint, workoutPlan);
  };

  const updateWorkoutPlan = (userId: string, workoutPlan: ICompleteWorkoutPlan) =>
    updateItem(`${WORKOUT_PLAN_ENDPOINT}/one`, workoutPlan, null, { userId });

  const updateWorkoutPlanByUserId = (userId: string, workoutPlan: ICompleteWorkoutPlan) =>
    updateItem(`${WORKOUT_PLAN_ENDPOINT}/one/user`, workoutPlan, null, { userId });

  const deleteWorkoutPlan = (userId: string) =>
    deleteItem(`${WORKOUT_PLAN_ENDPOINT}/one`, { userId });

  const getWorkoutPlanByUserId = (userId: string) =>
    fetchData<ApiResponse<ICompleteWorkoutPlan>>(`${WORKOUT_PLAN_ENDPOINT}/user`, { userId });

  const getWorkoutPlan = (id: string) =>
    fetchData<ICompleteWorkoutPlan>(WORKOUT_PLAN_ENDPOINT + id);

  return {
    getWorkoutPlan,
    getWorkoutPlanByUserId,
    deleteWorkoutPlan,
    updateWorkoutPlanByUserId,
    updateWorkoutPlan,
    addWorkoutPlan,
  };
};
