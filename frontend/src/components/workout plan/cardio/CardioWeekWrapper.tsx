import { ICardioWeek, ICardioWorkout } from "@/interfaces/IWorkoutPlan";
import React, { useState } from "react";
import CardioExercise from "./CardioExercise";
import { Button } from "@/components/ui/button";
import { FaChevronDown } from "react-icons/fa";
import DeleteButton from "../buttons/DeleteButton";
import { toast } from "sonner";
import { removeItemAtIndex } from "@/utils/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";

interface CardioWeekWrapperProps {
  week: ICardioWeek;
  setWeek: (obj: ICardioWeek) => void;
  deleteWeek: () => void;
}

const CardioWeekWrapper: React.FC<CardioWeekWrapperProps> = ({ week, setWeek, deleteWeek }) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateCardioWeek = <K extends keyof ICardioWorkout>(
    key: K,
    value: ICardioWorkout[K],
    index: number
  ) => {
    const newObject = { ...week.workouts[index], [key]: value };

    console.log("Updated workout object:", newObject);

    const newWeek = {
      ...week,
      workouts: week.workouts.map((workout, i) => (i === index ? newObject : workout)),
    };

    setWeek(newWeek);
  };

  const addExercise = () => {
    const newWorkout = {
      ...week.workouts[week.workouts.length - 1], // Copy the last workout
      name: `אימון ${week.workouts.length + 1}`, // Update the week name
    };

    setWeek({
      ...week,
      workouts: [...week.workouts, newWorkout], // Add the new workout to the array
    });
  };

  const removeExercise = (index: number) => {
    if (week.workouts.length === 1) {
      toast.error(`שבוע חייב לכלול לפחות אימון אחד.`);
      return;
    }

    // Remove the specified workout from the workouts array
    const updatedWorkouts = removeItemAtIndex(index, week.workouts);

    // Rename workouts in order
    const renamedWorkouts = updatedWorkouts.map((workout, idx) => ({
      ...workout,
      name: `אימון ${idx + 1}`,
    }));

    // Update state with the modified workouts array
    setWeek({
      ...week,
      workouts: renamedWorkouts,
    });
  };

  return (
    <Collapsible
      className="border-b-2 last:border-b-0  rounded py-2"
      defaultOpen={isOpen}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="flex items-center justify-between gap-4 w-full font-bold text-lg  py-3 px-5">
        <h1 className="font-bold text-xl underline">{week.week}</h1>
        <div className="flex gap-5">
          <DeleteButton tip="הסר " onClick={deleteWeek} />
          <Button
            onClick={() => setIsOpen((state) => !state)}
            variant="ghost"
            size="sm"
            className={`w-9 p-0 transition ${isOpen ? "rotate-180" : "rotate-0"}`}
          >
            <FaChevronDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </div>
      </div>
      <CollapsibleContent
        className={`${isOpen ? `bg-accent` : `bg-background`} p-5 rounded-lg flex flex-col gap-5`}
      >
        {week.workouts.map((workout, i) => (
          <Collapsible key={i} className=" py-5 bg-background rounded-md ">
            <div className="flex items-center justify-between space-x-4 px-4 pb-2">
              <h2 className="font-bold">{workout.name}</h2>
              <div className="flex gap-5 items-center">
                <DeleteButton tip="הסר אימון" onClick={() => removeExercise(i)} />
                <CollapsibleTrigger asChild className="bg-accent">
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <CollapsibleContent className="border-t-2">
              <CardioExercise
                isLastItem={i == week.workouts.length - 1}
                existingItem={workout}
                updateExercise={(key, val) => updateCardioWeek(key, val, i)}
              />
            </CollapsibleContent>
          </Collapsible>
        ))}
        <Button variant="outline" className="w-fit" onClick={addExercise}>
          הוסף אימון
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CardioWeekWrapper;
