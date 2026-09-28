import { useState } from "react";
import { FaDumbbell, FaBullseye, FaPen } from "react-icons/fa6";

import { defaultColor, groupColors, type FlatExercise } from "./workoutProgressionModel";
import { IMonthlyExerciseGoal } from "@/interfaces/IMonthlyExerciseGoal";
import { RotatingInfoStrip } from "./RotatingInfoStrip";
import { MonthlyGoalModal } from "./MonthlyGoalModal";

type EmptyExerciseCardProps = {
  exercise: FlatExercise;
  positionLabel: string;
  userId?: string;
  goal?: IMonthlyExerciseGoal;
  plannedReps?: string[];
};

export function EmptyExerciseCard({
  exercise,
  positionLabel,
  userId,
  goal,
  plannedReps,
}: EmptyExerciseCardProps) {
  const colors = groupColors[exercise.group] || defaultColor;
  const [goalOpen, setGoalOpen] = useState(false);

  const strips: { label: string; icon?: React.ReactNode }[] = [];
  if (plannedReps && plannedReps.length > 0) {
    strips.push({
      label: `אימון פירמידה: ${plannedReps.join(" | ")}`,
      icon: <FaDumbbell size={10} />,
    });
  }
  if (goal) {
    strips.push({
      label: `יעד חודשי: ${goal.targetWeight} ק"ג × ${goal.targetReps} חזרות`,
      icon: <FaBullseye size={10} className="text-blue-600" />,
    });
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-1">
              <span className="inline-flex items-center rounded-full bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                {positionLabel}
              </span>
              <span
                className={`inline-flex items-center rounded-full ${colors.bg} px-2 py-0.5 text-[10px] font-semibold ${colors.text}`}
              >
                {exercise.group}
              </span>
            </div>
            <h3 className="mt-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
              {exercise.name}
            </h3>
            {strips.length > 0 && (
              <div className="mt-2">
                <RotatingInfoStrip items={strips} />
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {userId && (
              <button
                type="button"
                onClick={() => setGoalOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:text-blue-600 hover:border-blue-200"
                title={goal ? "ערוך יעד" : "הגדר יעד"}
                aria-label={goal ? "ערוך יעד" : "הגדר יעד"}
              >
                {goal ? <FaPen size={11} /> : <FaBullseye size={12} />}
              </button>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500">
              <FaDumbbell size={11} />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-4 text-center">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">אין נתונים עדיין</p>
          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            הנתונים יופיעו לאחר שהמתאמן יזין סטים
          </p>
        </div>
      </div>
      {userId && (
        <MonthlyGoalModal
          open={goalOpen}
          onOpenChange={setGoalOpen}
          userId={userId}
          exercise={exercise.name}
          existing={goal}
        />
      )}
    </>
  );
}
