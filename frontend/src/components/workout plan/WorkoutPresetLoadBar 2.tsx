import { FaFolderOpen } from "react-icons/fa6";

interface WorkoutPresetLoadBarProps {
  embedded: boolean;
  selectedPreset: string;
  onOpenPresetPicker: () => void;
}

const getPresetLabel = (selectedPreset: string) =>
  selectedPreset ? `תבנית: ${selectedPreset}` : "בחר תבנית";

export function WorkoutPresetLoadBar({
  embedded,
  selectedPreset,
  onOpenPresetPicker,
}: WorkoutPresetLoadBarProps) {
  if (embedded) {
    return (
      <div
        dir="rtl"
        className="flex flex-col gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 font-heebo shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            טען תבנית קיימת
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            בחר תבנית שמורה כדי לאכלס את התוכנית במהירות
          </span>
        </div>
        <PresetButton selectedPreset={selectedPreset} onOpenPresetPicker={onOpenPresetPicker} />
      </div>
    );
  }

  return (
    <div dir="rtl" className="flex items-center gap-3 font-heebo">
      <PresetButton selectedPreset={selectedPreset} onOpenPresetPicker={onOpenPresetPicker} />
      <span className="text-xs text-slate-500 dark:text-slate-400">
        בחר תבנית כדי לאכלס את התוכנית במהירות
      </span>
    </div>
  );
}

function PresetButton({
  selectedPreset,
  onOpenPresetPicker,
}: {
  selectedPreset: string;
  onOpenPresetPicker: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpenPresetPicker}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700 dark:hover:bg-blue-950/30"
    >
      <FaFolderOpen size={12} />
      {getPresetLabel(selectedPreset)}
    </button>
  );
}
