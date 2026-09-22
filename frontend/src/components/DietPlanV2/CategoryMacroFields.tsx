import { useFormContext } from "react-hook-form";

import type {
  DietV2CategoryMacros,
  DietV2MealCategory,
  IMacros,
  IDietPlanV2,
} from "@/interfaces/IDietPlanV2";

interface CategoryMacroFieldsProps {
  categoryLabel: string;
  category: DietV2MealCategory;
  value?: DietV2CategoryMacros;
  mealIndex: number;
  categoryIndex: number;
  onChange: (value: DietV2CategoryMacros | undefined) => void;
}

const FIELDS: Array<{
  key: keyof IMacros;
  label: string;
  unit: string;
  accent: string;
}> = [
  { key: "calories", label: "קלוריות", unit: "קק״ל", accent: "text-rose-600" },
  { key: "protein", label: "חלבון", unit: "גרם", accent: "text-blue-700" },
  { key: "carbs", label: "פחמימה", unit: "גרם", accent: "text-sky-700" },
  { key: "fat", label: "שומן", unit: "גרם", accent: "text-indigo-700" },
];

const CATEGORY_FIELDS: Record<DietV2MealCategory, Array<keyof IMacros>> = {
  protein: ["calories", "protein"],
  carbs: ["calories", "carbs"],
  fat: ["calories", "fat"],
  vegetables: ["calories", "carbs"],
};

const CategoryMacroFields = ({
  categoryLabel,
  category,
  value,
  mealIndex,
  categoryIndex,
  onChange,
}: CategoryMacroFieldsProps) => {
  const { formState } = useFormContext<IDietPlanV2>();
  const macroErrors = formState.errors.meals?.[mealIndex]?.categories?.[categoryIndex]?.macros;

  return (
    <section className="rounded-xl border border-blue-100 bg-gradient-to-l from-blue-50/60 to-white p-3 dark:border-blue-900/40 dark:from-blue-950/20 dark:to-slate-900">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
            ערכים עבור {categoryLabel}
          </h4>
          <p className="text-[10px] text-slate-500">הזן 0 במפורש כשאין ערך</p>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          השדות המוצגים חובה
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {FIELDS.filter((field) => CATEGORY_FIELDS[category].includes(field.key)).map((field) => {
          const error = macroErrors?.[field.key]?.message;
          const errorId = `meal-${mealIndex}-category-${categoryIndex}-${field.key}-error`;
          const fieldValue = value?.[field.key];

          return (
            <label key={field.key} className="flex min-w-0 flex-col gap-1">
              <span
                className={`flex items-center gap-2 rounded-lg border bg-white px-2.5 py-2 shadow-sm transition-colors focus-within:ring-2 dark:bg-slate-900 ${
                  error
                    ? "border-rose-400 focus-within:ring-rose-100 dark:border-rose-800"
                    : "border-slate-200 focus-within:border-blue-400 focus-within:ring-blue-100 dark:border-slate-700"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className={`block text-[10px] font-bold ${field.accent}`}>
                    {field.label}
                  </span>
                  <span className="block text-[9px] text-slate-400">{field.unit}</span>
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  aria-label={`${categoryLabel} ${field.label}`}
                  aria-invalid={!!error}
                  aria-describedby={error ? errorId : undefined}
                  value={Number.isFinite(fieldValue) ? fieldValue : ""}
                  onChange={(event) => {
                    const nextFieldValue =
                      event.target.value === "" ? undefined : Number(event.target.value);
                    const next = { ...(value ?? {}) } as Partial<DietV2CategoryMacros>;
                    if (nextFieldValue === undefined) delete next[field.key];
                    else next[field.key] = nextFieldValue;
                    onChange(
                      Object.keys(next).length > 0 ? (next as DietV2CategoryMacros) : undefined
                    );
                  }}
                  className="w-16 min-w-0 bg-transparent text-start text-base font-extrabold text-slate-800 outline-none dark:text-slate-100"
                />
              </span>
              {error && (
                <span
                  id={errorId}
                  role="alert"
                  className="px-1 text-[10px] font-bold text-rose-600"
                >
                  {error}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryMacroFields;
