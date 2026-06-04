/**
 * WorkoutPlans — matches the original DesignPreview layout:
 *  - One sticky pill-tab bar at the top with the three sections, no
 *    separate "page header" card.
 *  - Workouts: drag-sortable list of WorkoutPlanContainer cards + a
 *    dashed "הוסף אימון" CTA at the bottom.
 *  - Cardio + Tips: rendered as in the original.
 */
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { FaPlus } from "react-icons/fa6";
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

  return (
    <>
      <div
        dir="rtl"
        className="flex w-full flex-col gap-4"
        style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
      >
        <WorkoutTabs
          tips={
            <TextEditor
              value={watch("tips")?.join(" ") || ""}
              onChange={(val) => setValue("tips", [val])}
            />
          }
          cardioPlan={<CardioWrapper />}
          workoutPlan={
            <div className="flex flex-col gap-3">
              <DragDropWrapper
                items={workoutPlans}
                strategy="vertical"
                idKey="_id"
                setItems={replace}
              >
                {({ item, index }) => (
                  <SortableItem
                    className="relative w-full overflow-visible"
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/40 px-4 py-3.5 text-sm font-semibold text-slate-500 transition-all hover:border-purple-300 hover:bg-purple-50/40 hover:text-purple-700"
              >
                <FaPlus size={12} />
                <span>הוסף אימון</span>
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
