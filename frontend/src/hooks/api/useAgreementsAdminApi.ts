import { fetchData, sendData } from "@/API/api";
import {
  AgreementQuestionDefinition,
  AgreementTemplateUploadResponse,
  SignedAgreement,
} from "@/interfaces/IAgreement";
import { PaginationParams, PaginationResult } from "@/interfaces/interfaces";
import { ApiResponse } from "@/types/types";

const AGREEMENTS_ADMIN_ENDPOINT = "agreements/admin";

export interface SignedAgreementsParams extends Partial<PaginationParams> {
  adminId?: string;
  userId?: string;
  agreementId?: string;
  from?: string;
  to?: string;
}

export interface SignedAgreementDownloadParams {
  id: string;
  adminId?: string;
}

export interface AgreementTemplateUploadBody {
  agreementId?: string;
  groupId?: string;
  contentType: "application/pdf";
  adminId?: string;
}

export interface AgreementTemplateActivateBody {
  agreementId: string;
  version: number;
  groupId?: string;
  questions: AgreementQuestionDefinition[];
  adminId?: string;
}

export const useAgreementsAdminApi = () => {
  const getSignedAgreements = (params: SignedAgreementsParams) =>
    fetchData<ApiResponse<PaginationResult<SignedAgreement>>>(
      `${AGREEMENTS_ADMIN_ENDPOINT}/signed`,
      params
    );

  const getSignedAgreementDownloadUrl = (params: SignedAgreementDownloadParams) =>
    fetchData<ApiResponse<{ downloadUrl: string }>>(
      `${AGREEMENTS_ADMIN_ENDPOINT}/signed/download`,
      params
    );

  const createTemplateUploadUrl = (body: AgreementTemplateUploadBody) =>
    sendData<ApiResponse<AgreementTemplateUploadResponse>>(
      `${AGREEMENTS_ADMIN_ENDPOINT}/templates/upload-url`,
      body
    );

  const activateTemplate = (body: AgreementTemplateActivateBody) =>
    sendData<ApiResponse<any>>(`${AGREEMENTS_ADMIN_ENDPOINT}/templates/activate`, body);

  return {
    getSignedAgreements,
    getSignedAgreementDownloadUrl,
    createTemplateUploadUrl,
    activateTemplate,
  };
};

export default useAgreementsAdminApi;
