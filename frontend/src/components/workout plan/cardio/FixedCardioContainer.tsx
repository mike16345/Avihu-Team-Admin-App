import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import React from "react";
import { useFormContext } from "react-hook-form";

interface FixedCardioContainerProps {}

const FixedCardioContainer: React.FC<FixedCardioContainerProps> = () => {
  const { control } = useFormContext<WorkoutSchemaType>();

  return (
    <div className="flex flex-col gap-5 bg-accent p-5 rounded-lg mb-2 w-full sm:w-[65%] ">
      <FormField
        control={control}
        name="cardio.plan.minsPerWeek"
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel htmlFor="minsPerWeek" className="font-bold underline">
                כמות אירובי לשבוע (דק'):
              </FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="הכנס זמן בדקות.." />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField
        control={control}
        name="cardio.plan.timesPerWeek"
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel htmlFor="timesPerWeek" className="font-bold underline">
                כמות פעמים לשבוע:
              </FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="כמה אימונים בשבוע.." />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <FormField
        control={control}
        name="cardio.plan.tips"
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel htmlFor="tips" className="font-bold underline">
                דגשים:
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="כמה אימונים בשבוע.."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
};

export default FixedCardioContainer;
