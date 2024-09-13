import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";

const WORKOUT_PLAN_PRESETS_ENDPOINT = "presets/workoutPlans";

export const useWorkoutPlanPresetApi = () => {
  const getAllWorkoutPlanPresets = () =>
    fetchData<ApiResponse<IWorkoutPlanPreset[]>>(WORKOUT_PLAN_PRESETS_ENDPOINT);

  const getWorkoutPlanPresetById = (presetID: string) =>
    fetchData<ApiResponse<IWorkoutPlanPreset>>(WORKOUT_PLAN_PRESETS_ENDPOINT + `/one`, {
      presetID,
    });

  const addWorkoutPlanPreset = (workoutPlan: IWorkoutPlanPreset) =>
    sendData<IWorkoutPlanPreset>(WORKOUT_PLAN_PRESETS_ENDPOINT, workoutPlan);

  const deleteWorkoutPlanPreset = (presetID: string) =>
    deleteItem(WORKOUT_PLAN_PRESETS_ENDPOINT + `/one`, { presetID });

  const updateWorkoutPlanPreset = (presetID: string, workoutPlanPreset: IWorkoutPlanPreset) =>
    updateItem(WORKOUT_PLAN_PRESETS_ENDPOINT + `/one`, workoutPlanPreset, null, { presetID });

  return {
    getAllWorkoutPlanPresets,
    addWorkoutPlanPreset,
    deleteWorkoutPlanPreset,
    getWorkoutPlanPresetById,
    updateWorkoutPlanPreset,
  };
};
