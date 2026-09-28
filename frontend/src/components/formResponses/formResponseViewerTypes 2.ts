import type { FormResponse } from "@/interfaces/IFormResponse";

export type FormResponseSection = FormResponse["sections"][number];
export type FormResponseQuestion = FormResponseSection["questions"][number];
export type FullscreenState = { images: string[]; index: number };

export type FormResponseViewerProps = {
  response: FormResponse;
  respondentName?: string;
  navigationMode?: "auto" | "tabs" | "select";
};
