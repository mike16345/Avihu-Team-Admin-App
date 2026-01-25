import { SignedAgreementUser } from "./IAgreement";

export type FormResponse = {
  _id: string;
  formId: {
    _id: string;
    name: string;
    type: string;
  };
  userId: SignedAgreementUser | string;
  submittedAt: string;
  formTitle?: string;
  formType?: string;
  sections: Array<{
    _id: string;
    title: string;
    questions: Array<{
      _id: string;
      type: string;
      question: string;
      answer: any;
    }>;
  }>;
  createdAt?: string;
  updatedAt?: string;
};
