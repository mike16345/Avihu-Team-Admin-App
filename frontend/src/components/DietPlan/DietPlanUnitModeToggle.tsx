import React from "react";
import { useFormContext } from "react-hook-form";
import { DietPlanUnitMode, IDietPlan } from "@/interfaces/IDietPlan";

const OPTIONS: { value: DietPlanUnitMode; label: string }[] = [
  { value: 1, label: "אופציה א' - גרמים" },
  { value: 2, label: "אופציה ב' - כפות" },
];

const getButtonClassName = (isActive: boolean) => {
  const base =
    "rounded-lg px-3 py-1 text-xs font-semibold transition-transform duration-150 hover:scale-105";
  if (isActive)
    return `${base} brand-gradient brand-gradient-hover text-white shadow-md shadow-blue-500/25`;
  return `${base} text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700`;
};

const DietPlanUnitModeToggle: React.FC = () => {
  const { watch, setValue } = useFormContext<IDietPlan>();
  const current: DietPlanUnitMode = watch("unitDisplayMode") ?? 1;

  return (
    <div
      dir="rtl"
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-heebo shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
        סוג תפריט:
      </span>
      <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              setValue("unitDisplayMode", option.value, { shouldDirty: true })
            }
            className={getButtonClassName(current === option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DietPlanUnitModeToggle;
