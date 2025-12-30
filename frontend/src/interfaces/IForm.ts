export type QuestionTypes =
  | "text"
  | "textarea"
  | "multiple-choice"
  | "radio"
  | "range"
  | "file-upload"
  | "checkboxes"
  | "drop-down";

export type OptionTypes = "radio" | "drop-down" | "checkboxes";

export type FormTypes = "onboarding" | "monthly" | "general";

export interface IFormQuestion {
  type: QuestionTypes;
  question: string;
  description?: string;
  options?: string[];
  required: boolean;
  answer?: any;
}

export interface IFormSection {
  title: string;
  description?: string;
  questions: IFormQuestion[];
}

export interface IForm {
  name: string;
  type: FormTypes;
  showOn?: Date;
  repeatMonthly: boolean;
  sections: IFormSection[];
}
