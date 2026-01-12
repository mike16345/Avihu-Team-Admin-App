import { fetchData } from "@/API/api";
import { FormResponse } from "@/interfaces/IFormResponse";
import { ApiResponse } from "@/types/types";

const FORM_RESPONSES_API = "/presets/forms/responses";

const useFormResponsesApi = () => {
  const getFormResponses = (params?: { userId?: string }) =>
    fetchData<ApiResponse<FormResponse[]>>(FORM_RESPONSES_API, params);

  const getFormResponseById = (id: string) =>
    fetchData<ApiResponse<FormResponse>>(FORM_RESPONSES_API + "/one", { id });

  return {
    getFormResponses,
    getFormResponseById,
  };
};

export default useFormResponsesApi;
