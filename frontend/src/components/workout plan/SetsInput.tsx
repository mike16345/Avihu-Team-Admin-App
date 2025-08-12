import React, { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

interface SetsInputProps {
  index: number;
  setNumber: number;
  fieldNamePrefix: string; // e.g. workoutPlans.0.muscleGroups.0.exercises.0.sets
  children?: ReactNode;
  onUpdateSet?: (index: number, newSet: any) => void; // optional callback for whole set update
}

const SetsInput: React.FC<SetsInputProps> = ({
  index,
  setNumber,
  fieldNamePrefix,
  children,
  onUpdateSet,
}) => {
  const { control, getValues } = useFormContext();

  const basePath = `${fieldNamePrefix}.${index}`;

  // Optional: example handler if you want to update the entire set object from inside
  const handleFullSetChange = (partialUpdate: Partial<any>) => {
    if (!onUpdateSet) return;

    const currentSet = getValues(basePath);
    onUpdateSet(index, { ...currentSet, ...partialUpdate });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-10 mt-6 font-semibold">סט {setNumber}</div>

      <FormField
        control={control}
        name={`${basePath}.minReps`}
        render={({ field }) => (
          <FormItem className="w-24">
            <FormLabel>מינימום חזרות</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                min={0}
                placeholder="8/10/12..."
                // Example usage if you want to handle full set update:
                // onChange={e => {
                //   field.onChange(e);
                //   handleFullSetChange({ minReps: e.target.valueAsNumber });
                // }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`${basePath}.maxReps`}
        render={({ field }) => (
          <FormItem className="w-24">
            <FormLabel>מקסימום חזרות</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                min={0}
                placeholder="8/10/12..."
                // onChange={e => {
                //   field.onChange(e);
                //   handleFullSetChange({ maxReps: e.target.valueAsNumber });
                // }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {children}
    </div>
  );
};

export default SetsInput;
