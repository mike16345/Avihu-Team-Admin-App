import { FaFire, FaUtensils } from "react-icons/fa6";

import type { DietV2Meal, IDietPlanV2 } from "@/interfaces/IDietPlanV2";

import { CATEGORY_LABELS, CATEGORY_TONES, computePlanMacroTotals } from "./dietPlanV2Utils";

interface DietV2TraineeViewProps {
  plan: IDietPlanV2;
  trainerName?: string;
  traineeName?: string;
}

const parseLines = (raw: string) =>
  raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

const DietPlanV2TraineeView: React.FC<DietV2TraineeViewProps> = ({
  plan,
  trainerName,
  traineeName,
}) => {
  const totals = computePlanMacroTotals(plan);
  const highlights = parseLines(plan.highlights);

  return (
    <div dir="rtl" className="mx-auto flex max-w-2xl flex-col gap-4 p-4 font-heebo">
      <header className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl brand-gradient text-white shadow-md">
            <FaUtensils size={16} />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {traineeName ? `התפריט של ${traineeName}` : "התפריט שלך"}
            </h1>
            {trainerName && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                נבנה על ידי {trainerName}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-baseline gap-1 rounded-xl bg-rose-50 px-3 py-1.5 dark:bg-rose-950/40">
              <FaFire size={11} className="text-rose-600" />
              <strong className="text-base font-extrabold text-rose-700 dark:text-rose-300">
                {Math.round(totals.macros.calories)}
              </strong>
              <span className="text-[11px] text-rose-600 dark:text-rose-400">קק״ל</span>
            </span>
            {totals.freeCalories > 0 && (
              <span className="text-[10px] font-bold text-emerald-600">
                + {Math.round(totals.freeCalories)} קק״ל חופשי
              </span>
            )}
          </div>
        </div>
      </header>

      {plan.meals.map((meal, index) => (
        <MealBlock key={meal.id} meal={meal} index={index + 1} />
      ))}

      {highlights.length > 0 && <NotesBlock title="דגשים לתפריט" lines={highlights} />}
    </div>
  );
};

interface MealBlockProps {
  meal: DietV2Meal;
  index: number;
}

const MealBlock: React.FC<MealBlockProps> = ({ meal, index }) => {
  const categories = meal.categories.filter((category) => category.items.length > 0);

  return (
    <article className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 bg-blue-50/40 px-4 py-3 dark:border-blue-900/40 dark:bg-blue-950/30">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {meal.name || `ארוחה ${index}`}
        </h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-600 dark:text-slate-300">
          <span>{meal.macros.protein} ג׳ חלבון</span>
          <span>{meal.macros.carbs} ג׳ פחמימה</span>
          <span>{meal.macros.fat} ג׳ שומן</span>
          <span className="font-bold text-rose-600 dark:text-rose-400">
            {meal.macros.calories} קק״ל
          </span>
          {!!meal.freeCalories?.calories && (
            <span className="rounded-full border border-dashed border-emerald-300 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
              + {meal.freeCalories.calories} חופשי
            </span>
          )}
        </div>
      </header>

      {categories.length === 0 && !meal.freeCalories && (
        <p className="px-4 py-6 text-center text-xs italic text-slate-400">אין פרטים לארוחה זו</p>
      )}

      {categories.map((category) => {
        const tone = CATEGORY_TONES[category.category];
        return (
          <div
            key={category.category}
            className="border-t border-blue-50 px-4 py-3 dark:border-blue-900/30"
          >
            <span
              className={`mb-1.5 inline-flex rounded-md ${tone.chip} px-2 py-0.5 text-[10px] font-bold ${tone.chipText}`}
            >
              {CATEGORY_LABELS[category.category]}
            </span>
            <p className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-200">
              {category.items.map((item) => item.name).join(" / ")}
            </p>
          </div>
        );
      })}

      {meal.freeCalories && (
        <div className="border-t border-emerald-100 bg-emerald-50/30 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/10">
          <strong className="text-sm text-emerald-800 dark:text-emerald-200">
            קלוריות חופשיות · {meal.freeCalories.calories} קק״ל
          </strong>
          {meal.freeCalories.description && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {meal.freeCalories.description}
            </p>
          )}
        </div>
      )}
    </article>
  );
};

const NotesBlock: React.FC<{ title: string; lines: string[] }> = ({ title, lines }) => (
  <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
    <h3 className="mb-2 text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
    <ul className="list-inside list-disc space-y-1 text-xs text-slate-700 dark:text-slate-200">
      {lines.map((line, index) => (
        <li key={`${line}-${index}`}>{line}</li>
      ))}
    </ul>
  </section>
);

export default DietPlanV2TraineeView;
