import React, { useContext, useEffect, useState } from "react";
import ComboBox from "./ComboBox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ISet, IWorkout } from "@/interfaces/IWorkoutPlan";
import SetsContainer from "./SetsContainer";
import DeleteButton from "./buttons/DeleteButton";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useIsWorkoutEditable } from "@/store/isWorkoutEditableStore";

interface ExcerciseInputProps {
  options: string[] | undefined;
  updateWorkouts: (workouts: IWorkout[]) => void;
  exercises?: IWorkout[]
}

const ExcerciseInput: React.FC<ExcerciseInputProps> = ({ options, updateWorkouts, exercises }) => {
  const [workoutObjs, setWorkoutObjs] = useState<IWorkout[]>(exercises ? exercises : [
    {
      id: `1`,
      name: ``,
      sets: [],
    },
  ]);

  const isEditable = useIsWorkoutEditable((state) => state.isEditable)

  const handleChange = (
    e: string | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    index: string
  ) => {
    const name = typeof e === `string` ? `name` : e.target.name;
    const value = typeof e === `string` ? e : e.target.value;

    setWorkoutObjs((prevWorkouts) => {
      return prevWorkouts.map((workout) =>
        workout.id === index ? { ...workout, [name]: value } : workout
      );
    });
  };


  const handleAddExcercise = () => {
    const newObject: IWorkout = {
      id: (workoutObjs.length + 1).toString(),
      name: ``,
      sets: [],
    };

    setWorkoutObjs([...workoutObjs, newObject]);
  };

  const handleDeleteExcercise = (workoutId: string) => {
    const newArr = workoutObjs.filter((workout) => workout.id !== workoutId);

    setWorkoutObjs(newArr);
  };



  const updateSets = (setsArr: ISet[], workoutId: string) => {
    setWorkoutObjs((prevWorkouts) => {
      return prevWorkouts.map((workout) => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            sets: setsArr
          };
        }
        return workout;
      });
    });
  }

  useEffect(() => {
    updateWorkouts(workoutObjs)
  }, [workoutObjs])


  return (
    <div className="w-full">
      {workoutObjs.map((item) => (
        <div className="py-5 flex  gap-2 " key={item.id}>
          {isEditable &&
            <DeleteButton tip="הסר תרגיל" onClick={() => handleDeleteExcercise(item.id)} />
          }
          <div className="flex flex-col gap-5 border-r-2 p-2">
            <h2
              className="font-bold underline"
            >{isEditable ? ` בחר תרגיל:` : `שם התרגיל:`}

            </h2>
            <ComboBox
              options={options}
              existingValue={item.name}
              handleChange={(currentValue) => handleChange(currentValue, item.id)}
            />
            <SetsContainer
              existingSets={item.sets}
              updateSets={(setsArr: ISet[]) => updateSets(setsArr, item.id)}
            />

            <div>
              <Label className="font-bold underline">לינק לסרטון</Label>
              {isEditable ?
                <Input
                  readOnly={!isEditable}
                  placeholder="הכנס לינק כאן..."
                  name="linkToVideo"
                  value={item.linkToVideo}
                  onChange={(e) => handleChange(e, item.id)}
                />
                :
                <p
                  className="py-1 border-b-2"
                >{item.linkToVideo == `` ? `לא קיים` : item.linkToVideo}</p>
              }
            </div>
            <div>
              <Label className="font-bold underline">דגשים</Label>
              {isEditable ?
                <Textarea
                  readOnly={!isEditable}
                  placeholder="תלבש מכנסיים.."
                  name="tipFromTrainer"
                  value={item.tipFromTrainer}
                  onChange={(e) => handleChange(e, item.id)}
                />
                :
                <p
                  className="py-1 border-b-2"
                >{item.tipFromTrainer == `` ? `לא קיים` : item.tipFromTrainer}</p>
              }
            </div>
          </div>
        </div>
      ))}
      {isEditable &&
        <Button
          className="text-[12px] p-1 mr-5 my-2"
          onClick={handleAddExcercise}
        >הוסף תרגיל</Button>
      }
    </div>
  );
};

export default ExcerciseInput;
