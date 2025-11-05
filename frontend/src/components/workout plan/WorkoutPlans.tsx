import { useFieldArray, useFormContext } from "react-hook-form";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import { Button } from "../ui/button";
import { BsPlusCircleFill } from "react-icons/bs";
import WorkoutTabs from "./WorkoutTabs";
import CardioWrapper from "./cardio/CardioWrapper";
import WorkoutPlanContainer from "./WorkoutPlanContainer";
import DeleteModal from "../Alerts/DeleteModal";
import { FC, useRef, useState } from "react";
import { toast } from "sonner";
import TipAdder from "../ui/TipAdder";
import { DragDropWrapper } from "../Wrappers/DragDropWrapper";
import { SortableItem } from "../DragAndDrop/SortableItem";
import { generateUUID } from "@/lib/utils";
import { IWorkoutPlan } from "@/interfaces/IWorkoutPlan";

interface IWorkoutPlanProps {
  displayTips?: boolean;
}

const WorkoutPlans: FC<IWorkoutPlanProps> = ({ displayTips = false }) => {
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
      <div className="size-full flex flex-col p-1.5">
        <div className="size-full">
          <WorkoutTabs
            cardioPlan={<CardioWrapper />}
            workoutPlan={
              <div className="flex flex-col gap-6">
                {displayTips && (
                  <div className="sm:w-[50%] w-full">
                    <TipAdder
                      tips={watch("tips") || []}
                      saveTips={(tips) => setValue("tips", tips)}
                    />
                  </div>
                )}
                <div className={`flex flex-col ${displayTips && "w-[80%]"} gap-4 w-full`}>
                  <DragDropWrapper
                    items={workoutPlans}
                    strategy="vertical"
                    idKey="_id"
                    setItems={replace}
                  >
                    {({ item, index }) => (
                      <SortableItem
                        className="relative w-full border-b-2 last:border-b-0 rounded"
                        idKey={"_id"}
                        item={item}
                      >
                        {() => {
                          return (
                            <WorkoutPlanContainer
                              onDeleteWorkout={(index) => onClickDeleteWorkout(index)}
                              parentPath={`workoutPlans.${index}`}
                            />
                          );
                        }}
                      </SortableItem>
                    )}
                  </DragDropWrapper>
                  <div className="w-full flex items-center justify-center mb-2">
                    <Button type="button" className="w-full sm:w-32" onClick={onAddWorkout}>
                      <div className="flex flex-col items-center font-bold">
                        הוסף אימון
                        <BsPlusCircleFill />
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            }
          />
        </div>
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
