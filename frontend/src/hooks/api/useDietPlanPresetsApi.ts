import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IDietPlanPreset } from "@/interfaces/IDietPlan";
import { ApiResponse } from "@/types/types";

const DIET_PLAN_PRESET_ENDPOINT = "presets/dietPlans";

export const useDietPlanPresetApi = () => {
  const addDietPlanPreset = (dietPlan: IDietPlanPreset) =>
    sendData<ApiResponse<IDietPlanPreset>>(DIET_PLAN_PRESET_ENDPOINT, dietPlan).then(
      (res) => res.data
    );

  const updateDietPlanPreset = (planId: string, dietPlan: IDietPlanPreset) =>
    updateItem(`${DIET_PLAN_PRESET_ENDPOINT}/one?id=${planId}`, dietPlan);

  const deleteDietPlanPreset = (planId: string) =>
    deleteItem(`${DIET_PLAN_PRESET_ENDPOINT}/one?id=${planId}`);

  const getDietPlanPreset = (id: string) =>
    fetchData<ApiResponse<IDietPlanPreset>>(`${DIET_PLAN_PRESET_ENDPOINT}/one?id=${id}`).then(
      (res => res.data)
    );
  const getAllDietPlanPresets = () =>
    fetchData<ApiResponse<IDietPlanPreset[]>>(DIET_PLAN_PRESET_ENDPOINT).then((res) => res.data);

  return {
    addDietPlanPreset,
    updateDietPlanPreset,
    deleteDietPlanPreset,
    getDietPlanPreset,
    getAllDietPlanPresets,
  };
};
