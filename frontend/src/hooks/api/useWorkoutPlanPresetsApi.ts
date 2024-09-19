import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";

const WORKOUT_PLAN_PRESETS_ENDPOINT = "presets/workoutPlans";

export const useWorkoutPlanPresetApi = () => {
  const getAllWorkoutPlanPresets = () =>
    fetchData<ApiResponse<IWorkoutPlanPreset[]>>(WORKOUT_PLAN_PRESETS_ENDPOINT);

  const getWorkoutPlanPresetById = (presetId: string) =>
    fetchData<ApiResponse<IWorkoutPlanPreset>>(WORKOUT_PLAN_PRESETS_ENDPOINT + `/one`, {
      presetId,
    }).then((res) => res.data);

  const addWorkoutPlanPreset = (workoutPlan: IWorkoutPlanPreset) =>
    sendData<IWorkoutPlanPreset>(WORKOUT_PLAN_PRESETS_ENDPOINT, workoutPlan);

  const deleteWorkoutPlanPreset = (presetId: string) =>
    deleteItem(WORKOUT_PLAN_PRESETS_ENDPOINT + `/one`, { presetId });

  const updateWorkoutPlanPreset = (presetId: string, workoutPlanPreset: IWorkoutPlanPreset) =>
    updateItem(WORKOUT_PLAN_PRESETS_ENDPOINT + `/one`, workoutPlanPreset, null, { presetId });

  return {
    getAllWorkoutPlanPresets,
    addWorkoutPlanPreset,
    deleteWorkoutPlanPreset,
    getWorkoutPlanPresetById,
    updateWorkoutPlanPreset,
  };
};
