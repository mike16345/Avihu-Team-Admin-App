/**
 * WorkoutPlans — redesigned wrapper that composes WorkoutTabs with the
 * workout list (workouts / cardio / tips). Keeps all the existing form-state
 * hooks (`useFormContext` + `useFieldArray`) and drag-drop behaviour.
 */
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { FaPlus, FaDumbbell } from "react-icons/fa6";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import WorkoutTabs from "./WorkoutTabs";
import CardioWrapper from "./cardio/CardioWrapper";
import WorkoutPlanContainer from "./WorkoutPlanContainer";
import DeleteModal from "../Alerts/DeleteModal";
import { DragDropWrapper } from "../Wrappers/DragDropWrapper";
import { SortableItem } from "../DragAndDrop/SortableItem";
import { generateUUID } from "@/lib/utils";
import { IWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import TextEditor from "../ui/TextEditor";

const WorkoutPlans = () => {
  const form = useFormContext<WorkoutSchemaType>();
  const { control, setValue, watch } = form;
  const {
    append: addWorkoutPlan,
    remove: removeWorkoutPlan,
    replace,
  } = useFieldArray({
    control,
    name: "workoutPlans",
  });

  const workoutPlans = watch("workoutPlans") as IWorkoutPlan[];

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const workoutIndex = useRef<number | null>(null);

  const onAddWorkout = () => {
    const newWorkoutPlan: IWorkoutPlan = {
      planName: `אימון ${workoutPlans.length + 1}`,
      muscleGroups: [],
      _id: generateUUID(),
    };
    addWorkoutPlan(newWorkoutPlan);
  };

  const onClickDeleteWorkout = (index: number) => {
    workoutIndex.current = index;
    setIsDeleteModalOpen(true);
  };

  const onConfirmDeleteWorkout = () => {
    if (workoutIndex.current == null) return;
    removeWorkoutPlan(workoutIndex.current!);
    workoutIndex.current = null;
    toast.success("אימון נמחק בהצלחה!");
  };

  const totalWorkouts = workoutPlans?.length ?? 0;
  const totalExercises =
    workoutPlans?.reduce(
      (sum, w) =>
        sum + (w.muscleGroups?.reduce((s, g) => s + (g.exercises?.length ?? 0), 0) ?? 0),
      0
    ) ?? 0;

  return (
    <>
      <div
        dir="rtl"
        className="flex w-full flex-col gap-4"
        style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
      >
        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <FaDumbbell size={16} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">תוכנית אימונים</h1>
              <p className="text-xs text-slate-500">
                {totalWorkouts} {totalWorkouts === 1 ? "אימון" : "אימונים"} ·{" "}
                {totalExercises} תרגילים
              </p>
            </div>
          </div>
        </div>

        <WorkoutTabs
          tips={
            <TextEditor
              value={watch("tips")?.join(" ") || ""}
              onChange={(val) => setValue("tips", [val])}
            />
          }
          cardioPlan={<CardioWrapper />}
          workoutPlan={
            <div className="flex flex-col gap-4">
              <DragDropWrapper
                items={workoutPlans}
                strategy="vertical"
                idKey="_id"
                setItems={replace}
              >
                {({ item, index }) => (
                  <SortableItem
                    className="relative w-full overflow-hidden rounded-2xl"
                    idKey={"_id"}
                    item={item}
                  >
                    {() => (
                      <WorkoutPlanContainer
                        onDeleteWorkout={(index) => onClickDeleteWorkout(index)}
                        parentPath={`workoutPlans.${index}`}
                      />
                    )}
                  </SortableItem>
                )}
              </DragDropWrapper>

              <button
                type="button"
                onClick={onAddWorkout}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/40 px-4 py-4 text-sm font-semibold text-slate-500 transition-all hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
              >
                <FaPlus size={12} />
                <span>הוסף אימון חדש</span>
              </button>
            </div>
          }
        />
      </div>

      <DeleteModal
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
        onConfirm={onConfirmDeleteWorkout}
      />
    </>
  );
};

export default WorkoutPlans;
