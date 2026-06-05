/**
 * MuscleGroupContainer — matches the DesignPreview MuscleGroupBlock:
 *  - rounded-2xl white card with thin border + shadow
 *  - header has a colored pill for the muscle group + selector + delete
 *  - body contains the exercise cards in a 2-column grid (handled inside
 *    ExcerciseInput) and a dashed "הוסף תרגיל" CTA
 */
import { IMuscleGroupWorkouts } from "@/interfaces/IWorkoutPlan";
import { FC, useState } from "react";
import { FaChevronDown, FaChevronUp, FaTrash } from "react-icons/fa6";
import ExcerciseInput from "./ExcerciseInput";
import MuscleGroupSelector from "./MuscleGroupSelector";
import DeleteModal from "../Alerts/DeleteModal";
import { CollapsibleProps } from "@radix-ui/react-collapsible";

interface IMuscleGroupContainerProps extends CollapsibleProps {
  muscleGroup: IMuscleGroupWorkouts;
  handleUpdateMuscleGroup: (value: string) => void;
  handleDeleteMuscleGroup: () => void;
  parentPath: `workoutPlans.${number}.muscleGroups.${number}`;
}

/**
 * Muscle-group color palette (background + text) shared with DesignPreview.
 * Unknown muscle groups fall back to a neutral slate.
 */
const MUSCLE_COLORS: Record<string, { bg: string; text: string }> = {
  חזה: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-300" },
  גב: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300" },
  כתפיים: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300" },
  "יד קדמית": { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300" },
  "יד אחורית": { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-700 dark:text-indigo-300" },
  ביצפס: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300" },
  טריצפס: { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-700 dark:text-indigo-300" },
  רגליים: { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300" },
  ישבן: { bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40", text: "text-fuchsia-700 dark:text-fuchsia-300" },
  תאומים: { bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-700 dark:text-teal-300" },
  טרפזים: { bg: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-700 dark:text-cyan-300" },
  אמות: { bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-700 dark:text-sky-300" },
  בטן: { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-300" },
};
const colorsFor = (group?: string) =>
  (group && MUSCLE_COLORS[group]) || { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200" };

export const MuscleGroupContainer: FC<IMuscleGroupContainerProps> = ({
  muscleGroup,
  handleUpdateMuscleGroup,
  parentPath,
  handleDeleteMuscleGroup,
}) => {
  const [isDeleteMuscleGroupModalOpen, setIsDeleteMuscleGroupModalOpen] = useState(false);
  const [isChangingMuscleGroup, setIsChangingMuscleGroup] = useState(false);
  const [muscleGroupToSwapTo, setMuscleGroupToSwapTo] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(muscleGroup.exercises.length === 0);

  const path = parentPath.split(".");
  const muscleGroupsPath = (path[0] +
    "." +
    path[1] +
    ".muscleGroups") as `workoutPlans.${number}.muscleGroups`;

  const handleSwapMuscleGroup = (newMuscleGroup: string) => {
    if (muscleGroup.exercises.length == 0) return handleUpdateMuscleGroup(newMuscleGroup);
    setIsChangingMuscleGroup(true);
    setMuscleGroupToSwapTo(newMuscleGroup);
  };

  const colors = colorsFor(muscleGroup.muscleGroup);
  const groupLabel = muscleGroup.muscleGroup || "בחר קבוצה";

  return (
    <div
      dir="rtl"
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${colors.bg} ${colors.text}`}
          >
            קבוצת שריר: {groupLabel}
          </span>
          <MuscleGroupSelector
            handleDismiss={(val) => {
              if (!val) handleDeleteMuscleGroup();
            }}
            pathToMuscleGroups={muscleGroupsPath}
            handleChange={handleSwapMuscleGroup}
            existingMuscleGroup={muscleGroup.muscleGroup}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen((s) => !s)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              isOpen
                ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            aria-label={isOpen ? "סגור" : "פתח"}
          >
            {isOpen ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteMuscleGroupModalOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400"
            aria-label="מחק קבוצת שריר"
          >
            <FaTrash size={10} />
          </button>
        </div>
      </div>

      {/* Body — exercises */}
      {isOpen && (
        <div className="p-4">
          <ExcerciseInput
            key={muscleGroup.muscleGroup}
            parentPath={parentPath}
            muscleGroup={muscleGroup?.muscleGroup}
          />
        </div>
      )}

      <DeleteModal
        isModalOpen={isDeleteMuscleGroupModalOpen || isChangingMuscleGroup}
        setIsModalOpen={
          isChangingMuscleGroup ? setIsChangingMuscleGroup : setIsDeleteMuscleGroupModalOpen
        }
        alertMessage={
          isChangingMuscleGroup ? (
            <>ביצוע פעולה זו ימחק את כל התרגילים שיצרת עבור קבוצת השריר הזו.</>
          ) : undefined
        }
        onConfirm={() => {
          if (isChangingMuscleGroup && muscleGroupToSwapTo !== null) {
            handleUpdateMuscleGroup(muscleGroupToSwapTo);
          } else {
            handleDeleteMuscleGroup();
          }
        }}
      />
    </div>
  );
};
