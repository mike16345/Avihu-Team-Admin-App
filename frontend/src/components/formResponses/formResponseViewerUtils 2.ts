import { FormTypesInHebrew } from "@/constants/form";
import { FormTypes } from "@/interfaces/IForm";
import { FormResponse } from "@/interfaces/IFormResponse";
import DateUtils from "@/lib/dateUtils";
import { buildPhotoUrl } from "@/lib/utils";

const TYPE_ACCENT: Record<string, { bg: string; text: string; ring: string }> = {
  start: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    ring: "ring-blue-200",
  },
  monthly: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-200",
  },
  general: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-200",
    ring: "ring-slate-200",
  },
};

const stripPhotoPrefix = (value: string): string | null => {
  if (!value || typeof value !== "string") return null;

  const imagesIndex = value.indexOf("/images/");
  if (imagesIndex >= 0) return value.slice(imagesIndex + "/images/".length);

  return value.replace(/^\/+/, "");
};

export function extractAllPhotoKeys(response: FormResponse): string[] {
  const keys: string[] = [];

  (response.sections ?? []).forEach((section) => {
    (section.questions ?? []).forEach((question) => {
      if (question.type !== "file-upload" || !question.answer) return;

      const candidates: unknown[] = Array.isArray(question.answer)
        ? question.answer
        : [question.answer];

      candidates.forEach((candidate) => {
        if (typeof candidate !== "string") return;

        const key = stripPhotoPrefix(candidate);
        if (key) keys.push(key);
      });
    });
  });

  return Array.from(new Set(keys));
}

export const formatSubmittedAt = (submittedAt?: string) => {
  if (!submittedAt) return "—";

  const date = new Date(submittedAt);
  if (Number.isNaN(date.getTime())) return submittedAt;

  return DateUtils.formatDate(date, "DD/MM/YYYY");
};

export const normalizeFileUrls = (answer: unknown): string[] => {
  if (!answer) return [];

  const urls: string[] = [];
  if (typeof answer === "string") urls.push(buildPhotoUrl(answer));
  if (Array.isArray(answer)) answer.forEach((entry) => urls.push(buildPhotoUrl(entry)));

  return urls.filter((url) => typeof url === "string" && url.trim().length > 0);
};

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

export const accentOf = (type?: string) => TYPE_ACCENT[type || "general"] || TYPE_ACCENT.general;

export const getFormTypeLabel = (type?: string) =>
  type ? (FormTypesInHebrew[type as FormTypes] ?? type) : "—";

export const getSectionLabel = (title: string | undefined, index: number) =>
  title?.trim() || `סעיף ${index + 1}`;
