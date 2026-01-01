import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IForm } from "@/interfaces/IForm";
import { ApiResponse } from "@/types/types";

const useFormPresetApi = () => {
  const FORM_PRESETS_API = `/presets/forms`;

  const getAllFormPresets = () => fetchData<ApiResponse<IForm[]>>(FORM_PRESETS_API);

  const getFormPresetById = (id: string) =>
    fetchData<ApiResponse<IForm>>(FORM_PRESETS_API + `/one`, { id: id });

  const updateFormPreset = (id: string, newFormPreset: IForm) =>
    updateItem(FORM_PRESETS_API + `/one`, newFormPreset, null, { id });

  const addFormPreset = (newFormPreset: IForm) => sendData<IForm>(FORM_PRESETS_API, newFormPreset);

  const deleteFormPreset = (id: string) => deleteItem(FORM_PRESETS_API + `/one`, { id });

  return {
    getAllFormPresets,
    getFormPresetById,
    updateFormPreset,
    addFormPreset,
    deleteFormPreset,
  };
};

export default useFormPresetApi;
