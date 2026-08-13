import type { IMacros, IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import { useFormContext } from "react-hook-form";

interface MealMacroFieldsProps {
  value: IMacros;
  mealIndex: number;
  onChange: (value: IMacros) => void;
}

const FIELDS: {
  key: keyof IMacros;
  label: string;
  unit: string;
  accent: string;
}[] = [
  { key: "calories", label: "קלוריות", unit: "קק״ל", accent: "text-rose-600" },
  { key: "protein", label: "חלבון", unit: "גרם", accent: "text-blue-700" },
  { key: "carbs", label: "פחמימה", unit: "גרם", accent: "text-sky-700" },
  { key: "fat", label: "שומן", unit: "גרם", accent: "text-indigo-700" },
];

const MealMacroFields: React.FC<MealMacroFieldsProps> = ({ value, mealIndex, onChange }) => {
  const { formState } = useFormContext<IDietPlanV2>();
  const macroErrors = formState.errors.meals?.[mealIndex]?.macros;

  return (
    <section className="rounded-xl border border-blue-100 bg-gradient-to-l from-blue-50/50 to-white p-3 dark:border-blue-900/40 dark:from-blue-950/20 dark:to-slate-900">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            סיכום הארוחה
          </h4>
          <p className="text-[11px] text-slate-400">הזן את הערכים הכוללים של כל הארוחה</p>
        </div>
        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          כל השדות חובה
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {FIELDS.map((field) => {
          const error = macroErrors?.[field.key]?.message;
          const errorId = `meal-${mealIndex}-${field.key}-error`;

          return (
            <div key={field.key} className="flex flex-col gap-1">
              <label
                className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm transition-colors focus-within:ring-2 dark:bg-slate-900 ${
                  error
                    ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-100 dark:border-rose-800"
                    : "border-slate-200 focus-within:border-blue-400 focus-within:ring-blue-100 dark:border-slate-700"
                }`}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className={`text-[11px] font-bold ${field.accent}`}>{field.label}</span>
                  <span className="text-[10px] text-slate-400">{field.unit}</span>
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  aria-label={field.label}
                  aria-invalid={!!error}
                  aria-describedby={error ? errorId : undefined}
                  value={Number.isNaN(value[field.key]) ? "" : value[field.key]}
                  onChange={(event) => {
                    const nextValue =
                      event.target.value === "" ? Number.NaN : Number(event.target.value);
                    onChange({ ...value, [field.key]: nextValue });
                  }}
                  className="w-20 bg-transparent text-left text-lg font-extrabold text-slate-800 outline-none dark:text-slate-100"
                />
              </label>
              {error && (
                <span
                  id={errorId}
                  role="alert"
                  className="px-1 text-[10px] font-bold text-rose-600"
                >
                  {error}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MealMacroFields;
