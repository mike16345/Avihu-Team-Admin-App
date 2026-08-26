import React from "react";
import { useFormContext } from "react-hook-form";
import { FaDumbbell, FaListUl, FaPersonRunning, FaClipboardCheck } from "react-icons/fa6";
import type { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone: "purple" | "rose" | "emerald" | "sky" | "amber";
}

const BRAND_TONE = {
  iconBg:
    "bg-gradient-to-br from-blue-600/85 via-blue-500/75 to-teal-300/70 shadow-sm shadow-blue-500/10 ring-1 ring-white/10",
  iconText: "text-white",
};
const TONE: Record<StatProps["tone"], { iconBg: string; iconText: string }> = {
  purple: BRAND_TONE,
  rose: BRAND_TONE,
  emerald: BRAND_TONE,
  sky: BRAND_TONE,
  amber: BRAND_TONE,
};

const StatCard: React.FC<StatProps> = ({ icon, label, value, tone }) => {
  const t = TONE[tone];
  return (
    <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${t.iconBg} ${t.iconText}`}
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
          {value}
        </span>
      </div>
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
  const cardioSummary = cardioStepsSummary || (cardioWeeklyMins ? `${cardioWeeklyMins} דק׳` : "—");

  const hasTips = (() => {
    const text = (tips.join(" ") || "").replace(/<[^>]+>/g, "").trim();
    return text.length > 0;
  })();

  return (
    <div dir="rtl" className="grid grid-cols-2 gap-3 font-heebo md:grid-cols-4">
      <StatCard
        tone="purple"
        icon={<FaDumbbell size={16} />}
        label="מספר אימונים"
        value={workoutCount}
      />
      <StatCard
        tone="rose"
        icon={<FaListUl size={16} />}
        label="סך תרגילים"
        value={exerciseCount}
      />
      <StatCard
        tone="sky"
        icon={<FaPersonRunning size={16} />}
        label="אירובי שבועי"
        value={cardioSummary}
      />
      <StatCard
        tone="amber"
        icon={<FaClipboardCheck size={16} />}
        label="דגשים"
        value={hasTips ? "מולא" : "ללא"}
      />
    </div>
  );
};

export default WorkoutPlanStatsStrip;
