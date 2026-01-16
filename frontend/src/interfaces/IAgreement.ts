import { FormQuestionType } from "@/schemas/formBuilderSchema";

export type AgreementQuestionType = "text" | "textarea" | "single-select" | "multi-select";

export interface SignedAgreementUser {
  _id?: string;
  firstName?: string;
  lastName?: string;
}

export interface SignedAgreement {
  _id?: string;
  userId?: string;
  user?: SignedAgreementUser;
  signedAt?: string;
  createdAt?: string;
  version?: number;
  agreementVersion?: number;
  signedPdfS3Key?: string;
}

export interface CurrentAgreement {
  agreementId: string;
  version: number;
  pdfUrl: string;
  questions: FormQuestionType[];
}

export interface AgreementTemplateUploadResponse {
  uploadUrl: string;
  templatePdfS3Key: string;
  version: number;
  agreementId: string;
}
