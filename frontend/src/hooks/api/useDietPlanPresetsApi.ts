import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IDietPlanPreset } from "@/interfaces/IDietPlan";
import { IDietPlanV2Preset } from "@/interfaces/IDietPlanV2";
import { ApiResponse } from "@/types/types";

const DIET_PLAN_PRESET_ENDPOINT = "presets/dietPlans";

export const useDietPlanPresetApi = () => {
  const addDietPlanPreset = (dietPlan: IDietPlanPreset) =>
    sendData<ApiResponse<IDietPlanPreset>>(DIET_PLAN_PRESET_ENDPOINT, dietPlan);

  const updateDietPlanPreset = (planId: string, dietPlan: IDietPlanPreset) =>
    updateItem<ApiResponse<IDietPlanPreset>>(
      `${DIET_PLAN_PRESET_ENDPOINT}/one?id=${planId}`,
      dietPlan
    );

  const deleteDietPlanPreset = (planId: string) =>
    deleteItem(`${DIET_PLAN_PRESET_ENDPOINT}/one?id=${planId}`);

  const getDietPlanPreset = (id: string) =>
    fetchData<ApiResponse<IDietPlanPreset | IDietPlanV2Preset>>(
      `${DIET_PLAN_PRESET_ENDPOINT}/one?id=${id}`
    );

  const getAllDietPlanPresets = () =>
    fetchData<ApiResponse<IDietPlanPreset[]>>(DIET_PLAN_PRESET_ENDPOINT, { version: 1 });

  const addDietPlanV2Preset = (preset: IDietPlanV2Preset) =>
    sendData<ApiResponse<IDietPlanV2Preset>>(DIET_PLAN_PRESET_ENDPOINT, preset);

  const updateDietPlanV2Preset = (presetId: string, preset: IDietPlanV2Preset) =>
    updateItem<ApiResponse<IDietPlanV2Preset>>(
      `${DIET_PLAN_PRESET_ENDPOINT}/one?id=${presetId}`,
      preset
    );

  const getAllDietPlanV2Presets = () =>
    fetchData<ApiResponse<IDietPlanV2Preset[]>>(DIET_PLAN_PRESET_ENDPOINT, { version: 2 });

  return {
    addDietPlanPreset,
    updateDietPlanPreset,
    deleteDietPlanPreset,
    getDietPlanPreset,
    getAllDietPlanPresets,
    addDietPlanV2Preset,
    updateDietPlanV2Preset,
    getAllDietPlanV2Presets,
  };
};
