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
      <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
        {months.map((month, index) => {
          const previousWeight = getPreviousMonthWeight(months, index);
          const delta = getWeightDelta(month.pr.weight, previousWeight);

          return (
            <li
              key={month.key}
              className="flex items-center gap-3 bg-white dark:bg-slate-900 px-3 py-2"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                <FaBoltLightning size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {MONTH_NAMES[month.month - 1]} {month.year}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {month.pr.reps} חזרות
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {month.pr.weight}
                <span className="ms-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  ק״ג
                </span>
              </p>
              {delta !== null ? (
                <div
                  className={`inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${getDeltaClassName(
                    delta
                  )}`}
                >
                  <span>{getDeltaIcon(delta)}</span>
                  <span>
                    {getDeltaPrefix(delta)}
                    {delta.toFixed(1)}
                  </span>
                </div>
              ) : (
                <span className="w-12 shrink-0" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
