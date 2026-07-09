import { Controller, useFormContext } from "react-hook-form";
import { FaShoePrints } from "react-icons/fa6";

import type { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import type { StepsCardioMode } from "@/interfaces/IWorkoutPlan";

const DAYS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"] as const;
const MODE_OPTIONS: { id: StepsCardioMode; label: string }[] = [
  { id: "uniform", label: "אחיד" },
  { id: "custom", label: "מותאם לכל יום" },
];

const sumPerDay = (values: number[] | undefined) =>
  (values ?? []).reduce((acc, value) => acc + (Number.isFinite(value) ? value : 0), 0);

const getModeButtonClassName = (active: boolean) => {
  if (active) return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";
  return "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800";
};

const StepsCardioContainer = () => {
  const { watch, setValue, control } = useFormContext<WorkoutSchemaType>();
  const mode = watch("cardio.plan.mode") as StepsCardioMode | undefined;
  const daily = watch("cardio.plan.daily") as number | undefined;
  const perDay = watch("cardio.plan.perDay") as number[] | undefined;

  const isCustom = mode === "custom";
  const weeklyTotal = isCustom ? sumPerDay(perDay) : (daily ?? 0) * 7;
  const dailyAverage = isCustom && perDay?.length ? Math.round(weeklyTotal / 7) : daily ?? 0;

  const handleModeChange = (nextMode: StepsCardioMode) => {
    if (nextMode === mode) return;
    setValue("cardio.plan.mode", nextMode, { shouldDirty: true });
    if (nextMode === "custom" && (!perDay || perDay.length !== 7)) {
      const fill = daily ?? 10000;
      setValue(
        "cardio.plan.perDay",
        [fill, fill, fill, fill, fill, fill, 0],
        { shouldDirty: true }
      );
    }
  };

  return (
    <div dir="rtl" className="flex flex-col gap-4 font-heebo">
      <div className="inline-flex w-fit items-center gap-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
        {MODE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleModeChange(opt.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${getModeButtonClassName(
              mode === opt.id
            )}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {!isCustom && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <FaShoePrints size={10} />
            יעד צעדים יומי
          </label>
          <Controller
            control={control}
            name="cardio.plan.daily"
            render={({ field }) => (
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={500}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="לדוגמה: 10,000"
                className="mt-2 h-11 w-48 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/15 px-3 text-base font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-200/60 dark:focus:bg-slate-900"
              />
            )}
          />
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            יעד אחיד לכל יום בשבוע. המתאמן יראה את היעד הזה במעקב הצעדים.
          </p>
        </div>
      )}

      {isCustom && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <FaShoePrints size={10} />
            יעד צעדים לפי יום
          </label>
          <div className="mt-3 grid grid-cols-7 gap-2">
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex flex-col items-center gap-1">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {day}
                </span>
                <Controller
                  control={control}
                  name={`cardio.plan.perDay.${dayIndex}` as const}
                  render={({ field }) => (
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={500}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-10 w-full rounded-lg border border-blue-100 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/15 px-2 text-center text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-200/60 dark:focus:bg-slate-900"
                    />
                  )}
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            מספר צעדים שונה לכל יום. השאר 0 בימים ללא יעד.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 px-4 py-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            סה״כ שבועי
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">
            {weeklyTotal.toLocaleString("he-IL")}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">צעדים</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ממוצע יומי
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">
            {dailyAverage.toLocaleString("he-IL")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StepsCardioContainer;
