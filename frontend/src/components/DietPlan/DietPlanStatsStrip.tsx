import React from "react";
import { useFormContext } from "react-hook-form";
import { DIET_CALORIES_PER_SERVING } from "@/constants/dietCalories";
import type { IDietPlan } from "@/interfaces/IDietPlan";

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

const DietPlanStatsStrip: React.FC = () => {
  const { watch } = useFormContext<IDietPlan>();
  const meals = watch("meals") || [];
  const freeCalories = Number(watch("freeCalories")) || 0;
  const instructions = watch("customInstructions") || [];

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

  const macroSummary = `${totals.protein} | ${totals.carbs} | ${totals.fats}`;

  const hasTextContent = (values: string[]) => {
    const text = (values.join(" ") || "").replace(/<[^>]+>/g, "").trim();
    return text.length > 0;
  };

  const instructionsFilled = hasTextContent(instructions);

  return (
    <div dir="rtl" className="grid grid-cols-2 gap-3 font-heebo md:grid-cols-4">
      <StatCard
        label="מספר ארוחות"
        value={meals.length}
        hint={meals.length === 1 ? "ארוחה" : "ארוחות"}
      />
      <StatCard
        label="חלבון · פחמ׳ · שומן"
        value={macroSummary}
        hint="מנות ליום"
      />
      <StatCard
        label="סך קלוריות"
        value={totalKcal.toLocaleString()}
        hint="קק״ל ליום"
      />
      <StatCard
        label="דגשים"
        value={instructionsFilled ? "מולא" : "—"}
        hint={instructionsFilled ? "הוזנו לתפריט" : "לא הוזנו עדיין"}
      />
    </div>
  );
};

export default DietPlanStatsStrip;
