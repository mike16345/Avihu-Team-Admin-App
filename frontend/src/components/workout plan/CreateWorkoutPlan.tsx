import React, { createContext, useEffect, useState } from "react";
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
import { Toggle } from "@/components/ui/toggle"



export const isEditableContext = createContext<boolean>(false);


const CreateWorkoutPlan: React.FC = () => {
  const { id } = useParams();
  const { addWorkoutPlan, getWorkoutPlanByUserId, updateWorkoutPlanByUserId } = useWorkoutPlanApi();

  // global
  const [isEditable, setIsEditable] = useState<boolean>(false)


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

  const hanldeSubmit = async () => {
    if (!id) return;

    const postObject: ICompleteWorkoutPlan = {
      userId: id,
      workoutPlans: [...workoutPlan],
    };

    const cleanedPostObject = cleanWorkoutObject(postObject);


    if (isCreate) {
      addWorkoutPlan(cleanedPostObject)
    } else {
      updateWorkoutPlanByUserId(id, cleanedPostObject)
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
      <div className="p-5 overflow-y-scroll hide-scrollbar max-h-[95vh] w-full">
        <h1 className="text-4xl">תוכנית אימון</h1>
        <p>
          {isEditable
            ? `כאן תוכל לערוך תוכנית אימון קיימת ללקוח שלך`
            : `כאן תוכל לצפות בתוכנית האימון הקיימת של לקוח זה`}
        </p>
        <div className="p-2 py-4">
          {isEditable && (
            <ComboBox
              options={workoutTemp}
              handleChange={(currentValue) => handleSelect(currentValue)}
            />
          )}
          {workoutPlan[0] && (
            <Toggle color="bg-primary"
              onClick={() => setIsEditable(!isEditable)}
              className="absolute left-20 top-10 h-10 flex items-center px-2 rounded cursor-pointer "
            >
              <BsFillPencilFill />
            </Toggle>
          )}

          {workoutPlan.map((workout, i) => (
            <div key={i} className="flex items-start">
              <MuscleGroupContainer
                workout={workout.workouts}
                handleSave={(workouts) => handleSave(i, workouts)}
                title={workout.planName}
                handlePlanNameChange={(newName) => handlePlanNameChange(newName, i)}
                handleDeleteWorkout={() => handleDeleteWorkout(i)}
              />
            </div>
          ))}
          <div className="w-full flex justify-center">
            {isEditable && (
              <Button onClick={handleAddWorkout}>
                <div className="flex flex-col items-center">
                  הוסף אימון
                  <BsPlusCircleFill />
                </div>
              </Button>
            )}
          </div>
        </div>
        {isEditable && <Button onClick={hanldeSubmit}>שמור תוכנית אימון</Button>}
      </div>
    </isEditableContext.Provider>
  );
};

export default CreateWorkoutPlan;
