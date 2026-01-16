import { FormTypes } from "@/interfaces/IForm";
import { Option } from "@/types/types";

// Existing options
export const QuestionTypeOptions: Option[] = [
  { name: "תשובה קצרה", value: "text" },
  { name: "פסקה", value: "textarea" },
  { name: "בחירה מרובה", value: "radio" },
  { name: "תיבות סימון", value: "checkboxes" },
  { name: "בחירה מרשימה", value: "drop-down" },
  { name: "טווח / סרגל", value: "range" },
  { name: "העלאת קובץ", value: "file-upload" },
];

export const FormTypeOptions: Option[] = [
  { name: "התחלה", value: "onboarding" },
  { name: "חודשי", value: "monthly" },
  { name: "כללי", value: "general" },
];

export const FormTypesInHebrew: Record<FormTypes, string> = {
  onboarding: "התחלה",
  monthly: "חודשי",
  general: "כללי",
  
};

export const typesRequiringOptions = ["radio", "checkboxes", "drop-down"] as const;

export const borderColor: Record<any, string> = {
  true: "border-destructive",
  false: "",
};
