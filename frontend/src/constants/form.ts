import { Option } from "@/types/types";

// Existing options
export const QuestionTypeOptions: Option[] = [
  { name: "טקסט קצר", value: "text" },
  { name: "טקסט ארוך", value: "textarea" },
  { name: "בחירה יחידה (רדיו)", value: "radio" },
  { name: "בחירה מרובה (צ'קבוקס)", value: "checkboxes" },
  { name: "רשימה נפתחת", value: "drop-down" },
  { name: "טווח / סרגל", value: "range" },
  { name: "העלאת קובץ", value: "file-upload" },
];

export const FormTypeOptions: Option[] = [
  { name: "התחלה", value: "onboarding" },
  { name: "חודשי", value: "monthly" },
  { name: "כללי", value: "general" },
];

export const FormTypesInHebrew: Record<string, string> = {
  onboarding: "התחלה",
  monthly: "חודשי",
  general: "כללי",
};

export const typesRequiringOptions = ["radio", "checkboxes", "range", "drop-down"] as const;

export const borderColor: Record<any, string> = {
  true: "border-destructive",
  false: "",
};
