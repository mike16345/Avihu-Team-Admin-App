import { FaChevronDown, FaUtensils } from "react-icons/fa6";

interface DietPlanPresetLoadBarProps {
  embedded: boolean;
  onOpenPresetPicker: () => void;
}

export function DietPlanPresetLoadBar({
  embedded,
  onOpenPresetPicker,
}: DietPlanPresetLoadBarProps) {
  if (embedded) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            טען תבנית קיימת
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            סנן לפי סוג תפריט, קלוריות והגבלות ובחר את המתאים למתאמן
          </span>
        </div>
        <PresetLoadButton
          onOpenPresetPicker={onOpenPresetPicker}
          className="bg-slate-50 dark:bg-slate-800/60 sm:min-w-[260px]"
        />
      </div>
    );
  }

  return (
    <PresetLoadButton
      onOpenPresetPicker={onOpenPresetPicker}
      className="mr-1 bg-white dark:bg-slate-900 shadow-sm sm:w-[350px]"
    />
  );
}

function PresetLoadButton({
  className = "",
  onOpenPresetPicker,
}: {
  className?: string;
  onOpenPresetPicker: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpenPresetPicker}
      className={`inline-flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 ${className}`}
    >
      <span className="inline-flex items-center gap-2">
        <FaUtensils size={11} className="text-emerald-600" />
        בחר תפריט מתבנית
      </span>
      <FaChevronDown size={9} className="text-slate-400" />
    </button>
  );
}
