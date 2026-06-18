import { deleteItem, fetchData, updateItem } from "@/API/api";
import { FormResponse } from "@/interfaces/IFormResponse";
import { ApiResponse } from "@/types/types";

const FORM_RESPONSES_API = "/presets/forms/responses";

const useFormResponsesApi = () => {
  const getFormResponses = (params?: { userId?: string }) =>
    fetchData<ApiResponse<FormResponse[]>>(FORM_RESPONSES_API, params);

  const getFormResponseById = (id: string) =>
    fetchData<ApiResponse<FormResponse>>(FORM_RESPONSES_API + "/one", { id });

  const getFormResponseByQuery = (query: Partial<FormResponse> = {}) => {
    return fetchData<ApiResponse<FormResponse>>(FORM_RESPONSES_API + "/response/one", query);
  };

  const getUsersLatestResponse = (userId: string) => {
    return fetchData<ApiResponse<FormResponse>>(FORM_RESPONSES_API + "/user/latest", { userId });
  };

  const updateFormResponse = (id: string, updatedResponse: Partial<FormResponse>) => {
    return updateItem<ApiResponse<FormResponse>>(
      FORM_RESPONSES_API + "/one",
      updatedResponse,
      undefined,
      { id }
    );
  };

  const toggleIsCheckedResponse = (id: string, isChecked: boolean) => {
    return updateItem<ApiResponse<FormResponse>>(FORM_RESPONSES_API + "/one/check-off", {
      id,
      isChecked,
    });
  };

  const deleteFormById = (id: string) => {
    return deleteItem<ApiResponse<null>>(FORM_RESPONSES_API + "/one", { id });
  };

  return {
    getFormResponses,
    getFormResponseById,
    getFormResponseByQuery,
    deleteFormById,
    updateFormResponse,
    toggleIsCheckedResponse,
    getUsersLatestResponse,
  };
};

export default useFormResponsesApi;
