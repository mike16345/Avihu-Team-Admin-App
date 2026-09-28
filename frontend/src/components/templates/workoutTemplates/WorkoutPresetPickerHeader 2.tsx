import { FaArrowRight, FaDumbbell } from "react-icons/fa6";
import { getPickerSubtitle, getPickerTitle, WorkoutPickerPreset } from "./workoutPresetPickerUtils";

type WorkoutPresetPickerHeaderProps = {
  preview: WorkoutPickerPreset | null;
  onBack: () => void;
};

const WorkoutPresetPickerHeader = ({ preview, onBack }: WorkoutPresetPickerHeaderProps) => (
  <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
    <div className="flex min-w-0 items-center gap-3">
      {preview && (
        <button
          type="button"
          onClick={onBack}
          aria-label="חזור לרשימה"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:hover:bg-blue-950/40"
        >
          <FaArrowRight size={12} />
        </button>
      )}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300">
        <FaDumbbell size={15} />
      </div>
      <div className="min-w-0">
        <h2 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
          {getPickerTitle(preview)}
        </h2>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {getPickerSubtitle(preview)}
        </p>
      </div>
    </div>
  </header>
);

export default WorkoutPresetPickerHeader;
