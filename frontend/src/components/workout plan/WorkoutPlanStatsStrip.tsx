import React from "react";
import { useFormContext } from "react-hook-form";
import type { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, hint }) => {
  return (
    <div className="relative flex min-h-[60px] flex-1 flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <div className="flex items-baseline justify-center gap-1.5">
        <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          {value}
        </span>
        {hint && (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {hint}
          </span>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[3px] brand-gradient" />
    </div>
  );
};

const WorkoutPlanStatsStrip: React.FC = () => {
  const { watch } = useFormContext<WorkoutSchemaType>();

  const workoutPlans = watch("workoutPlans") || [];
  const cardio = watch("cardio");
  const tips = watch("tips") || [];

  const workoutCount = workoutPlans.length;

  const exerciseCount = workoutPlans.reduce(
    (sum, wp) =>
      sum + (wp.muscleGroups?.reduce((mgSum, mg) => mgSum + (mg.exercises?.length || 0), 0) || 0),
    0
  );

  let cardioWeeklyMins = 0;
  let cardioStepsSummary = "";
  if (cardio?.type === "simple") {
    const plan = cardio.plan as { minsPerWeek?: number };
    cardioWeeklyMins = Number(plan?.minsPerWeek) || 0;
  } else if (cardio?.type === "complex") {
    const plan = cardio.plan as {
      weeks?: { workouts?: { warmUpAmount?: number | string }[] }[];
    };
    const weeks = plan?.weeks || [];
    if (weeks.length > 0) {
      const totalAcrossWeeks = weeks.reduce((acc, w) => {
        const weekTotal = (w.workouts || []).reduce(
          (s, wk) => s + (Number(wk?.warmUpAmount) || 0),
          0
        );
        return acc + weekTotal;
      }, 0);
      cardioWeeklyMins = Math.round(totalAcrossWeeks / weeks.length);
    }
  } else if (cardio?.type === "steps") {
    const plan = cardio.plan as { mode?: string; daily?: number; perDay?: number[] };
    if (plan?.mode === "custom" && Array.isArray(plan.perDay) && plan.perDay.length === 7) {
      const total = plan.perDay.reduce((acc, value) => acc + (Number(value) || 0), 0);
      cardioStepsSummary = total ? `${total.toLocaleString("he-IL")} צעדים` : "";
    } else if (plan?.daily) {
      cardioStepsSummary = `${Number(plan.daily).toLocaleString("he-IL")} צעדים/יום`;
    }
  }
  const cardioSummary = cardioStepsSummary || (cardioWeeklyMins ? `${cardioWeeklyMins}` : "—");
  const cardioHint = cardioStepsSummary ? "" : cardioWeeklyMins ? "דק׳ בשבוע" : "לא הוגדר";

  const hasTips = (() => {
    const text = (tips.join(" ") || "").replace(/<[^>]+>/g, "").trim();
    return text.length > 0;
  })();

  return (
    <div dir="rtl" className="grid grid-cols-2 gap-3 font-heebo md:grid-cols-4">
      <StatCard
        label="מספר אימונים"
        value={workoutCount}
        hint={workoutCount === 1 ? "אימון" : "אימונים"}
      />
      <StatCard
        label="סך תרגילים"
        value={exerciseCount}
        hint="בסה״כ"
      />
      <StatCard
        label="אירובי שבועי"
        value={cardioSummary}
        hint={cardioHint}
      />
      <StatCard
        label="דגשים"
        value={hasTips ? "מולא" : "—"}
        hint={hasTips ? "הוזנו לאימון" : "לא הוזנו עדיין"}
      />
    </div>
  );
};

export default WorkoutPlanStatsStrip;
