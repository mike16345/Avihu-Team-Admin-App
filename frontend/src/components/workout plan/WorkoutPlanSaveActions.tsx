import CustomButton from "../ui/CustomButton";

interface WorkoutPlanSaveActionsProps {
  embedded: boolean;
  isPresetSaving: boolean;
  isPlanSaving: boolean;
  isSaveDisabled: boolean;
  onOpenPresetModal: () => void;
}

export function WorkoutPlanSaveActions({
  embedded,
  isPresetSaving,
  isPlanSaving,
  isSaveDisabled,
  onOpenPresetModal,
}: WorkoutPlanSaveActionsProps) {
  const planSaveLabel = isPlanSaving ? "שומר…" : "שמור תוכנית";

  if (embedded) {
    return (
      <div
        dir="rtl"
        className="sticky bottom-0 z-10 mt-3 flex flex-col gap-2 rounded-full border border-[#E6ECF2] dark:border-slate-800/70 bg-white/95 dark:bg-slate-900/90 px-3 py-2 font-heebo shadow-[0_-4px_20px_-8px_rgba(30,50,70,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-end"
      >
        <button
          type="button"
          onClick={onOpenPresetModal}
          disabled={isPlanSaving}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E6ECF2] dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-1.5 text-sm font-medium text-[#172B4D] dark:text-slate-200 transition-colors hover:bg-[#EAF3FF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPresetSaving ? "שומר תבנית…" : "שמור כתבנית"}
        </button>
        <SavePlanButton disabled={isSaveDisabled} label={planSaveLabel} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-1 sm:sticky sm:bottom-0 sm:flex-row sm:justify-end">
      <CustomButton
        className=" w-auto sm:w-fit"
        variant="secondary"
        type="button"
        onClick={onOpenPresetModal}
        title="שמור תוכנית כתבנית"
        disabled={isPlanSaving}
        isLoading={isPresetSaving}
      />
      <SavePlanButton disabled={isSaveDisabled} label={planSaveLabel} className="w-full sm:w-32" />
    </div>
  );
}

function SavePlanButton({
  className = "",
  disabled,
  label,
}: {
  className?: string;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#3B82F6] px-5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {label}
    </button>
  );
}
