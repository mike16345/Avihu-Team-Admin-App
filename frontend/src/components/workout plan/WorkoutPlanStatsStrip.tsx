/**
 * WorkoutPlanStatsStrip — clean stats summary shown above the editor.
 *
 * Reads live form values (so numbers update as the trainer edits) and shows
 * compact pill-cards with: workout count, total exercises, muscle groups,
 * cardio summary, and whether tips exist.
 *
 * Pure presentational — no side effects, no mutations.
 */
import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FaDumbbell,
  FaListUl,
  FaPersonRunning,
  FaClipboardCheck,
} from "react-icons/fa6";
import type { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone: "purple" | "rose" | "emerald" | "sky" | "amber";
}

const TONE: Record<StatProps["tone"], { iconBg: string; iconText: string }> = {
  purple: { iconBg: "bg-purple-100 dark:bg-purple-900/40", iconText: "text-purple-700 dark:text-purple-300" },
  rose: { iconBg: "bg-rose-100 dark:bg-rose-900/40", iconText: "text-rose-700 dark:text-rose-300" },
  emerald: { iconBg: "bg-emerald-100 dark:bg-emerald-900/40", iconText: "text-emerald-700 dark:text-emerald-300" },
  sky: { iconBg: "bg-sky-100 dark:bg-sky-900/40", iconText: "text-sky-700 dark:text-sky-300" },
  amber: { iconBg: "bg-amber-100 dark:bg-amber-900/40", iconText: "text-amber-700 dark:text-amber-300" },
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
        <span className="truncate text-base font-bold text-slate-900 dark:text-slate-100">{value}</span>
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
      sum +
      (wp.muscleGroups?.reduce(
        (mgSum, mg) => mgSum + (mg.exercises?.length || 0),
        0
      ) || 0),
    0
  );

  // Total weekly cardio minutes. For "simple" plans this is the raw
  // minsPerWeek value; for "complex" plans we sum each workout's
  // warmUpAmount across all weeks (best-effort summary).
  let cardioWeeklyMins = 0;
  if (cardio?.type === "simple") {
    const plan = cardio.plan as { minsPerWeek?: number };
    cardioWeeklyMins = Number(plan?.minsPerWeek) || 0;
  } else if (cardio?.type === "complex") {
    const plan = cardio.plan as {
      weeks?: { workouts?: { warmUpAmount?: number | string }[] }[];
    };
    const weeks = plan?.weeks || [];
    if (weeks.length > 0) {
      // Average minutes-per-week across the configured weeks.
      const totalAcrossWeeks = weeks.reduce((acc, w) => {
        const weekTotal = (w.workouts || []).reduce(
          (s, wk) => s + (Number(wk?.warmUpAmount) || 0),
          0
        );
        return acc + weekTotal;
      }, 0);
      cardioWeeklyMins = Math.round(totalAcrossWeeks / weeks.length);
    }
  }
  const cardioSummary = cardioWeeklyMins ? `${cardioWeeklyMins} דק׳` : "—";

  // "Has tips" — check whether the joined tips html has any visible text
  const hasTips = (() => {
    const text = (tips.join(" ") || "").replace(/<[^>]+>/g, "").trim();
    return text.length > 0;
  })();

  return (
    <div
      dir="rtl"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
      className="grid grid-cols-2 gap-3 md:grid-cols-4"
    >
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
