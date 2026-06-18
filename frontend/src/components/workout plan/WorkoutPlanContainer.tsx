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

const MUSCLE_DOT_COLOR: Record<string, string> = {
  חזה: "bg-rose-500",
  גב: "bg-emerald-500",
  כתפיים: "bg-amber-500",
  "יד קדמית": "bg-blue-500",
  "יד אחורית": "bg-indigo-500",
  ביצפס: "bg-blue-500",
  טריצפס: "bg-indigo-500",
  רגליים: "bg-violet-500",
  ישבן: "bg-fuchsia-500",
  תאומים: "bg-teal-500",
  טרפזים: "bg-cyan-500",
  אמות: "bg-sky-500",
  בטן: "bg-orange-500",
};

const getMuscleDotClassName = (group?: string) => {
  if (group && MUSCLE_DOT_COLOR[group]) return MUSCLE_DOT_COLOR[group];
  return "bg-slate-400";
};

const getWorkoutCardClassName = (isOpen: boolean) => {
  if (isOpen) return "border-blue-200 shadow-md";
  return "border-slate-200 dark:border-slate-800";
};

const getToggleButtonClassName = (isOpen: boolean) => {
  if (isOpen) return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";
  return "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800";
};

const getToggleAriaLabel = (isOpen: boolean) => {
  if (isOpen) return "סגור אימון";
  return "פתח אימון";
};

const getWorkoutNameInputSize = (value: string) => {
  const minChars = 14;
  const maxChars = 28;
  return Math.min(maxChars, Math.max(minChars, value.length + 1));
};

const getToggleIcon = (isOpen: boolean) => {
  if (isOpen) return FaChevronUp;
  return FaChevronDown;
};

const WorkoutPlanContainer: React.FC<WorkoutContainerProps> = ({ parentPath, onDeleteWorkout }) => {
  const { control, watch } = useFormContext<WorkoutSchemaType>();
  const workoutIndex = Number(parentPath.split(".")[1]);

  const { replace, append, remove, update } = useFieldArray({
    control,
    name: `${parentPath}.muscleGroups`,
  });

  const [isOpen, setIsOpen] = useState(false);
  const muscleGroups = (watch(`${parentPath}.muscleGroups`) as IMuscleGroupWorkouts[]) ?? [];
  const totalExercises = muscleGroups.reduce((s, g) => s + (g.exercises?.length ?? 0), 0);
  const hasMuscleGroups = muscleGroups.length > 0;
  const ToggleIcon = getToggleIcon(isOpen);

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
      className={`overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all ${getWorkoutCardClassName(
        isOpen
      )} font-heebo`}
    >
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
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${getToggleButtonClassName(
            isOpen
          )}`}
          aria-label={getToggleAriaLabel(isOpen)}
        >
          <ToggleIcon size={11} />
        </button>

        <FormField
          name={`${parentPath}.planName`}
          control={control}
          render={({ field }) => {
            const v = (field.value as string) || "";
            const size = getWorkoutNameInputSize(v);
            return (
              <FormItem className="shrink-0">
                <input
                  {...field}
                  size={size}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="שם האימון"
                />
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {!hasMuscleGroups && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              אין קבוצות שריר עדיין
            </span>
          )}
          {hasMuscleGroups &&
            muscleGroups.map((mg, i) => (
              <span
                key={mg._id || i}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
              >
                <span
                  className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${getMuscleDotClassName(
                    mg.muscleGroup
                  )}`}
                  aria-hidden
                />
                <span>{mg.muscleGroup || "קבוצה"}</span>
                {Boolean(mg.exercises?.length) && (
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {mg.exercises.length}
                  </span>
                )}
              </span>
            ))}
        </div>

        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-blue-100/60 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/30 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 md:inline-flex">
          <span>{muscleGroups.length}</span>
          <span className="opacity-60">·</span>
          <span>{totalExercises}</span>
          <span className="text-[10px] opacity-70">תרגילים</span>
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-all hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
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
