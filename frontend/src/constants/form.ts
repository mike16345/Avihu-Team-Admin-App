import { Option } from "@/types/types";

export const QuestionTypeOptions: Option[] = [
  { name: "טקסט קצר", value: "text" },
  { name: "טקסט ארוך", value: "textarea" },
  { name: "בחירה יחידה (רדיו)", value: "radio" },
  { name: "בחירה מרובה (צ'קבוקס)", value: "checkboxes" },
  { name: "רשימה נפתחת", value: "drop-down" },
  { name: "טווח / סרגל", value: "range" },
  { name: "העלאת קובץ", value: "file-upload" },
];
