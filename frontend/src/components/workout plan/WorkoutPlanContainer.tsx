import React, { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FaChevronDown, FaChevronUp, FaPlus, FaTrash } from "react-icons/fa6";
import { IMuscleGroupWorkouts, IWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import { DragDropWrapper } from "../Wrappers/DragDropWrapper";
import { SortableItem } from "../DragAndDrop/SortableItem";
import { FormField, FormItem, FormMessage } from "../ui/form";
import { generateUUID } from "@/lib/utils";

import { MuscleGroupContainer } from "./MuscleGroupContainer";
import WorkoutMuscleGroupPills from "./WorkoutMuscleGroupPills";
import {
  CopyMuscleGroupRequest,
  getWorkoutExerciseCount,
  getWorkoutSetCount,
} from "./workoutPlanCopyUtils";

interface WorkoutContainerProps {
  parentPath: `workoutPlans.${number}`;
  onDeleteWorkout: (index: number) => void;
  workoutPlans: IWorkoutPlan[];
  onCopyMuscleGroup: (request: CopyMuscleGroupRequest) => void;
}

const getWorkoutCardClassName = (isOpen: boolean) => {
  if (isOpen) return "border-blue-200 shadow-md";

  return "border-slate-200 dark:border-slate-800";
};

const getToggleButtonClassName = (isOpen: boolean) => {
  if (isOpen) return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";

  return "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800";
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

const WorkoutPlanContainer: React.FC<WorkoutContainerProps> = ({
  parentPath,
  onDeleteWorkout,
  workoutPlans,
  onCopyMuscleGroup,
}) => {
  const { control, watch } = useFormContext<WorkoutSchemaType>();
  const workoutIndex = Number(parentPath.split(".")[1]);

  const { append, move, remove, update } = useFieldArray({
    control,
    name: `${parentPath}.muscleGroups`,
  });

  const [isOpen, setIsOpen] = useState(false);
  const muscleGroups = (watch(`${parentPath}.muscleGroups`) as IMuscleGroupWorkouts[]) ?? [];
  const totalExercises = getWorkoutExerciseCount({
    planName: "",
    muscleGroups,
  });
  const totalSets = getWorkoutSetCount({
    planName: "",
    muscleGroups,
  });
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
      className={`overflow-hidden rounded-2xl border bg-white font-heebo shadow-sm transition-all dark:bg-slate-900 ${getWorkoutCardClassName(
        isOpen
      )}`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((state) => !state)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen((state) => !state);
          }
        }}
        className="flex cursor-pointer select-none items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
        aria-expanded={isOpen}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen((state) => !state);
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
            const value = (field.value as string) || "";
            const size = getWorkoutNameInputSize(value);

            return (
              <FormItem className="shrink-0">
                <input
                  {...field}
                  size={size}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="שם האימון"
                />
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <WorkoutMuscleGroupPills muscleGroups={muscleGroups} />

        <span className="hidden shrink-0 items-center gap-2 rounded-full border border-blue-100/60 bg-blue-50/60 px-3 py-1 text-[11px] font-bold text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300 md:inline-flex">
          <span className="inline-flex items-baseline gap-1">
            <span>{totalExercises}</span>
            <span className="text-[10px] font-semibold opacity-70">תרגילים</span>
          </span>
          <span className="opacity-40">·</span>
          <span className="inline-flex items-baseline gap-1">
            <span>{totalSets}</span>
            <span className="text-[10px] font-semibold opacity-70">סטים</span>
          </span>
        </span>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDeleteWorkout(workoutIndex);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-rose-700 dark:hover:text-rose-400"
          aria-label="מחק אימון"
        >
          <FaTrash size={11} />
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/30 px-5 py-4 dark:border-slate-800">
          <DragDropWrapper strategy="vertical" items={muscleGroups} onMove={move} idKey="_id">
            {({ item, index }) => (
              <SortableItem key={item._id} item={item} idKey="_id">
                {() => (
                  <MuscleGroupContainer
                    key={item._id}
                    muscleGroup={item}
                    muscleGroupIndex={index}
                    sourceWorkoutIndex={workoutIndex}
                    workoutPlans={workoutPlans}
                    onCopyMuscleGroup={onCopyMuscleGroup}
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-500 transition-all hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
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
