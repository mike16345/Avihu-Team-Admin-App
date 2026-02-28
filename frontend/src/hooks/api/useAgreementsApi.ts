import { fetchData } from "@/API/api";
import { CurrentAgreement } from "@/interfaces/IAgreement";
import { ApiResponse } from "@/types/types";

const AGREEMENTS_ENDPOINT = "agreements";

export interface CurrentAgreementParams {
  agreementId?: string;
  groupId?: string;
}

export const useAgreementsApi = () => {
  const getCurrentAgreement = (params?: CurrentAgreementParams) =>
    fetchData<ApiResponse<CurrentAgreement>>(`${AGREEMENTS_ENDPOINT}/current`, params);

  return { getCurrentAgreement };
};

export default useAgreementsApi;
