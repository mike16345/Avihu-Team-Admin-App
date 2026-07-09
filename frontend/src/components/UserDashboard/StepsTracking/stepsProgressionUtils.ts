import type { IStepsProgress } from "@/interfaces/IStepsProgress";

/**
 * Feature-local helpers for the step-tracking sub-tab.
 *
 * Server records are shaped here for the dashboard UI so the visual
 * component can stay focused on rendering.
 */

export type StepsStatus = "on-track" | "slipping" | "off-track";

export interface DailySteps {
  steps: number;
  hadSync: boolean;
  dailyGoal: number;
}

export interface StepsWeek {
  label: string;
  startDate: string;
  endDate: string;
  dailyGoal: number;
  weeklyGoal: number;
  days: DailySteps[];
}

export interface TraineeBiometrics {
  weightKg: number;
  heightCm?: number;
  ageYears?: number;
  cardioMinsPerWeek?: number;
}

export interface StepsDataset {
  weeks: StepsWeek[];
  lastSyncedHoursAgo: number | null;
  trainee: TraineeBiometrics;
}

/**
 * Calorie estimate from step count. Uses the standard MET-derived
 * formula tuned to body weight:
 *
 *   calories = (steps / 1000) × weight_kg × 0.53
 *
 * Reference values per 1,000 steps:
 *   60kg → 31.8 · 70kg → 37.1 · 80kg → 42.4 · 90kg → 47.7
 *   100kg → 53.0 · 110kg → 58.3 · 120kg → 63.6 · 130kg → 68.9
 *
 * Derived from MET ≈ 3.5 for moderate walking at ~100 steps/min.
 * Accurate to roughly ±15-20% — good enough for trend tracking,
 * not for clinical decisions. Real precision needs HR data.
 */
const CALORIES_PER_THOUSAND_STEPS_PER_KG = 0.53;

export const estimateCaloriesFromSteps = (
  steps: number,
  trainee: TraineeBiometrics
): number => {
  if (steps <= 0 || trainee.weightKg <= 0) return 0;
  return Math.round((steps / 1000) * trainee.weightKg * CALORIES_PER_THOUSAND_STEPS_PER_KG);
};

export interface WeekSummary {
  weekTotal: number;
  weekProgress: number;
  todaySteps: number;
  streakDays: number;
  status: StepsStatus;
  zeroDays: number;
}

const DAILY_GOAL = 10000;
const MAX_WEEKS_TO_DISPLAY = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

const getLocalDayKey = (date: Date) => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
};

const startOfWeek = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
};

const parseDayKey = (date: string | Date) => {
  if (date instanceof Date) return date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return new Date(`${date}T00:00:00`);
  return new Date(date);
};

const getFirstDisplayWeekStart = (records: IStepsProgress[], currentWeekStart: Date) => {
  const earliestRecordDate = records.reduce<Date | null>((earliest, record) => {
    const parsedDate = parseDayKey(record.date);
    if (Number.isNaN(parsedDate.getTime())) return earliest;
    if (!earliest || parsedDate < earliest) return parsedDate;
    return earliest;
  }, null);

  if (!earliestRecordDate) return currentWeekStart;

  const earliestWeekStart = startOfWeek(earliestRecordDate);
  const weeksWithRecords =
    Math.floor((currentWeekStart.getTime() - earliestWeekStart.getTime()) / (7 * DAY_MS)) + 1;
  const weeksToDisplay = Math.max(1, Math.min(MAX_WEEKS_TO_DISPLAY, weeksWithRecords));

  return new Date(currentWeekStart.getTime() - (weeksToDisplay - 1) * 7 * DAY_MS);
};

const formatDisplayDate = (date: Date) =>
  new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

