import React, { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

interface SetInputProps {
  setNumber: number;
  children?: ReactNode;
  parentPath: `workoutPlans.${number}.muscleGroups.${number}.exercises.${number}.sets.${number}`;
}

const SetsInput: React.FC<SetInputProps> = ({ setNumber, parentPath, children }) => {
  const { control } = useFormContext();

  return (
    <div className="flex items-center gap-2">
      <div className="w-10 mt-6 font-semibold">סט {setNumber}</div>
      <FormField
        control={control}
        name={`${parentPath}.minReps`}
        render={({ field }) => (
          <FormItem className="w-24">
            <FormLabel>מינימום חזרות</FormLabel>
            <FormControl>
              <Input {...field} type="number" min={0} placeholder="8/10/12..." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${parentPath}.maxReps`}
        render={({ field }) => (
          <FormItem className="w-24">
            <FormLabel>מקסימום חזרות</FormLabel>
            <FormControl>
              <Input {...field} type="number" min={0} placeholder="8/10/12..." />
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
