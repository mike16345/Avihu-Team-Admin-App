import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

interface SetInputProps {
  setNumber: number;
  parentPath: `workoutPlans.${number}.muscleGroups.${number}.exercises.${number}.sets.${number}`;
}

const SetsInput: React.FC<SetInputProps> = ({ setNumber, parentPath }) => {
  const { control } = useFormContext();

  return (
    <div className="flex items-center gap-3">
      <div className="mt-5 font-semibold">סט {setNumber}</div>
      <FormField
        control={control}
        name={`${parentPath}.minReps`}
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel>מינימום חזרות</FormLabel>
              <FormControl>
                <Input {...field} type="number" min={0} className="w-28" placeholder="8/10/12..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <FormField
        control={control}
        name={`${parentPath}.maxReps`}
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel>מקסימום חזרות</FormLabel>
              <FormControl>
                <Input {...field} type="number" min={0} className="w-28" placeholder="8/10/12..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
};

export default SetsInput;
