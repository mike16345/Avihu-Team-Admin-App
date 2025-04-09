import React, { useState } from "react";
import { IMuscleGroupWorkouts } from "@/interfaces/IWorkoutPlan";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "../ui/button";
import DeleteButton from "../ui/buttons/DeleteButton";
import { Input } from "../ui/input";
import { FaChevronDown } from "react-icons/fa";
import { MuscleGroupContainer } from "./MuscleGroupContainer";
import AddButton from "../ui/buttons/AddButton";
import { SortableItem } from "../DragAndDrop/SortableItem";
import { DragDropWrapper } from "../Wrappers/DragDropWrapper";
import { useFieldArray, useFormContext } from "react-hook-form";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import { FormField, FormItem, FormMessage } from "../ui/form";
import { generateUUID } from "@/lib/utils";

interface WorkoutContainerProps {
  parentPath: `workoutPlans.${number}`;
  onDeleteWorkout: (index: number) => void;
}

const WorkoutPlanContainer: React.FC<WorkoutContainerProps> = ({ parentPath, onDeleteWorkout }) => {
  const { control, watch } = useFormContext<WorkoutSchemaType>();
  const workoutIndex = parentPath.split(".")[1];

  const { replace, append, remove, update } = useFieldArray({
    control,
    name: `${parentPath}.muscleGroups`,
  });

  const [isOpen, setIsOpen] = useState(false);
  const muscleGroups = watch(`${parentPath}.muscleGroups`) as IMuscleGroupWorkouts[];

  const handleAddMuscleGroup = () => {
    const newMuscleGroup: IMuscleGroupWorkouts = {
      muscleGroup: ``,
      exercises: [],
      _id: generateUUID(),
    };

    append(newMuscleGroup);
  };

  return (
    <>
      <div className={`w-full border-b-2 last:border-b-0  rounded py-2 `}>
        <Collapsible defaultOpen={isOpen} open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between gap-4 w-full font-bold text-lg  py-3 ">
            <FormField
              name={`${parentPath}.planName`}
              control={control}
              render={({ field }) => {
                return (
                  <FormItem>
                    <Input {...field} className="w-full sm:w-64" />
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="flex items-center gap-4">
              <DeleteButton tip="הסר אימון" onClick={() => onDeleteWorkout(Number(workoutIndex))} />
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
          <CollapsibleContent className="flex flex-col gap-4 ">
            <DragDropWrapper
              strategy="vertical"
              items={muscleGroups}
              setItems={(items) => {
                replace(items);
              }}
              idKey="_id"
            >
              {({ item, index }) => (
                <SortableItem className="border-b-2 last:border-b-0" item={item} idKey="_id">
                  {() => (
                    <MuscleGroupContainer
                      key={item._id}
                      muscleGroup={item}
                      handleUpdateMuscleGroup={(muscleGroup) => {
                        update(index, { ...item, muscleGroup: muscleGroup, exercises: [] });
                      }}
                      handleDeleteMuscleGroup={() => remove(index)}
                      parentPath={`${parentPath}.muscleGroups.${index}`}
                    />
                  )}
                </SortableItem>
              )}
            </DragDropWrapper>
            <AddButton tip="הוסף קבוצת שריר" onClick={() => handleAddMuscleGroup()} />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  );
};

export default WorkoutPlanContainer;
