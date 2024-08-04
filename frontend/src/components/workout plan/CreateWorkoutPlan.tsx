import React, { Fragment, useEffect, useState } from "react";
import ComboBox from "./ComboBox";
import {
  ICompleteWorkoutPlan,
  IMuscleGroupWorkouts,
  IWorkoutPlan,
} from "@/interfaces/IWorkoutPlan";
import WorkoutContainer from "./WorkoutPlanContainer";
import { useWorkoutPlanApi } from "@/hooks/useWorkoutPlanApi";
import { cleanWorkoutObject } from "@/utils/workoutPlanUtils";
import { Button } from "../ui/button";
import { BsFillPencilFill } from "react-icons/bs";
import { BsPlusCircleFill } from "react-icons/bs";
import { useParams } from "react-router-dom";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner";
import { useWorkoutPlanPresetApi } from "@/hooks/useWorkoutPlanPresetsApi";
import { useIsEditableContext } from "@/context/useIsEditableContext";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";

const CreateWorkoutPlan: React.FC = () => {
  const { id } = useParams();
  const { addWorkoutPlan, getWorkoutPlanByUserId, updateWorkoutPlanByUserId } = useWorkoutPlanApi();
  const { getAllWorkoutPlanPresets } = useWorkoutPlanPresetApi();
  const { isEditable, setIsEditable, toggleIsEditable } = useIsEditableContext();

  const [isCreate, setIsCreate] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<IWorkoutPlan[]>([]);

  const handlePlanNameChange = (newName: string, index: number) => {
    const newWorkoutPlan = workoutPlan.map((workout, i) =>
      i == index ? { ...workout, planName: newName } : workout
    );

    setWorkoutPlan(newWorkoutPlan);
  };

  const handleAddWorkout = () => {
    const newObject: IWorkoutPlan = {
      planName: `אימון ${workoutPlan.length + 1}`,
      muscleGroups: [],
    };

    setWorkoutPlan([...workoutPlan, newObject]);
  };

  const handleDeleteWorkout = (index: number) => {
    const filteredArr = workoutPlan.filter((_, i) => i !== index);

    setWorkoutPlan(filteredArr);
  };

  const handleSave = (index: number, workouts: IMuscleGroupWorkouts[]) => {
    setWorkoutPlan((prevWorkoutPlan) => {
      const workoutExists = prevWorkoutPlan[index];

      if (workoutExists) {
        return prevWorkoutPlan.map((workout, i) =>
          i === index ? { ...workout, muscleGroups: workouts } : workout
        );
      } else {
        return [
          ...prevWorkoutPlan,
          { planName: `אימון ${workoutPlan.length + 1}`, muscleGroups: workouts },
        ];
      }
    });
  };

  const handleSubmit = async () => {
    if (!id) return;

    const postObject: ICompleteWorkoutPlan = {
      workoutPlans: [...workoutPlan],
    };

    const cleanedPostObject = cleanWorkoutObject(postObject);

    if (isCreate) {
      addWorkoutPlan(id, cleanedPostObject)
        .then(() => toast.success(`תוכנית אימון נשמרה בהצלחה!`))
        .catch((err) =>
          toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
            description: `${err.response.data.message}`,
          })
        );
    } else {
      updateWorkoutPlanByUserId(id, cleanedPostObject)
        .then(() => toast.success(`תוכנית אימון נשמרה בהצלחה!`))
        .catch((err) =>
          toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
            description: `${err.response.data.message}`,
          })
        );
    }
  };

  useEffect(() => {
    if (!id) return;

    getWorkoutPlanByUserId(id)
      .then((data) => setWorkoutPlan(data.workoutPlans))
      .catch((err) => {
        if (err.response.data.message == `Workout plan not found.`) {
          setIsCreate(true);
          setIsEditable(true);
        }
      });
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 p-5 overflow-y-scroll hide-scrollbar w-5/6 max-h-[95vh] ">
        <div className=" w-full flex justify-between items-center">
          <h1 className="text-4xl">תוכנית אימון</h1>
          <Toggle onClick={() => toggleIsEditable()} className="px-3 rounded cursor-pointer ">
            <BsFillPencilFill />
          </Toggle>
        </div>
        <p>
          {isEditable
            ? `כאן תוכל לערוך תוכנית אימון קיימת ללקוח שלך`
            : `כאן תוכל לצפות בתוכנית האימון הקיימת של לקוח זה`}
        </p>
        <div className="flex flex-col gap-4">
          {isEditable && (
            <ComboBox
              getOptions={getAllWorkoutPlanPresets}
              handleChange={(currentValue) => setWorkoutPlan(currentValue.workoutPlans)}
            />
          )}

          {workoutPlan.map((workout, i) => {
            console.log("workout", workout);
            return (
              <Fragment key={i}>
                <WorkoutContainer
                  initialMuscleGroups={workout.muscleGroups}
                  handleSave={(workouts) => handleSave(i, workouts)}
                  title={workout.planName}
                  handlePlanNameChange={(newName) => handlePlanNameChange(newName, i)}
                  handleDeleteWorkout={() => handleDeleteWorkout(i)}
                />
              </Fragment>
            );
          })}
          <div className="w-full flex items-center justify-center">
            {isEditable && (
              <Button onClick={handleAddWorkout}>
                <div className="flex flex-col items-center font-bold">
                  הוסף אימון
                  <BsPlusCircleFill />
                </div>
              </Button>
            )}
          </div>
        </div>
        {isEditable && (
          <div className="flex justify-end">
            <Button variant={"success"} onClick={handleSubmit}>
              שמור תוכנית אימון
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateWorkoutPlan;
