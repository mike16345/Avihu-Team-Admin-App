import React from "react";
import SetsInput from "./SetsInput";
import { ISet } from "@/interfaces/IWorkoutPlan";
import AddButton from "../ui/buttons/AddButton";
import DeleteButton from "../ui/buttons/DeleteButton";
import CopyButton from "../ui/buttons/CopyButton";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import { useFieldArray, useFormContext } from "react-hook-form";
import { deepClone } from "@/lib/utils";

interface SetsContainerProps {
  parentPath: `workoutPlans.${number}.muscleGroups.${number}.exercises.${number}`;
}

export const defaultSet: ISet = {
  minReps: 0,
  maxReps: 0,
};

const SetsContainer: React.FC<SetsContainerProps> = ({ parentPath }) => {
  const { control, getValues } = useFormContext<WorkoutSchemaType>();
  const { fields, append, remove, update } = useFieldArray<
    WorkoutSchemaType,
    `${typeof parentPath}.sets`
  >({
    name: `${parentPath}.sets`,
    control,
  });

  const createSet = () => {
    append({ ...defaultSet });
  };

  const removeSet = (index: number) => {
    if (fields.length === 1) return; // Prevent removing last set
    remove(index);
  };

  const copySet = (index: number) => {
    const sets = getValues(`${parentPath}.sets`);
    const item = sets[index];
    const newSet = deepClone(item);
    append(newSet);
  };

  const updateSet = (index: number, newSet: ISet) => {
    update(index, newSet);
  };

  return (
    <div className="flex flex-col gap-2 w-fit">
      <h2 className="underline font-bold pt-2">סטים:</h2>
      <div className="flex flex-col gap-4">
        {fields.map((field, i) => (
          <SetsInput
            key={field.id}
            index={i}
            setNumber={i + 1}
            fieldNamePrefix={`${parentPath}.sets`}
            onUpdateSet={updateSet}
          >
            <div className="flex items-center mt-6 gap-2">
              <DeleteButton
                disabled={fields.length === 1}
                tip="הסר סט"
                onClick={() => removeSet(i)}
              />
              <CopyButton tip="שכפל סט" onClick={() => copySet(i)} />
            </div>
          </SetsInput>
        ))}
      </div>
      <div className="border-t-2 pt-2">
        <AddButton tip="הוסף סט" onClick={createSet} />
      </div>
    </div>
  );
};

export default SetsContainer;
