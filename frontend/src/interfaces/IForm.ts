export type QuestionTypes =
  | "text"
  | "textarea"
  | "multiple-choice"
  | "radio"
  | "range"
  | "file-upload"
  | "checkboxes"
  | "yes-no"
  | "drop-down";

export type OptionTypes = "radio" | "drop-down" | "checkboxes" | "range";

export type FormTypes = "onboarding" | "monthly" | "general";

export interface IFormQuestion {
  _id?: string;
  type: QuestionTypes;
  question: string;
  description?: string;
  options?: string[];
  required: boolean;
}

export interface IFormQuestionWithAnswer extends IFormQuestion {
  answer?: any;
}

export interface IFormSection {
  _id?: string;
  title: string;
  description?: string;
  questions: IFormQuestion[];
}

export interface IForm {
  _id?: string;
  name: string;
  type: FormTypes;
  showOn?: Date;
  repeatMonthly: boolean;
  sections: IFormSection[];
  createdAt?: Date;
  updatedAt?: Date;
}
