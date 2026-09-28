import CustomButton from "../ui/CustomButton";

interface DietPlanSaveActionsProps {
  embedded: boolean;
  isPlanSaving: boolean;
  isPresetSaving: boolean;
  isSaveDisabled: boolean;
  onOpenPresetModal: () => void;
  onSavePlan: () => void;
}

export function DietPlanSaveActions({
  embedded,
  isPlanSaving,
  isPresetSaving,
  isSaveDisabled,
  onOpenPresetModal,
  onSavePlan,
}: DietPlanSaveActionsProps) {
  const planSaveLabel = isPlanSaving ? "שומר…" : "שמור תפריט";

  if (embedded) {
    return (
      <div className="sticky bottom-0 z-10 mt-3 flex flex-col gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onOpenPresetModal}
          disabled={isPlanSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPresetSaving ? "שומר תבנית…" : "שמור כתבנית"}
        </button>
        <SaveDietPlanButton disabled={isSaveDisabled} label={planSaveLabel} onClick={onSavePlan} />
      </div>
    );
  }

  return (
    <div className="flex gap-3 flex-row fixed bottom-10 end-16">
      <CustomButton
        className="font-bold sm:w-fit"
        variant="default"
        onClick={onOpenPresetModal}
        title="שמור תפריט כתבנית"
        disabled={isPlanSaving}
        isLoading={isPresetSaving}
      />
      <SaveDietPlanButton
        disabled={isSaveDisabled}
        label={planSaveLabel}
        onClick={onSavePlan}
        className="w-full sm:w-32"
      />
    </div>
  );
}

function SaveDietPlanButton({
  className = "",
  disabled,
  label,
  onClick,
}: {
  className?: string;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${className}`}
    >
      {label}
    </button>
  );
}
