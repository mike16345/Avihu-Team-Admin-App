import React from "react";
import { useFormContext } from "react-hook-form";
import { ClipboardCheck, Flame, Scale, Utensils } from "lucide-react";
import { DIET_CALORIES_PER_SERVING } from "@/constants/dietCalories";
import type { IDietPlan } from "@/interfaces/IDietPlan";

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  // Four shades of the brand blue — same visual family, subtle
  // variation so each card still reads as its own.
  tone: "sky" | "blue" | "indigo" | "navy";
}

// One uniform icon tone across all cards — soft deep-blue → turquoise
// gradient with a white glyph on top. Lower saturation + faint shadow
// so it reads as an accent, not as a shiny badge.
const BRAND_TONE = {
  iconBg:
    "bg-gradient-to-br from-blue-600/85 via-blue-500/75 to-teal-300/70 shadow-sm shadow-blue-500/10 ring-1 ring-white/10",
  iconText: "text-white",
};
const TONE: Record<StatProps["tone"], { iconBg: string; iconText: string }> = {
  sky: BRAND_TONE,
  blue: BRAND_TONE,
  indigo: BRAND_TONE,
  navy: BRAND_TONE,
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
        tone="sky"
        icon={<Utensils size={16} strokeWidth={2} />}
        label="מספר ארוחות"
        value={meals.length}
      />
      <StatCard
        tone="blue"
        icon={<Scale size={16} strokeWidth={2} />}
        label="חלבון · פחמ׳ · שומן"
        value={macroSummary}
      />
      <StatCard
        tone="indigo"
        icon={<Flame size={16} strokeWidth={2} />}
        label="סך קלוריות"
        value={`${totalKcal.toLocaleString()} קק״ל`}
      />
      <StatCard
        tone="navy"
        icon={<ClipboardCheck size={16} strokeWidth={2} />}
        label="דגשים · תוספים"
        value={`${instructionMark} · ${supplementMark}`}
      />
    </div>
  );
};

export default DietPlanStatsStrip;
