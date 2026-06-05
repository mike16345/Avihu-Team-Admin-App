/**
 * WorkoutPlanContainer — matches the DesignPreview WorkoutCard:
 *  - rounded-2xl card with purple-200 border + shadow when open
 *  - 9×9 chevron toggle (purple-100 active background)
 *  - rounded input for the workout name
 *  - inline meta count
 *  - delete button on the far left
 *  - body has slate-50/30 wash + dashed "הוסף קבוצת שריר" CTA
 */
import React, { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FaChevronDown, FaChevronUp, FaTrash, FaPlus } from "react-icons/fa6";
import { IMuscleGroupWorkouts } from "@/interfaces/IWorkoutPlan";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import { MuscleGroupContainer } from "./MuscleGroupContainer";
import { DragDropWrapper } from "../Wrappers/DragDropWrapper";
import { SortableItem } from "../DragAndDrop/SortableItem";
import { FormField, FormItem, FormMessage } from "../ui/form";
import { generateUUID } from "@/lib/utils";

interface WorkoutContainerProps {
  parentPath: `workoutPlans.${number}`;
  onDeleteWorkout: (index: number) => void;
}

const WorkoutPlanContainer: React.FC<WorkoutContainerProps> = ({
  parentPath,
  onDeleteWorkout,
}) => {
  const { control, watch } = useFormContext<WorkoutSchemaType>();
  const workoutIndex = Number(parentPath.split(".")[1]);

  const { replace, append, remove, update } = useFieldArray({
    control,
    name: `${parentPath}.muscleGroups`,
  });

  const [isOpen, setIsOpen] = useState(false);
  const muscleGroups = (watch(`${parentPath}.muscleGroups`) as IMuscleGroupWorkouts[]) ?? [];
  const totalExercises = muscleGroups.reduce((s, g) => s + (g.exercises?.length ?? 0), 0);

  /**
   * Muscle-group color palette (same as MuscleGroupContainer / Selector).
   * Used for the collapsed-state chips so the trainer can see at a glance
   * which groups this workout already contains.
   */
  const MUSCLE_CHIP_COLORS: Record<string, string> = {
    חזה: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
    גב: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    כתפיים: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    "יד קדמית": "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    "יד אחורית": "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
    ביצפס: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    טריצפס: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
    רגליים: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
    ישבן: "bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300",
    תאומים: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
    טרפזים: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300",
    אמות: "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
    בטן: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
  };
  const chipFor = (g?: string) =>
    (g && MUSCLE_CHIP_COLORS[g]) ||
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";

  const handleAddMuscleGroup = () => {
    const newMuscleGroup: IMuscleGroupWorkouts = {
      muscleGroup: "",
      exercises: [],
      _id: generateUUID(),
    };
    append(newMuscleGroup);
  };

  return (
    <div
      dir="rtl"
      className={`overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all ${
        isOpen ? "border-purple-200 shadow-md" : "border-slate-200 dark:border-slate-800"
      }`}
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* Clicking anywhere on the header row toggles the workout open/closed,
          EXCEPT on the interactive children (name input, delete button) —
          they stop propagation so they keep their own behaviour. */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((s) => !s)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((s) => !s);
          }
        }}
        className="flex cursor-pointer select-none items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
        aria-expanded={isOpen}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((s) => !s);
          }}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isOpen
              ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
              : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
          aria-label={isOpen ? "סגור אימון" : "פתח אימון"}
        >
          {isOpen ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
        </button>

        <FormField
          name={`${parentPath}.planName`}
          control={control}
          render={({ field }) => {
            // Auto-size: input grows leftwards as the user types more. The
            // `size` attribute controls the rendered width in characters;
            // we clamp it to [minChars, maxChars] so it never collapses
            // away or eats the whole row.
            const v = (field.value as string) || "";
            const minChars = 14;
            const maxChars = 28;
            const size = Math.min(maxChars, Math.max(minChars, v.length + 1));
            return (
              <FormItem className="shrink-0">
                <input
                  {...field}
                  size={size}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder="שם האימון"
                />
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Muscle group chips — shown in collapsed (and open) state so the
            trainer can see which groups are already inside the workout. */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {muscleGroups.length === 0 ? (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              אין קבוצות שריר עדיין
            </span>
          ) : (
            muscleGroups.map((mg, i) => (
              <span
                key={mg._id || i}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${chipFor(
                  mg.muscleGroup
                )}`}
              >
                {mg.muscleGroup || "קבוצה"}
                {mg.exercises?.length ? (
                  <span className="mx-1 opacity-60">·</span>
                ) : null}
                {mg.exercises?.length ? (
                  <span className="opacity-75">{mg.exercises.length}</span>
                ) : null}
              </span>
            ))
          )}
        </div>

        <span className="hidden whitespace-nowrap text-xs text-slate-400 dark:text-slate-500 md:inline">
          {muscleGroups.length} קבוצות · {totalExercises} תרגילים
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteWorkout(workoutIndex);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400"
          aria-label="מחק אימון"
        >
          <FaTrash size={11} />
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 px-5 py-4">
          <DragDropWrapper
            strategy="vertical"
            items={muscleGroups}
            setItems={(items) => replace(items)}
            idKey="_id"
          >
            {({ item, index }) => (
              <SortableItem item={item} idKey="_id">
                {() => (
                  <MuscleGroupContainer
                    key={item._id}
                    muscleGroup={item}
                    handleUpdateMuscleGroup={(muscleGroup) => {
                      update(index, { ...item, muscleGroup, exercises: [] });
                    }}
                    handleDeleteMuscleGroup={() => remove(index)}
                    parentPath={`${parentPath}.muscleGroups.${index}`}
                  />
                )}
              </SortableItem>
            )}
          </DragDropWrapper>

          <button
            type="button"
            onClick={handleAddMuscleGroup}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-all hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/40 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300"
          >
            <FaPlus size={11} />
            <span>הוסף קבוצת שריר</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlanContainer;
