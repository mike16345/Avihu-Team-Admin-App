import { FaFire, FaUtensils } from "react-icons/fa6";

import type {
  DietV2Meal,
  DietV2MealMacroMode,
  DietV2OptionMacros,
  DietV2Plan,
  DietV2Unit,
} from "@/interfaces/IDietPlanV2";
import { formatUnitLabel } from "@/interfaces/IDietPlanV2";

import {
  CATEGORY_LABELS,
  CATEGORY_TONES,
  computeMealAverage,
} from "./dietPlanV2Utils";

interface DietV2SupplementRef {
  id: string;
  name: string;
  dose: string;
}

interface DietV2TraineeViewProps {
  plan: DietV2Plan & {
    highlights?: string;
    supplements?: DietV2SupplementRef[] | string;
  };
  trainerName?: string;
  traineeName?: string;
}

const parseLines = (raw?: string) =>
  (raw ?? "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

const normaliseSupplementList = (
  raw: DietV2SupplementRef[] | string | undefined
): { name: string; dose: string }[] => {
  if (Array.isArray(raw)) return raw.map(({ name, dose }) => ({ name, dose }));
  return parseLines(raw).map((line) => {
    const match = line.match(/^(.+?)\s+(\d.*)$/);
    return match
      ? { name: match[1].trim(), dose: match[2].trim() }
      : { name: line, dose: "" };
  });
};

const DietV2TraineeView: React.FC<DietV2TraineeViewProps> = ({
  plan,
  trainerName,
  traineeName,
}) => {
  const totalCalories = plan.meals.reduce((acc, meal) => acc + resolveCal(meal), 0);
  const highlights = parseLines(plan.highlights);
  const supplements = normaliseSupplementList(plan.supplements);

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
          <span className="inline-flex items-baseline gap-1 rounded-xl bg-rose-50 px-3 py-1.5 dark:bg-rose-950/40">
            <FaFire size={11} className="text-rose-600" />
            <strong className="text-base font-extrabold text-rose-700 dark:text-rose-300">
              {Math.round(totalCalories)}
            </strong>
            <span className="text-[11px] text-rose-600 dark:text-rose-400">קל׳ ליום</span>
          </span>
        </div>
      </header>

      {plan.meals.map((meal, idx) => (
        <MealBlock key={meal.id} meal={meal} index={idx + 1} />
      ))}

      {highlights.length > 0 && (
        <NotesBlock title="דגשים לתפריט" tone="blue" lines={highlights} />
      )}

      {supplements.length > 0 && (
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30">
          <h3 className="mb-2 text-sm font-bold text-slate-900 dark:text-slate-100">תוספים</h3>
          <ul className="flex flex-col gap-1 text-xs text-slate-700 dark:text-slate-200">
            {supplements.map((s, idx) => (
              <li key={idx} className="flex items-baseline justify-between gap-3">
                <strong className="font-semibold">{s.name}</strong>
                {s.dose && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{s.dose}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
        התפריט מותאם אישית עבורך. אם יש לך רגישות, אלרגיה או מצב רפואי — התייעץ עם המאמן לפני
        התחלה. אין לראות בתפריט תחליף לייעוץ תזונתי מקצועי.
      </footer>
    </div>
  );
};

const resolveCal = (meal: DietV2Meal) => {
  const mode: DietV2MealMacroMode = meal.macroMode ?? "auto";
  if (mode === "manual" && meal.manualMacros) return meal.manualMacros.calories || 0;
  return computeMealAverage(meal, "calories");
};

const resolveMacros = (meal: DietV2Meal): DietV2OptionMacros => {
  const mode: DietV2MealMacroMode = meal.macroMode ?? "auto";
  if (mode === "manual" && meal.manualMacros) return meal.manualMacros;
  return {
    protein: computeMealAverage(meal, "protein"),
    carbs: computeMealAverage(meal, "carbs"),
    fat: computeMealAverage(meal, "fat"),
    calories: computeMealAverage(meal, "calories"),
  };
};

interface MealBlockProps {
  meal: DietV2Meal;
  index: number;
}

const MealBlock: React.FC<MealBlockProps> = ({ meal, index }) => {
  const macros = resolveMacros(meal);
  const nonEmpty = meal.categories.filter((c) => c.options.length > 0);

  return (
    <article className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 bg-blue-50/40 px-4 py-3 dark:border-blue-900/40 dark:bg-blue-950/30">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {meal.name || `ארוחה ${index}`}
        </h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-600 dark:text-slate-300">
          <span>
            חלבון <strong className="text-slate-800 dark:text-slate-100">{Math.round(macros.protein)}</strong>ג׳
          </span>
          <span>
            פחמ׳ <strong className="text-slate-800 dark:text-slate-100">{Math.round(macros.carbs)}</strong>ג׳
          </span>
          <span>
            שומן <strong className="text-slate-800 dark:text-slate-100">{Math.round(macros.fat)}</strong>ג׳
          </span>
          <span className="font-bold text-rose-600 dark:text-rose-400">
            ≈ {Math.round(macros.calories)} קל׳
          </span>
        </div>
      </header>

      {nonEmpty.length === 0 && (
        <p className="px-4 py-6 text-center text-xs italic text-slate-400 dark:text-slate-500">
          אין פרטים לארוחה זו
        </p>
      )}

      {nonEmpty.map((cat) => {
        const tone = CATEGORY_TONES[cat.kind];
        return (
          <div key={cat.kind} className="border-t border-blue-50 px-4 py-2 dark:border-blue-900/30">
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-md ${tone.chip} px-2 py-0.5 text-[10px] font-bold ${tone.chipText}`}
              >
                {CATEGORY_LABELS[cat.kind]}
              </span>
              {cat.options.length > 1 && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  בחר אפשרות אחת
                </span>
              )}
            </div>
            <ul className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-200">
              {cat.options.map((opt) => (
                <li key={opt.id} className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate">
                    <strong className="font-semibold">{opt.foodName}</strong>
                  </span>
                  <span className="shrink-0 text-[11px] text-slate-500 dark:text-slate-400">
                    {opt.quantity} {formatUnitLabel(opt.unit as DietV2Unit, opt.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </article>
  );
};

const NotesBlock: React.FC<{ title: string; tone: "blue" | "indigo"; lines: string[] }> = ({
  title,
  tone,
  lines,
}) => (
  <section
    className={`rounded-2xl border p-4 ${
      tone === "blue"
        ? "border-blue-100 bg-blue-50/40 dark:border-blue-900/40 dark:bg-blue-950/30"
        : "border-indigo-100 bg-indigo-50/40 dark:border-indigo-900/40 dark:bg-indigo-950/30"
    }`}
  >
    <h3 className="mb-2 text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
    <ul className="list-inside list-disc space-y-1 text-xs text-slate-700 dark:text-slate-200">
      {lines.map((line, idx) => (
        <li key={idx}>{line}</li>
      ))}
    </ul>
  </section>
);

export default DietV2TraineeView;
