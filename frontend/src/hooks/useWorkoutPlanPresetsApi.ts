import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { ICompleteWorkoutPlan, IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";

const WORKOUT_PLAN_ENDPOINT = "workoutPlansPresets/";

export const useWorkoutPlanPresetApi = () => {/* 
  

  

  const updateWorkoutPlanByUserId = (userID: string, workoutPlan: ICompleteWorkoutPlan) =>
    updateItem(`${WORKOUT_PLAN_ENDPOINT}user/${userID}`, workoutPlan);

  */

  const getAllWorkoutPlanPresets = () => fetchData<IWorkoutPlanPreset[]>(WORKOUT_PLAN_ENDPOINT);

  const getWorkoutPlanPresetById = (presetID: string) =>
    fetchData<IWorkoutPlanPreset>(WORKOUT_PLAN_ENDPOINT + presetID);

  const addWorkoutPlanPreset = (workoutPlan: IWorkoutPlanPreset) => sendData<IWorkoutPlanPreset>(WORKOUT_PLAN_ENDPOINT, workoutPlan);

  const deleteWorkoutPlanPreset = (presetID: string) => deleteItem(WORKOUT_PLAN_ENDPOINT, presetID);

  const updateWorkoutPlanPreset = (presetID: string, workoutPlanPreset: IWorkoutPlanPreset) =>
    updateItem(WORKOUT_PLAN_ENDPOINT + presetID, workoutPlanPreset);


  return {
    getAllWorkoutPlanPresets,
    addWorkoutPlanPreset,
    deleteWorkoutPlanPreset,
    getWorkoutPlanPresetById,
    updateWorkoutPlanPreset
    /* getWorkoutPlan,
    getWorkoutPlanByUserId,
    deleteWorkoutPlan,
    updateWorkoutPlanByUserId,
    updateWorkoutPlan,
    addWorkoutPlan, */
  };
};
