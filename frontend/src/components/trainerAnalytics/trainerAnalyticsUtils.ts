import { endOfDay, format, startOfDay, subMonths, subWeeks, subYears, type Locale } from "date-fns";
import { he } from "date-fns/locale";
import { DateRange } from "react-day-picker";

export type TrainerDashboardSourceRangeMode = "month" | "year" | "custom";

export const HEBREW_SHORT_MONTHS = [
  "ינו",
  "פבר",
  "מרץ",
  "אפר",
  "מאי",
  "יוני",
  "יולי",
  "אוג",
  "ספט",
  "אוק",
  "נוב",
  "דצמ",
] as const;

export const TRAINER_SOURCE_COLOR_MAP: Record<string, string> = {
  "פנייה קרה": "hsl(var(--success))",
  יוטיוב: "hsl(var(--chart-5))",
  גוגל: "hsl(var(--primary))",
  פייסבוק: "hsl(var(--chart-2))",
  אינסטגרם: "hsl(var(--chart-4))",
  "פה לאוזן": "hsl(var(--chart-3))",
};

export const formatApiDate = (date: Date) => format(date, "yyyy-MM-dd");

export const formatHebrewRange = (from?: Date, to?: Date, locale: Locale = he) => {
  if (!from || !to) {
    return "בחר טווח תאריכים";
  }

  return `${format(from, "d MMM yyyy", { locale })} - ${format(to, "d MMM yyyy", { locale })}`;
};

export const getSourceRangeParams = (
  mode: TrainerDashboardSourceRangeMode,
  customRange?: DateRange
) => {
  const today = endOfDay(new Date());

  if (mode === "month") {
    return {
      from: formatApiDate(startOfDay(subMonths(today, 1))),
      to: formatApiDate(today),
    };
  }

  if (mode === "year") {
    return {
      from: formatApiDate(startOfDay(subYears(today, 1))),
      to: formatApiDate(today),
    };
  }

  if (!customRange?.from || !customRange.to) {
    return null;
  }

  return {
    from: formatApiDate(startOfDay(customRange.from)),
    to: formatApiDate(endOfDay(customRange.to)),
  };
};

export const getDefaultSourceRange = (): DateRange => {
  const today = endOfDay(new Date());
  const weekBefore = subWeeks(today, 1);

  return {
    from: startOfDay(weekBefore),
    to: today,
  };
};

export const getUtilizationTone = (percentage: number) => {
  if (percentage >= 90) {
    return {
      bar: "bg-destructive",
      text: "text-destructive",
    };
  }

  if (percentage >= 80) {
    return {
      bar: "bg-chart-4",
      text: "text-chart-4",
    };
  }

  return {
    bar: "bg-success",
    text: "text-success",
  };
};

export const getTrendTone = (value: number) => {
  if (value > 0) return "text-success";
  if (value < 0) return "text-destructive";
  return "text-muted-foreground";
};
