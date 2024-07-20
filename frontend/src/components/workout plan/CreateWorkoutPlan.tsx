import React, { createContext, Fragment, useEffect, useState } from "react";
import ComboBox from "./ComboBox";
import {
  ICompleteWorkoutPlan,
  IMuscleGroupWorkouts,
  IWorkoutPlan,
} from "@/interfaces/IWorkoutPlan";
import MuscleGroupContainer from "./MuscleGroupContainer";
import { useWorkoutPlanApi } from "@/hooks/useWorkoutPlanApi";
import { cleanWorkoutObject } from "@/utils/workoutPlanUtils";
import { Button } from "../ui/button";
import { BsFillPencilFill } from "react-icons/bs";
import { BsPlusCircleFill } from "react-icons/bs";
import { useParams } from "react-router-dom";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner";

export const isEditableContext = createContext<boolean>(false);

const CreateWorkoutPlan: React.FC = () => {
  const { id } = useParams();
  const { addWorkoutPlan, getWorkoutPlanByUserId, updateWorkoutPlanByUserId } = useWorkoutPlanApi();

  // global
  const [isEditable, setIsEditable] = useState<boolean>(false);

  //temp states
  const workoutTemp: string[] = [`AB`, `ABC`, `יומי`, `התאמה אישית`];

  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [workoutPlan, setWorkoutPlan] = useState<IWorkoutPlan[]>([]);

  const handlePlanNameChange = (newName: string, index: number) => {
    const newWorkoutPlan = workoutPlan.map((workout, i) =>
      i == index ? { ...workout, planName: newName } : workout
    );
    setWorkoutPlan(newWorkoutPlan);
  };

  const handleAddWorkout = () => {
    const newObject = { planName: `אימון ${workoutPlan.length + 1}`, workouts: [] };

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
          i === index ? { ...workout, workouts: workouts } : workout
        );
      } else {
        return [
          ...prevWorkoutPlan,
          { planName: `אימון ${workoutPlan.length + 1}`, workouts: workouts },
        ];
      }
    });
  };

  const handleSelect = (splitVal: string) => {
    const initalWorkoutPlan = [];
    let iterater = 1;

    switch (splitVal) {
      case `AB`:
        iterater = 2;
        break;
      case `ABC`:
        iterater = 3;
        break;
      case `יומי`:
        iterater = 7;
        break;
      case `התאמה אישית`:
        iterater = 1;
        break;
    }

    for (let index = 1; index <= iterater; index++) {
      if (splitVal === `AB` || splitVal === `ABC`) {
        initalWorkoutPlan.push({
          planName: `אימון ${splitVal[index - 1]}`,
          workouts: [],
        });
      } else {
        initalWorkoutPlan.push({
          planName: `אימון ${index}`,
          workouts: [],
        });
      }
    }

    setWorkoutPlan(initalWorkoutPlan);
  };

  const handleSubmit = async () => {
    if (!id) return;

    const postObject: ICompleteWorkoutPlan = {
      userId: id,
      workoutPlans: [...workoutPlan],
    };

    const cleanedPostObject = cleanWorkoutObject(postObject);

    if (isCreate) {
      addWorkoutPlan(id, cleanedPostObject);
    } else {
      updateWorkoutPlanByUserId(id, cleanedPostObject);
    }

      if (isCreate) {
      addWorkoutPlan(id,cleanedPostObject)
        .then(() => toast.success(`תוכנית אימון נשמרה בהצלחה!`))
        .catch(err => toast.error(`אופס, נתקלנו בבעיה!`, {
          description: `${err.response.data.message}`,
        }))
    } else {
      updateWorkoutPlanByUserId(id, cleanedPostObject)
        .then(() => toast.success(`תוכנית אימון נשמרה בהצלחה!`))
        .catch(err => toast.error(`אופס, נתקלנו בבעיה!`, {
          description: `${err.response.data.message}`
        }))
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
    <isEditableContext.Provider value={isEditable}>
      <div className="flex flex-col gap-4 p-5 overflow-y-scroll hide-scrollbar w-5/6 max-h-[95vh] ">
        <div className=" w-full flex justify-between items-center">
          <h1 className="text-4xl">תוכנית אימון</h1>
          <Toggle
            onClick={() => setIsEditable(!isEditable)}
            className="px-3 rounded cursor-pointer "
          >
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
              options={workoutTemp}
              handleChange={(currentValue) => handleSelect(currentValue)}
            />
          )}

          {workoutPlan.map((workout, i) => (
            <Fragment key={i}>
              <MuscleGroupContainer
                workout={workout.workouts}
                handleSave={(workouts) => handleSave(i, workouts)}
                title={workout.planName}
                handlePlanNameChange={(newName) => handlePlanNameChange(newName, i)}
                handleDeleteWorkout={() => handleDeleteWorkout(i)}
              />
            </Fragment>
          ))}
          <div className="w-full flex items-center">
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
    </isEditableContext.Provider>
  );
};

export default CreateWorkoutPlan;
