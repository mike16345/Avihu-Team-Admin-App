import { useState } from "react";
import { FaArrowTrendUp, FaPencil } from "react-icons/fa6";

import DatePicker from "@/components/ui/DatePicker";

import type { ExerciseDetailSession, ExerciseDetailSet } from "./workoutProgressionModel";

const getHeaviestSet = (sets: ExerciseDetailSet[]) =>
  sets.reduce((max, set) => {
    if (set.weight > max.weight) return set;
    return max;
  }, sets[0]);

const getGoalGapPercentage = (gap: number, currentPR: number) => {
  if (currentPR <= 0) return "0";
  return ((gap / currentPR) * 100).toFixed(1);
};

const getSignedNumber = (value: number) => {
  if (value > 0) return `+${value}`;
  return String(value);
};

const getGoalProgress = (currentPR: number, goalWeight: number) => {
  if (goalWeight <= 0) return 0;
  return (currentPR / goalWeight) * 100;
};

const getClampedGoalProgress = (currentPR: number, goalWeight: number) =>
  Math.min(100, getGoalProgress(currentPR, goalWeight));

const parseIsoDate = (value: string) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const formatIsoDate = (date: Date) => date.toISOString().split("T")[0];

export function ExerciseGoals({ sessions }: { sessions: ExerciseDetailSession[] }) {
  const allSets = sessions.flatMap((session) => session.sets);

  if (allSets.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-blue-50/30 p-4 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
        אין סטים מתועדים — לא ניתן להציב יעד עדיין
      </div>
    );
  }

  return <ExerciseGoalsEditor allSets={allSets} />;
}

function ExerciseGoalsEditor({ allSets }: { allSets: ExerciseDetailSet[] }) {
  const heaviestSet = getHeaviestSet(allSets);
  const currentPR = heaviestSet.weight;
  const currentReps = heaviestSet.reps;

  const [goalWeight, setGoalWeight] = useState<number>(Math.ceil(currentPR * 1.1) || 1);
  const [goalReps, setGoalReps] = useState<number>(currentReps);
  const [goalDate, setGoalDate] = useState<string>("");
  const [editing, setEditing] = useState(false);

  const gap = goalWeight - currentPR;
  const gapPct = getGoalGapPercentage(gap, currentPR);
  const repsGap = goalReps - currentReps;
  const goalProgress = getGoalProgress(currentPR, goalWeight);
  const clampedGoalProgress = getClampedGoalProgress(currentPR, goalWeight);

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50/40 via-white to-white p-4 dark:border-slate-800">
      <div className="mb-3 flex items-center gap-2">
        <FaArrowTrendUp size={14} className="text-blue-600" />
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">יעד הבא</h4>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">(להציב מטרה למתאמן)</span>
      </div>

      <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
        <li className="flex items-center gap-3 bg-white dark:bg-slate-900 px-3 py-2.5">
          <span className="w-16 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            שיא נוכחי
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {currentPR} <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">ק״ג</span>
            </p>
          </div>
          <span className="shrink-0 text-[11px] text-slate-500 dark:text-slate-400">
            {currentReps} חזרות
          </span>
        </li>

        <li className="flex items-center gap-3 bg-blue-50/30 dark:bg-blue-950/20 px-3 py-2.5">
          <span className="w-16 shrink-0 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            יעד
          </span>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {editing ? (
              <input
                type="number"
                value={goalWeight}
                onChange={(event) => setGoalWeight(Number(event.target.value))}
                onBlur={() => setEditing(false)}
                autoFocus
                className="w-16 rounded-lg border border-blue-300 bg-white px-1 py-0.5 text-sm font-bold text-blue-700 focus:border-blue-500 focus:outline-none dark:bg-slate-900 dark:text-blue-300"
              />
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-sm font-bold text-blue-700 dark:text-blue-300"
              >
                {goalWeight} <span className="text-[10px] font-medium text-blue-600/70">ק״ג</span>
              </button>
            )}
            <span className="text-xs text-slate-400 dark:text-slate-500">×</span>
            <input
              type="number"
              value={goalReps}
              onChange={(event) => setGoalReps(Number(event.target.value))}
              className="w-12 rounded-lg border border-blue-200 bg-white px-1 py-0.5 text-sm font-bold text-blue-700 focus:border-blue-500 focus:outline-none dark:border-blue-900/60 dark:bg-slate-900 dark:text-blue-300"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400">חזרות</span>
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600"
              aria-label="ערוך"
            >
              <FaPencil size={9} />
            </button>
            <div className="ms-auto min-w-[140px]">
              <DatePicker
                selectedDate={parseIsoDate(goalDate)}
                onChangeDate={(date) => setGoalDate(formatIsoDate(date))}
                placeholder="בחר תאריך יעד"
              />
            </div>
          </div>
        </li>

        <li className="flex items-center gap-3 bg-emerald-50/30 dark:bg-emerald-950/20 px-3 py-2.5">
          <span className="w-16 shrink-0 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            פער
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
              {getSignedNumber(gap)} <span className="text-[10px] font-medium text-emerald-600/70">ק״ג</span>
            </p>
          </div>
          <span className="shrink-0 text-[11px] text-emerald-600 dark:text-emerald-400">
            {gapPct}% עלייה · {getSignedNumber(repsGap)} חזרות
          </span>
        </li>
      </ul>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
          <span>0 ק״ג</span>
          <span className="font-bold text-slate-700 dark:text-slate-200">
            יעד: {goalWeight} ק״ג × {goalReps}
          </span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-blue-500 to-emerald-500"
            style={{ width: `${clampedGoalProgress}%` }}
          />
        </div>
        <p className="mt-1 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          {goalProgress.toFixed(0)}% מהיעד הושג
        </p>
      </div>
    </div>
  );
}
