import React, { useContext, useState } from "react";
import ComboBox from "./ComboBox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ISet, IWorkout } from "@/interfaces/IWorkoutPlan";
import SetsContainer from "./SetsContainer";
import { Input } from "../ui/input";
import { isEditableContext } from "./CreateWorkoutPlan";
import { IoClose } from "react-icons/io5";
import { Card, CardContent, CardHeader } from "../ui/card";
import { AddWorkoutPlanCard } from "./AddWorkoutPlanCard";

interface ExcerciseInputProps {
  options: string[] | undefined;
  updateWorkouts: (workouts: IWorkout[]) => void;
  exercises?: IWorkout[];
}

const ExcerciseInput: React.FC<ExcerciseInputProps> = ({ options, updateWorkouts, exercises }) => {
  const [workoutObjs, setWorkoutObjs] = useState<IWorkout[]>(
    exercises || [
      {
        id: `1`,
        name: ``,
        sets: [],
      },
    ]
  );

  const isEditable = useContext(isEditableContext);

  const handleUpdateWorkoutObject = <K extends keyof IWorkout>(
    key: K,
    value: IWorkout[K],
    index: number
  ) => {
    const updatedWorkouts = workoutObjs.map((workout, i) =>
      i === index ? { ...workout, [key]: value } : workout
    );

    setWorkoutObjs(updatedWorkouts);
    updateWorkouts(updatedWorkouts);
  };

  const handleAddExcercise = () => {
    const newObject: IWorkout = {
      id: (workoutObjs.length + 1).toString(),
      name: ``,
      sets: [
        {
          id: 1,
          minReps: 0,
          maxReps: 0,
        },
      ],
    };

    const newArr = [...workoutObjs, newObject];

    setWorkoutObjs(newArr);
    updateWorkouts(newArr);
  };

  const handleDeleteExcercise = (index: number) => {
    const newArr = workoutObjs.filter((_, i) => i !== index);

    setWorkoutObjs(newArr);
    updateWorkouts(newArr);
  };

  const updateSets = (setsArr: ISet[], index: number) => {
    const updatedWorkouts = workoutObjs.map((workout, i) => {
      if (i === index) {
        return {
          ...workout,
          sets: setsArr,
        };
      }
      return workout;
    });

    setWorkoutObjs(updatedWorkouts);
    updateWorkouts(updatedWorkouts);
  };

  return (
    <div className="w-full flex flex-col gap-3 px-2 py-4">
      <div className="grid grid-cols-2 gap-4">
        {workoutObjs.map((item, i) => (
          <Card
            key={i}
            className=" px-3 py-2 border-b-2 last:border-b-0  max-h-[550px] overflow-y-auto custom-scrollbar"
          >
            <CardHeader className="">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold underline">תרגיל:</h2>
                  {isEditable && (
                    <div onClick={() => handleDeleteExcercise(i)}>
                      <IoClose className="hover:scale-105  cursor-pointer" size={22} />
                    </div>
                  )}
                </div>
                {isEditable ? (
                  <ComboBox
                    options={options}
                    existingValue={item.name}
                    handleChange={(currentValue) =>
                      handleUpdateWorkoutObject("name", currentValue, i)
                    }
                  />
                ) : (
                  <p className="font-bold">{item.name}</p>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 ">
              <SetsContainer
                existingSets={item.sets}
                updateSets={(setsArr: ISet[]) => updateSets(setsArr, i)}
              />
              <div className=" flex flex-col gap-1">
                <div>
                  <Label className="font-bold underline">לינק לסרטון</Label>
                  {isEditable ? (
                    <Input
                      readOnly={!isEditable}
                      placeholder="הכנס לינק כאן..."
                      name="linkToVideo"
                      value={item.linkToVideo}
                      onChange={(e) => handleUpdateWorkoutObject("linkToVideo", e.target.value, i)}
                    />
                  ) : (
                    <p className="py-1 border-b-2">
                      {item.linkToVideo == `` ? `לא קיים` : item.linkToVideo}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="font-bold underline">דגשים</Label>
                  {isEditable ? (
                    <Textarea
                      readOnly={!isEditable}
                      placeholder="דגשים למתאמן..."
                      name="tipFromTrainer"
                      value={item.tipFromTrainer}
                      onChange={(e) =>
                        handleUpdateWorkoutObject("tipFromTrainer", e.target.value, i)
                      }
                    />
                  ) : (
                    <p className="border-b-2">
                      {item.tipFromTrainer == `` ? `לא קיים` : item.tipFromTrainer}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {isEditable && (
          <div className="h-[550px]">
            <AddWorkoutPlanCard onClick={() => handleAddExcercise()} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcerciseInput;
