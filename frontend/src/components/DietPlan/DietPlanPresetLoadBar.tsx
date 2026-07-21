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
      <PresetLoadButton
        onOpenPresetPicker={onOpenPresetPicker}
        className="ms-auto w-fit bg-white shadow-sm dark:bg-slate-900"
      />
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
      className={`inline-flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-transform duration-150 hover:scale-105 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 ${className}`}
    >
      <span className="inline-flex items-center gap-2">
        <FaUtensils size={11} className="text-emerald-600" />
        בחר תפריט מתבנית
      </span>
      <FaChevronDown size={9} className="text-slate-400" />
    </button>
  );
}
