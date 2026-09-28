interface DietPlanPresetSaveActionProps {
  disabled: boolean;
  isSaving: boolean;
  onSave: () => void;
}

const getDietPlanPresetSaveLabel = (isSaving: boolean) => {
  if (isSaving) return "שומר…";
  return "שמור תבנית";
};

export function DietPlanPresetSaveAction({
  disabled,
  isSaving,
  onSave,
}: DietPlanPresetSaveActionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSave}
      className="inline-flex items-center justify-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-32 w-full md:fixed md:bottom-10 md:end-10"
    >
      {getDietPlanPresetSaveLabel(isSaving)}
    </button>
  );
}
