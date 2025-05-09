import React from "react";
import SetsInput from "./SetsInput";
import { ISet } from "@/interfaces/IWorkoutPlan";
import AddButton from "../ui/buttons/AddButton";
import DeleteButton from "../ui/buttons/DeleteButton";
import CopyButton from "../ui/buttons/CopyButton";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import { useFieldArray, useFormContext } from "react-hook-form";
import { deepClone } from "@/lib/utils";

interface SetContainerProps {
  parentPath: `workoutPlans.${number}.muscleGroups.${number}.exercises.${number}`;
}

export const defaultSet: ISet = {
  minReps: 0,
  maxReps: 0,
};

const SetsContainer: React.FC<SetContainerProps> = ({ parentPath }) => {
  const { getValues, watch, setValue, control } = useFormContext<WorkoutSchemaType>();
  const { fields, append, remove } = useFieldArray<WorkoutSchemaType, `${typeof parentPath}.sets`>({
    name: `${parentPath}.sets`,
    control,
  });

  const sets = watch(`${parentPath}.sets`);

  const createSet = () => {
    append({ ...defaultSet });
  };

  const removeSet = (index: number) => {
    remove(index);
  };

  const copySet = (index: number) => {
    const sets = getValues(`${parentPath}.sets`);
    const item = sets[index];
    const newSet = deepClone(item);

    append(newSet);
    setValue(`${parentPath}.sets`, [...sets, item]);
  };

  return (
    <div className="flex flex-col gap-2 w-fit">
      <h2 className="underline font-bold pt-2">סטים:</h2>
      <div className="flex flex-col gap-4">
        {sets.map((_, i) => (
          <SetsInput key={i} parentPath={`${parentPath}.sets.${i}`} setNumber={i + 1}>
            <div className="flex items-center mt-6">
              <DeleteButton
                disabled={fields.length == 1}
                tip="הסר סט"
                onClick={() => removeSet(i)}
              />
              <CopyButton tip="שכפל סט" onClick={() => copySet(i)} />
            </div>
          </SetsInput>
        ))}
      </div>
      <div className="border-t-2">
        <AddButton tip="הוסף סט" onClick={createSet} />
      </div>
    </div>
  );
};

export default SetsContainer;
