import React, { useState } from "react";
import ComboBox from "./ComboBox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ISet, IWorkout } from "@/interfaces/IWorkoutPlan";
import SetsContainer from "./SetsContainer";
import AddButton from "./buttons/AddButton";
import DeleteButton from "./buttons/DeleteButton";

interface ExcerciseInputProps {
  options: string[];
  handleSave: (workouts: IWorkout[]) => void;
  title: string;
}

const ExcerciseInput: React.FC<ExcerciseInputProps> = ({ options, handleSave, title }) => {
  const [workoutObjs, setWorkoutObjs] = useState<IWorkout[]>([
    {
      id: `1`,
      name: ``,
      tipFromTrainer: ``,
      sets: [],
    },
  ]);

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
      tipFromTrainer: ``,
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



  return (
    <div className="border-b-2 py-4 w-[80%]">
      <Collapsible>
        <CollapsibleTrigger className="flex items-center font-bold text-lg">
          {title}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          {workoutObjs.map((item) => (
            <div className="py-5 flex items-start gap-5 border-b-4" key={item.id}>
              <div className="flex flex-col gap-5">
                <ComboBox
                  options={options}
                  handleChange={(currentValue) => handleChange(currentValue, item.id)}
                />
                <SetsContainer
                  updateSets={(setsArr: ISet[]) => updateSets(setsArr, item.id)}
                />

                <div>
                  <Label>דגשים</Label>
                  <Textarea
                    placeholder="תלבש מכנסיים.."
                    name="tipFromTrainer"
                    value={item.tipFromTrainer}
                    onChange={(e) => handleChange(e, item.id)}
                  />
                </div>
              </div>
              <DeleteButton tip="הסר תרגיל" clickFunction={() => handleDeleteExcercise(item.id)} />
            </div>
          ))}
          <AddButton tip="הוסף תרגיל" clickFunction={handleAddExcercise} />
          <Button className="mr-2" onClick={() => handleSave(workoutObjs)}>
            שמור
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ExcerciseInput;
