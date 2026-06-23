import {
  FaBullseye,
  FaCalendarWeek,
  FaCheck,
  FaClock,
  FaMagnifyingGlass,
  FaSignal,
} from "react-icons/fa6";
import { goalLabel, goalTone, levelLabel, levelTone, muscleFocusLabel } from "@/lib/workoutMeta";
import FavoriteStar from "./FavoriteStar";
import {
  getWorkoutFrequency,
  muscleGroupsOf,
  WorkoutPickerPreset,
} from "./workoutPresetPickerUtils";

type WorkoutPresetPickerResultsProps = {
  presets: WorkoutPickerPreset[];
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onOpenPreview: (preset: WorkoutPickerPreset) => void;
};

const WorkoutPresetPickerEmptyState = ({
  hasActiveFilters,
  onClearAll,
}: {
  hasActiveFilters: boolean;
  onClearAll: () => void;
}) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
      <FaMagnifyingGlass size={20} />
    </div>
    <p className="text-base font-bold text-slate-700 dark:text-slate-200">לא נמצאו תבניות</p>
    <p className="text-xs text-slate-500 dark:text-slate-400">
      נסה לנקות את הסינון או לחפש בשם אחר
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

const WorkoutPresetPickerCard = ({
  preset,
  onOpenPreview,
}: {
  preset: WorkoutPickerPreset;
  onOpenPreview: (preset: WorkoutPickerPreset) => void;
}) => {
  const workoutsPerWeek = getWorkoutFrequency(preset);
  const levelStyle = levelTone(preset.level);
  const goalStyle = goalTone(preset.goal);
  const levelText = levelLabel(preset.level);
  const goalText = goalLabel(preset.goal);
  const rawMuscles = muscleGroupsOf(preset).slice(0, 5);
  const taggedMuscles = preset.muscleFocus ?? [];
  const hasTaggedMuscles = taggedMuscles.length > 0;
  const hasRawMuscles = !hasTaggedMuscles && rawMuscles.length > 0;

  return (
    <button
      type="button"
      onClick={() => onOpenPreview(preset)}
      className="group flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-4 text-right transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-600"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <FavoriteStar presetId={preset._id} buttonSize="sm" />
          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
            {preset.name || "ללא שם"}
          </h3>
        </div>
        <span className="inline-flex h-6 items-center gap-1 rounded-full bg-blue-50 px-2 text-[10px] font-bold text-blue-700 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-blue-950/40 dark:text-blue-300">
          <FaCheck size={8} />
          בחר
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {workoutsPerWeek > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <FaCalendarWeek size={8} />
            {workoutsPerWeek}×
          </span>
        )}
        {preset.durationMinutes && (
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <FaClock size={8} />
            {preset.durationMinutes} דק׳
          </span>
        )}
        {levelText && levelStyle && (
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${levelStyle.bg} ${levelStyle.text} ${levelStyle.border}`}
          >
            <FaSignal size={8} />
            {levelText}
          </span>
        )}
        {goalText && goalStyle && (
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${goalStyle.bg} ${goalStyle.text} ${goalStyle.border}`}
          >
            <FaBullseye size={8} />
            {goalText}
          </span>
        )}
      </div>

      {hasTaggedMuscles && (
        <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-2 dark:border-slate-800">
          {taggedMuscles.map((muscle) => (
            <span
              key={muscle}
              className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              {muscleFocusLabel(muscle)}
            </span>
          ))}
        </div>
      )}
      {hasRawMuscles && (
        <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-2 dark:border-slate-800">
          {rawMuscles.map((muscle) => (
            <span
              key={muscle}
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {muscle}
            </span>
          ))}
        </div>
      )}

      {preset.note && (
        <p className="line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">{preset.note}</p>
      )}
    </button>
  );
};

const WorkoutPresetPickerResults = ({
  presets,
  hasActiveFilters,
  onClearAll,
  onOpenPreview,
}: WorkoutPresetPickerResultsProps) => {
  if (presets.length === 0) {
    return (
      <WorkoutPresetPickerEmptyState hasActiveFilters={hasActiveFilters} onClearAll={onClearAll} />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {presets.map((preset) => (
        <WorkoutPresetPickerCard
          key={preset._id || preset.name}
          preset={preset}
          onOpenPreview={onOpenPreview}
        />
      ))}
    </div>
  );
};

export default WorkoutPresetPickerResults;
