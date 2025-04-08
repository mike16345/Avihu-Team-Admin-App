import { useFieldArray, useFormContext } from "react-hook-form";
import { fullWorkoutPlanSchema } from "@/schemas/workoutPlanSchema";
import { z } from "zod";
import { Button } from "../ui/button";
import { BsPlusCircleFill } from "react-icons/bs";
import WorkoutTabs from "./WorkoutTabs";
import CardioWrapper from "./cardio/CardioWrapper";
import WorkoutPlanContainer from "./WorkoutPlanContainer";
import DeleteModal from "../Alerts/DeleteModal";
import { FC, useRef, useState } from "react";
import { toast } from "sonner";
import TipAdder from "../ui/TipAdder";

interface IWorkoutPlanProps {
  displayTips?: boolean;
}

const WorkoutPlans: FC<IWorkoutPlanProps> = ({ displayTips = false }) => {
  const form = useFormContext<z.infer<typeof fullWorkoutPlanSchema>>();
  const {
    fields: workoutPlans,
    append: addWorkoutPlan,
    remove: removeWorkoutPlan,
  } = useFieldArray({
    control: form.control,
    name: "workoutPlans",
  });
  const { setValue, watch } = form;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const workoutIndex = useRef<number | null>(null);

  const onAddWorkout = () => {
    addWorkoutPlan({ planName: `אימון ${workoutPlans.length + 1}`, muscleGroups: [] });
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
      <div className="size-full flex flex-col p-6  min-h-screen">
        <div className="size-full">
          <WorkoutTabs
            cardioPlan={<CardioWrapper />}
            workoutPlan={
              <div className="flex flex-col-reverse sm:flex-row gap-6">
                <div className={`flex flex-col ${displayTips && "w-[80%]"} gap-4 w-full`}>
                  {workoutPlans.map((workoutPlan, index) => {
                    return (
                      <div
                        key={workoutPlan.id}
                        className="relative w-full border-b-2 last:border-b-0 rounded"
                      >
                        <WorkoutPlanContainer
                          onDeleteWorkout={(index) => onClickDeleteWorkout(index)}
                          parentPath={`workoutPlans.${index}`}
                        />
                      </div>
                    );
                  })}
                  <div className="w-full flex items-center justify-center mb-2">
                    <Button type="button" className="w-full sm:w-32" onClick={onAddWorkout}>
                      <div className="flex flex-col items-center font-bold">
                        הוסף אימון
                        <BsPlusCircleFill />
                      </div>
                    </Button>
                  </div>
                </div>
                {displayTips && (
                  <div className="w-[20%]">
                    <TipAdder
                      tips={watch("tips") || []}
                      saveTips={(tips) => setValue("tips", tips)}
                    />
                  </div>
                )}
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
