/**
 * Feature-local helpers for the step-tracking sub-tab.
 *
 * Mock dataset is used until the mobile app starts pushing real
 * sync data to the server. Once the API exists, replace
 * `buildMockStepsDataset` with a query hook (per Agents.md three-
 * step data flow: api wrapper -> query hook -> consumer).
 */

export type StepsStatus = "on-track" | "slipping" | "off-track";

export interface DailySteps {
  steps: number;
  hadSync: boolean;
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
  lastSyncedHoursAgo: number;
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
const WEEKLY_GOAL = DAILY_GOAL * 6;

const mockWeekDays = (pattern: number[]): DailySteps[] =>
  pattern.map((steps, idx) => ({
    steps,
    hadSync: !(idx === 3 && steps === 0),
  }));

export const buildMockStepsDataset = (): StepsDataset => ({
  lastSyncedHoursAgo: 2,
  trainee: {
    weightKg: 75,
    heightCm: 178,
    ageYears: 34,
    cardioMinsPerWeek: 90,
  },
  weeks: [
    {
      label: "לפני 7 שבועות",
      startDate: "04/05/2026",
      endDate: "10/05/2026",
      dailyGoal: DAILY_GOAL,
      weeklyGoal: WEEKLY_GOAL,
      days: mockWeekDays([6200, 5800, 7100, 4900, 6300, 4200, 0]),
    },
    {
      label: "לפני 6 שבועות",
      startDate: "11/05/2026",
      endDate: "17/05/2026",
      dailyGoal: DAILY_GOAL,
      weeklyGoal: WEEKLY_GOAL,
      days: mockWeekDays([7400, 6900, 8200, 7100, 8800, 5400, 0]),
    },
    {
      label: "לפני 5 שבועות",
      startDate: "18/05/2026",
      endDate: "24/05/2026",
      dailyGoal: DAILY_GOAL,
      weeklyGoal: WEEKLY_GOAL,
      days: mockWeekDays([8800, 7600, 9100, 8400, 9700, 7200, 0]),
    },
    {
      label: "לפני 4 שבועות",
      startDate: "25/05/2026",
      endDate: "31/05/2026",
      dailyGoal: DAILY_GOAL,
      weeklyGoal: WEEKLY_GOAL,
      days: mockWeekDays([9200, 8400, 10100, 8900, 9600, 7800, 0]),
    },
    {
      label: "לפני 3 שבועות",
      startDate: "01/06/2026",
      endDate: "07/06/2026",
      dailyGoal: DAILY_GOAL,
      weeklyGoal: WEEKLY_GOAL,
      days: mockWeekDays([8200, 9100, 10500, 7800, 11200, 5900, 0]),
    },
    {
      label: "לפני שבועיים",
      startDate: "08/06/2026",
      endDate: "14/06/2026",
      dailyGoal: DAILY_GOAL,
      weeklyGoal: WEEKLY_GOAL,
      days: mockWeekDays([10100, 11200, 9800, 12500, 8900, 9600, 0]),
    },
    {
      label: "שבוע שעבר",
      startDate: "15/06/2026",
      endDate: "21/06/2026",
      dailyGoal: DAILY_GOAL,
      weeklyGoal: WEEKLY_GOAL,
      days: mockWeekDays([9800, 8400, 11100, 7200, 9800, 8000, 0]),
    },
    {
      label: "השבוע",
      startDate: "22/06/2026",
      endDate: "28/06/2026",
      dailyGoal: DAILY_GOAL,
      weeklyGoal: WEEKLY_GOAL,
      days: mockWeekDays([11200, 9800, 10500, 0, 7600, 6240, 0]),
    },
  ],
});

export const summarizeStepsWeek = (week: StepsWeek): WeekSummary => {
  const weekTotal = week.days.reduce((acc, day) => acc + day.steps, 0);
  const weekProgress = Math.min(150, Math.round((weekTotal / week.weeklyGoal) * 100));
  const todaySteps = week.days[week.days.length - 1]?.steps ?? 0;

  let streakDays = 0;
  for (let i = week.days.length - 1; i >= 0; i--) {
    const day = week.days[i];
    if (day.hadSync && day.steps >= week.dailyGoal) {
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
