import { FaBoltLightning } from "react-icons/fa6";

import type { ExerciseDetailSession, ExerciseDetailSet } from "./workoutProgressionModel";

type MonthlyPR = {
  key: string;
  month: number;
  year: string;
  pr: {
    date: string;
    weight: number;
    reps: number;
    setNumber: number;
  };
};

const MONTH_NAMES = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

const getHeaviestSet = (sets: ExerciseDetailSet[]) =>
  sets.reduce((max, set) => {
    if (set.weight > max.weight) return set;
    return max;
  }, sets[0]);

const getPreviousMonthWeight = (months: MonthlyPR[], index: number) => {
  if (index === 0) return null;
  return months[index - 1].pr.weight;
};

const getWeightDelta = (currentWeight: number, previousWeight: number | null) => {
  if (previousWeight === null) return null;
  return currentWeight - previousWeight;
};

const getMonthlyPRs = (sessions: ExerciseDetailSession[]): MonthlyPR[] => {
  const byMonth = new Map<string, MonthlyPR["pr"]>();

  sessions.forEach((session) => {
    const [, month, year] = session.date.split(/[./]/);
    const key = `${month}/${year}`;
    if (!session.sets.length) return;

    const topSet = getHeaviestSet(session.sets);
    const existing = byMonth.get(key);
    if (existing && topSet.weight <= existing.weight) return;

    byMonth.set(key, {
      date: session.date,
      weight: topSet.weight,
      reps: topSet.reps,
      setNumber: topSet.setNumber,
    });
  });

  return Array.from(byMonth.entries())
    .map(([key, pr]) => {
      const [month, year] = key.split("/");
      return { key, month: Number(month), year, pr };
    })
    .sort((first, second) => {
      if (first.year !== second.year) return first.year.localeCompare(second.year);
      return first.month - second.month;
    });
};

const getDeltaClassName = (delta: number) => {
  if (delta > 0) {
    return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300";
  }

  if (delta < 0) {
    return "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300";
  }

  return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";
};

const getDeltaIcon = (delta: number) => {
  if (delta > 0) return "↑";
  if (delta < 0) return "↓";
  return "→";
};

const getDeltaPrefix = (delta: number) => {
  if (delta > 0) return "+";
  return "";
};

export function MonthlyPRs({ sessions }: { sessions: ExerciseDetailSession[] }) {
  if (sessions.length === 0) return null;

  const months = getMonthlyPRs(sessions);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="mb-3 flex items-center gap-2">
        <FaBoltLightning size={14} className="text-amber-500" />
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">שיאים חודשיים</h4>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          (המשקל הכבד ביותר בכל חודש)
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {months.map((month, index) => {
          const previousWeight = getPreviousMonthWeight(months, index);
          const delta = getWeightDelta(month.pr.weight, previousWeight);

          return (
            <div
              key={month.key}
              className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-amber-50/60 via-white to-white p-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {MONTH_NAMES[month.month - 1]} {month.year}
                  </p>
                  <p className="mt-0.5 text-xl font-bold text-slate-900 dark:text-slate-100">
                    {month.pr.weight}
                    <span className="text-xs text-slate-500 dark:text-slate-400"> ק״ג</span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                    {month.pr.reps} חזרות
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                  <FaBoltLightning size={11} />
                </div>
              </div>
              {delta !== null && (
                <div
                  className={`mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${getDeltaClassName(
                    delta
                  )}`}
                >
                  <span>{getDeltaIcon(delta)}</span>
                  <span>
                    {getDeltaPrefix(delta)}
                    {delta.toFixed(1)} ק״ג
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