const getWeekLabel = (index: number, totalWeeks: number) => {
  const weeksAgo = totalWeeks - index - 1;

  if (weeksAgo === 0) return "\u05d4\u05e9\u05d1\u05d5\u05e2";
  if (weeksAgo === 1) return "\u05e9\u05d1\u05d5\u05e2 \u05e9\u05e2\u05d1\u05e8";
  if (weeksAgo === 2) return "\u05dc\u05e4\u05e0\u05d9 \u05e9\u05d1\u05d5\u05e2\u05d9\u05d9\u05dd";

  return `\u05dc\u05e4\u05e0\u05d9 ${weeksAgo} \u05e9\u05d1\u05d5\u05e2\u05d5\u05ea`;
};

const getLatestSyncedHoursAgo = (records: IStepsProgress[]) => {
  const latest = records.reduce<Date | null>((latestDate, record) => {
    const syncedAt = new Date(record.syncedAt);
    if (Number.isNaN(syncedAt.getTime())) return latestDate;
    if (!latestDate || syncedAt > latestDate) return syncedAt;
    return latestDate;
  }, null);

  if (!latest) return null;

  return Math.max(0, Math.round((Date.now() - latest.getTime()) / (60 * 60 * 1000)));
};

export const buildStepsDataset = (
  records: IStepsProgress[],
  trainee: TraineeBiometrics = { weightKg: 75 }
): StepsDataset => {
  const byDate = new Map(records.map((record) => [record.date, record]));
  const currentWeekStart = startOfWeek(new Date());
  const firstWeekStart = getFirstDisplayWeekStart(records, currentWeekStart);
  const weeksToDisplay =
    Math.floor((currentWeekStart.getTime() - firstWeekStart.getTime()) / (7 * DAY_MS)) + 1;

  const weeks: StepsWeek[] = Array.from({ length: weeksToDisplay }, (_, weekIndex) => {
    const weekStart = new Date(firstWeekStart.getTime() + weekIndex * 7 * DAY_MS);
    const dayGoals: number[] = [];
    const days: DailySteps[] = Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(weekStart.getTime() + dayIndex * DAY_MS);
      const record = byDate.get(getLocalDayKey(date));
      const dailyGoal = record?.dailyGoal && record.dailyGoal > 0 ? record.dailyGoal : DAILY_GOAL;

      dayGoals.push(dailyGoal);

      return {
        steps: record?.steps ?? 0,
        hadSync: !!record,
        dailyGoal,
      };
    });
    const weekEnd = new Date(weekStart.getTime() + 6 * DAY_MS);
    const weeklyGoal = dayGoals.reduce((sum, goal) => sum + goal, 0);

    return {
      label: getWeekLabel(weekIndex, weeksToDisplay),
      startDate: formatDisplayDate(weekStart),
      endDate: formatDisplayDate(weekEnd),
      dailyGoal: Math.round(weeklyGoal / 7),
      weeklyGoal,
      days,
    };
  });

  return {
    weeks,
    lastSyncedHoursAgo: getLatestSyncedHoursAgo(records),
    trainee,
  };
};

export const summarizeStepsWeek = (week: StepsWeek): WeekSummary => {
  const weekTotal = week.days.reduce((acc, day) => acc + day.steps, 0);
  const weekProgress = Math.min(150, Math.round((weekTotal / week.weeklyGoal) * 100));
  const todaySteps = week.days[week.days.length - 1]?.steps ?? 0;

  let streakDays = 0;
  for (let i = week.days.length - 1; i >= 0; i--) {
    const day = week.days[i];
    if (day.hadSync && day.steps >= day.dailyGoal) {
      streakDays++;
      continue;
    }
    break;
  }

  const status: StepsStatus =
    weekTotal >= week.weeklyGoal * 0.9
      ? "on-track"
      : weekTotal >= week.weeklyGoal * 0.6
        ? "slipping"
        : "off-track";

  const zeroDays = week.days.filter((day) => day.hadSync && day.steps === 0).length;

  return { weekTotal, weekProgress, todaySteps, streakDays, status, zeroDays };
};
