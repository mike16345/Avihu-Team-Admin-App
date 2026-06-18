import React from "react";
import SetsInput from "./SetsInput";
import { ISet } from "@/interfaces/IWorkoutPlan";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import { useFieldArray, useFormContext } from "react-hook-form";
import { deepClone } from "@/lib/utils";
import { FaPlus, FaCopy, FaTrash } from "react-icons/fa6";
import { defaultSet } from "./workoutPlanDefaults";

interface SetsContainerProps {
  parentPath: `workoutPlans.${number}.muscleGroups.${number}.exercises.${number}`;
}

const SetsContainer: React.FC<SetsContainerProps> = ({ parentPath }) => {
  const { control, getValues } = useFormContext<WorkoutSchemaType>();
  const { fields, append, remove, update } = useFieldArray<
    WorkoutSchemaType,
    `${typeof parentPath}.sets`
  >({
    name: `${parentPath}.sets`,
    control,
  });

  const createSet = () => append({ ...defaultSet });

  const removeSet = (index: number) => {
    if (fields.length === 1) return;
    remove(index);
  };

  const copySet = (index: number) => {
    const sets = getValues(`${parentPath}.sets`);
    const item = sets[index];
    append(deepClone(item));
  };

  const updateSet = (index: number, newSet: ISet) => update(index, newSet);

  return (
    <div dir="rtl" className="flex flex-col">
      <div className="flex flex-col divide-y divide-slate-100">
        {fields.map((field, i) => (
          <div key={field.id} className="py-2 first:pt-0">
            <SetsInput
              index={i}
              setNumber={i + 1}
              fieldNamePrefix={`${parentPath}.sets`}
              onUpdateSet={updateSet}
            >
              <div className="mt-6 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => copySet(i)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-300"
                  aria-label="שכפל סט"
                  title="שכפל סט"
                >
                  <FaCopy size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => removeSet(i)}
                  disabled={fields.length === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                  aria-label="הסר סט"
                  title="הסר סט"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            </SetsInput>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={createSet}
        className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
      >
        <FaPlus size={10} />
        הוסף סט
      </button>
    </div>
  );
};

export default SetsContainer;
