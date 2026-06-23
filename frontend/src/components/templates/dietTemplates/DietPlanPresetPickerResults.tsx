import {
  FaBreadSlice,
  FaCheck,
  FaCircleInfo,
  FaDroplet,
  FaDrumstickBite,
  FaFire,
  FaUser,
  FaUtensils,
} from "react-icons/fa6";
import {
  dietaryRestrictionLabel,
  dietaryRestrictionTone,
  dietGoalLabel,
  dietGoalTone,
  formatDietNumber,
  parseDietNumber,
  resolveDietPresetMeta,
} from "@/lib/dietMeta";
import { DietPickerPreset } from "./dietPlanPresetPickerUtils";

type DietPlanPresetPickerResultsProps = {
  presets: DietPickerPreset[];
  totalCount: number;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onSelectPreset: (preset: DietPickerPreset) => void;
  getBuilderLabel: (id?: string) => string | undefined;
};

const DietPlanPresetPickerEmptyState = ({
  totalCount,
  hasActiveFilters,
  onClearAll,
}: {
  totalCount: number;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}) => {
  const title = totalCount === 0 ? "עדיין אין תפריטים שמורים" : "לא נמצא תפריט מתאים";

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
        <FaUtensils size={20} />
      </div>
      <p className="text-base font-bold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        נסה לנקות חלק מהסינונים כדי לראות עוד תוצאות
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearAll}
          className="mt-1 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          נקה סינון
        </button>
      )}
    </div>
  );
};

const DietPlanPresetPickerCard = ({
  preset,
  onSelectPreset,
  getBuilderLabel,
}: {
  preset: DietPickerPreset;
  onSelectPreset: (preset: DietPickerPreset) => void;
  getBuilderLabel: (id?: string) => string | undefined;
}) => {
  const resolvedMeta = resolveDietPresetMeta(preset);
  const goalStyle = dietGoalTone(preset.goal);
  const goalText = dietGoalLabel(preset.goal);
  const restrictions = preset.dietaryRestrictions ?? [];
  const mealCount = preset.meals?.length ?? 0;
  const builderLabel = getBuilderLabel(preset.builtByTrainerId);
  const caloriesLabel = formatDietNumber(resolvedMeta.calories);
  const freeCaloriesLabel = formatDietNumber(resolvedMeta.freeCalories);
  const summaryParts = [goalText, caloriesLabel ? `${caloriesLabel} קל׳` : null].filter(Boolean);
  const hasMacros = [
    resolvedMeta.proteinServings,
    resolvedMeta.carbServings,
    resolvedMeta.fatServings,
  ].some((value) => parseDietNumber(value) !== undefined);

  return (
    <button
      type="button"
      onClick={() => onSelectPreset(preset)}
      className="group flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-4 text-right transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-600"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300">
            <FaUtensils size={12} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
              {preset.name || "ללא שם"}
            </h3>
            {summaryParts.length > 0 && (
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                {summaryParts.join(" · ")}
              </p>
            )}
          </div>
        </div>
        <span className="inline-flex h-6 items-center gap-1 rounded-full bg-blue-50 px-2 text-[10px] font-bold text-blue-700 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-blue-950/40 dark:text-blue-300">
          <FaCheck size={8} />
          בחר
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {mealCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {mealCount} ארוחות
          </span>
        )}
        {goalText && goalStyle && (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${goalStyle.bg} ${goalStyle.text} ${goalStyle.border}`}
          >
            {goalText}
          </span>
        )}
        {freeCaloriesLabel && (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300">
            <FaCircleInfo size={8} />
            {freeCaloriesLabel} חופשי
          </span>
        )}
        {caloriesLabel && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <FaFire size={8} />
            {caloriesLabel} קל׳
          </span>
        )}
        {restrictions.map((restriction) => (
          <span
            key={restriction}
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${dietaryRestrictionTone.bg} ${dietaryRestrictionTone.text} ${dietaryRestrictionTone.border}`}
          >
            {dietaryRestrictionLabel(restriction)}
          </span>
        ))}
      </div>

      {hasMacros && (
        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
          {formatDietNumber(resolvedMeta.proteinServings) && (
            <span className="inline-flex items-center gap-1">
              <FaDrumstickBite size={9} className="text-rose-500" />
              <span className="font-bold">{formatDietNumber(resolvedMeta.proteinServings)}</span>
              חלבון
            </span>
          )}
          {formatDietNumber(resolvedMeta.carbServings) && (
            <span className="inline-flex items-center gap-1">
              <FaBreadSlice size={9} className="text-amber-500" />
              <span className="font-bold">{formatDietNumber(resolvedMeta.carbServings)}</span>
              פחמ״ג
            </span>
          )}
          {formatDietNumber(resolvedMeta.fatServings) && (
            <span className="inline-flex items-center gap-1">
              <FaDroplet size={9} className="text-sky-500" />
              <span className="font-bold">{formatDietNumber(resolvedMeta.fatServings)}</span>
              שומן
            </span>
          )}
        </div>
      )}

      {builderLabel && (
        <div className="mt-auto flex items-center gap-1 pt-1 text-[10px] text-slate-400">
          <FaUser size={8} />
          בנה: {builderLabel}
        </div>
      )}
    </button>
  );
};

const DietPlanPresetPickerResults = ({
  presets,
  totalCount,
  hasActiveFilters,
  onClearAll,
  onSelectPreset,
  getBuilderLabel,
}: DietPlanPresetPickerResultsProps) => {
  if (presets.length === 0) {
    return (
      <DietPlanPresetPickerEmptyState
        totalCount={totalCount}
        hasActiveFilters={hasActiveFilters}
        onClearAll={onClearAll}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {presets.map((preset) => (
        <DietPlanPresetPickerCard
          key={preset._id || preset.name}
          preset={preset}
          onSelectPreset={onSelectPreset}
          getBuilderLabel={getBuilderLabel}
        />
      ))}
    </div>
  );
};

export default DietPlanPresetPickerResults;
