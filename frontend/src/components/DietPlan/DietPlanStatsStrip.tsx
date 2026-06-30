import React from "react";
import { useFormContext } from "react-hook-form";
import { FaBowlFood, FaWeightScale, FaFire, FaClipboardCheck } from "react-icons/fa6";
import { DIET_CALORIES_PER_SERVING } from "@/constants/dietCalories";
import type { IDietPlan } from "@/interfaces/IDietPlan";

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone: "emerald" | "lime" | "amber" | "sky";
}

const TONE: Record<StatProps["tone"], { iconBg: string; iconText: string }> = {
  emerald: {
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconText: "text-emerald-700 dark:text-emerald-300",
  },
  lime: {
    iconBg: "bg-lime-100 dark:bg-lime-900/40",
    iconText: "text-lime-700 dark:text-lime-300",
  },
  amber: {
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconText: "text-amber-700 dark:text-amber-300",
  },
  sky: {
    iconBg: "bg-sky-100 dark:bg-sky-900/40",
    iconText: "text-sky-700 dark:text-sky-300",
  },
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

const DietPlanStatsStrip: React.FC = () => {
  const { watch } = useFormContext<IDietPlan>();
  const meals = watch("meals") || [];
  const freeCalories = Number(watch("freeCalories")) || 0;
  const instructions = watch("customInstructions") || [];
  const supplements = watch("supplements") || [];

  const totals = meals.reduce(
    (acc, m) => ({
      protein: acc.protein + (Number(m?.totalProtein?.quantity) || 0),
      carbs: acc.carbs + (Number(m?.totalCarbs?.quantity) || 0),
      fats: acc.fats + (Number(m?.totalFats?.quantity) || 0),
      veggies: acc.veggies + (Number(m?.totalVeggies?.quantity) || 0),
    }),
    { protein: 0, carbs: 0, fats: 0, veggies: 0 }
  );

  const totalKcal =
    totals.protein * DIET_CALORIES_PER_SERVING.protein +
    totals.carbs * DIET_CALORIES_PER_SERVING.carbs +
    totals.fats * DIET_CALORIES_PER_SERVING.fats +
    totals.veggies * DIET_CALORIES_PER_SERVING.veggies +
    freeCalories;

  const macroSummary = `${totals.protein} · ${totals.carbs} · ${totals.fats}`;

  const hasTextContent = (values: string[]) => {
    const text = (values.join(" ") || "").replace(/<[^>]+>/g, "").trim();
    return text.length > 0;
  };

  const instructionMark = hasTextContent(instructions) ? "✓" : "—";
  const supplementMark = hasTextContent(supplements) ? "✓" : "—";

  return (
    <div dir="rtl" className="grid grid-cols-2 gap-3 font-heebo md:grid-cols-4">
      <StatCard
        tone="emerald"
        icon={<FaBowlFood size={16} />}
        label="מספר ארוחות"
        value={meals.length}
      />
      <StatCard
        tone="lime"
        icon={<FaWeightScale size={16} />}
        label="חלבון · פחמ׳ · שומן"
        value={macroSummary}
      />
      <StatCard
        tone="amber"
        icon={<FaFire size={16} />}
        label="סך קלוריות"
        value={`${totalKcal.toLocaleString()} קק״ל`}
      />
      <StatCard
        tone="sky"
        icon={<FaClipboardCheck size={16} />}
        label="דגשים · תוספים"
        value={`${instructionMark} · ${supplementMark}`}
      />
    </div>
  );
};

export default DietPlanStatsStrip;
