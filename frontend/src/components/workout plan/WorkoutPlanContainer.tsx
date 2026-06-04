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
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
        isOpen ? "border-purple-200 shadow-md" : "border-slate-200"
      }`}
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          type="button"
          onClick={() => setIsOpen((s) => !s)}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isOpen
              ? "bg-purple-100 text-purple-700"
              : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          }`}
          aria-label={isOpen ? "סגור אימון" : "פתח אימון"}
        >
          {isOpen ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
        </button>

        <FormField
          name={`${parentPath}.planName`}
          control={control}
          render={({ field }) => (
            <FormItem className="flex-1">
              <input
                {...field}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="שם האימון"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <span className="hidden text-xs text-slate-400 sm:inline">
          {muscleGroups.length} קבוצות · {totalExercises} תרגילים
        </span>

        <button
          type="button"
          onClick={() => onDeleteWorkout(workoutIndex)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600"
          aria-label="מחק אימון"
        >
          <FaTrash size={11} />
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/30 px-5 py-4">
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-500 transition-all hover:border-purple-300 hover:bg-purple-50/40 hover:text-purple-700"
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
