import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { ICompleteWorkoutPlan, IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";

const WORKOUT_PLAN_ENDPOINT = "workoutPlansPresets/";

export const useWorkoutPlanPresetApi = () => {/* 
  

  const updateWorkoutPlan = (userID: string, workoutPlan: ICompleteWorkoutPlan) =>
    updateItem(`${WORKOUT_PLAN_ENDPOINT}${userID}`, workoutPlan);

  const updateWorkoutPlanByUserId = (userID: string, workoutPlan: ICompleteWorkoutPlan) =>
    updateItem(`${WORKOUT_PLAN_ENDPOINT}user/${userID}`, workoutPlan);

  const deleteWorkoutPlan = (userID: string) => deleteItem(`${WORKOUT_PLAN_ENDPOINT}`, userID);

  const getWorkoutPlanByUserId = (userID: string) =>
    fetchData<ICompleteWorkoutPlan>(`${WORKOUT_PLAN_ENDPOINT}user/${userID}`);

  const getWorkoutPlan = (id: string) =>
    fetchData<ICompleteWorkoutPlan>(WORKOUT_PLAN_ENDPOINT + id); */

  const getAllWorkoutPlanPresets = () => fetchData<IWorkoutPlanPreset[]>(WORKOUT_PLAN_ENDPOINT);

  const addWorkoutPlanPreset = (workoutPlan: IWorkoutPlanPreset) => sendData<IWorkoutPlanPreset>(WORKOUT_PLAN_ENDPOINT, workoutPlan);


  return {
    getAllWorkoutPlanPresets,
    addWorkoutPlanPreset
    /* getWorkoutPlan,
    getWorkoutPlanByUserId,
    deleteWorkoutPlan,
    updateWorkoutPlanByUserId,
    updateWorkoutPlan,
    addWorkoutPlan, */
  };
};
