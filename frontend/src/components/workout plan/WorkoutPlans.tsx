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
    removeWorkoutPlan(workoutIndex.current);
    workoutIndex.current = null;
    toast.success("אימון נמחק בהצלחה!");
  };

  return (
    <>
      <div dir="rtl" className="flex w-full flex-col gap-4 font-heebo">
        <WorkoutTabs
          tips={
            <TextEditor
              value={watch("tips")?.join(" ") || ""}
              onChange={(val) => setValue("tips", [val], { shouldDirty: true })}
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 px-4 py-3.5 text-sm font-semibold text-slate-500 dark:text-slate-400 transition-all hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
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
