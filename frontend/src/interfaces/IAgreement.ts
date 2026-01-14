export type AgreementQuestionType = "text" | "textarea" | "single-select" | "multi-select";

export interface AgreementQuestionDefinition {
  questionId: string;
  label: string;
  type: AgreementQuestionType;
  required: boolean;
  options?: string[];
}

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
  questions: AgreementQuestionDefinition[];
}

export interface AgreementTemplateUploadResponse {
  uploadUrl: string;
  templatePdfS3Key: string;
  version: number;
  agreementId: string;
}
