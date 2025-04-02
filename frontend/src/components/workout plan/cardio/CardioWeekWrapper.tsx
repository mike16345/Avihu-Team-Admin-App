import React, { useState } from "react";
import CardioExercise from "./CardioExercise";
import { Button } from "@/components/ui/button";
import { FaChevronDown } from "react-icons/fa";
import DeleteButton from "../../ui/buttons/DeleteButton";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";

interface CardioWeekWrapperProps {
  parentPath: `cardio.plan.weeks.${number}`;
  onDeleteWeek: () => void;
  weekName: string;
}

const CardioWeekWrapper: React.FC<CardioWeekWrapperProps> = ({
  parentPath,
  onDeleteWeek,
  weekName,
}) => {
  const {
    fields: workouts,
    append,
    remove,
  } = useFieldArray<WorkoutSchemaType, `${typeof parentPath}.workouts`>({
    name: `${parentPath}.workouts`,
  });

  const [isOpen, setIsOpen] = useState(false);

  const addExercise = () => {
    const newWorkout = {
      ...workouts[workouts.length - 1],
      name: `אימון ${workouts.length + 1}`,
    };

    append(newWorkout);
  };

  const removeExercise = (index: number) => {
    if (workouts.length === 1) {
      toast.error(`שבוע חייב לכלול לפחות אימון אחד.`);
      return;
    }

    remove(index);
  };

  return (
    <Collapsible
      className="border-b-2 last:border-b-0  rounded py-2"
      defaultOpen={isOpen}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="flex items-center justify-between gap-4 w-full font-bold text-lg  py-3 px-5">
        <h1 className="font-bold text-xl underline">{weekName}</h1>
        <div className="flex gap-5">
          <DeleteButton tip="הסר " onClick={onDeleteWeek} />
          <Button
            onClick={() => setIsOpen((state) => !state)}
            variant="ghost"
            type="button"
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
        {workouts.map((workout, i) => (
          <Collapsible key={workout.id} className=" py-5 bg-background rounded-md ">
            <div className="flex items-center justify-between space-x-4 px-4 pb-2">
              <h2 className="font-bold">{workout.name}</h2>
              <div className="flex gap-5 items-center">
                <DeleteButton tip="הסר אימון" onClick={() => removeExercise(i)} />
                <CollapsibleTrigger asChild className="bg-accent">
                  <Button type="button" variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <CollapsibleContent className="border-t-2">
              <CardioExercise parentPath={`${parentPath}.workouts.${i}`} />
            </CollapsibleContent>
          </Collapsible>
        ))}
        <Button
          variant="outline"
          type="button"
          className="w-fit hover:bg-primary hover:text-text"
          onClick={addExercise}
        >
          הוסף אימון
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CardioWeekWrapper;
