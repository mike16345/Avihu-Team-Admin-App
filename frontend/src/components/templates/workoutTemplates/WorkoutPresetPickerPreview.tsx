import { FormProvider, UseFormReturn } from "react-hook-form";
import { FaArrowRight, FaCheck, FaCircleExclamation } from "react-icons/fa6";
import WorkoutPlans from "@/components/workout plan/WorkoutPlans";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import PresetMetaPanel from "./PresetMetaPanel";
import { WorkoutPickerPreset } from "./workoutPresetPickerUtils";

type WorkoutPresetPickerPreviewProps = {
  editorForm: UseFormReturn<WorkoutSchemaType>;
  preview: WorkoutPickerPreset;
  onBack: () => void;
  onConfirm: () => void;
};

const WorkoutPresetPickerPreview = ({
  editorForm,
  preview,
  onBack,
  onConfirm,
}: WorkoutPresetPickerPreviewProps) => (
  <FormProvider {...editorForm}>
    <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50/40 px-6 py-2 dark:border-blue-900/40 dark:bg-blue-950/20">
      <FaCircleExclamation size={11} className="text-blue-500" />
      <p className="text-[11px] text-blue-700 dark:text-blue-300">
        שינויים כאן נשמרים רק לתוכנית של המתאמן — התבנית המקורית "
        <span className="font-bold">{preview.name}</span>" לא משתנה.
      </p>
    </div>

    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
      <PresetMetaPanel />
      <WorkoutPlans />
    </div>

    <footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/60">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <FaArrowRight size={11} />
        חזור לרשימה
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
      >
        <FaCheck size={11} />
        טען תבנית למתאמן
      </button>
    </footer>
  </FormProvider>
);

export default WorkoutPresetPickerPreview;
