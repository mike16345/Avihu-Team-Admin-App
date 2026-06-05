/**
 * CardioExercise — single cardio workout block inside a week.
 * Visual refresh only; form-state integrations are unchanged.
 */
import ComboBox from "@/components/ui/combo-box";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TextEditor from "@/components/ui/TextEditor";
import useCardioWorkoutQuery from "@/hooks/queries/cardioWorkout/useCardioWorkoutQuery";
import { convertItemsToOptions } from "@/lib/utils";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";

interface CardioExerciseProps {
  parentPath: `cardio.plan.weeks.${number}.workouts.${number}`;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
    {children}
  </span>
);

const CardioExercise: React.FC<CardioExerciseProps> = ({ parentPath }) => {
  const { control, setValue, watch } = useFormContext<WorkoutSchemaType, typeof parentPath>();
  const { data: cardioWorkoutResponse } = useCardioWorkoutQuery();
  const cardioExercise = watch(`${parentPath}.cardioExercise`);

  const cardioWorkouts = useMemo(() => {
    if (!cardioWorkoutResponse?.data) return [];
    return convertItemsToOptions(cardioWorkoutResponse.data, `name`, `name`);
  }, [cardioWorkoutResponse?.data]);

  return (
    <div dir="rtl" className="space-y-4 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name={`${parentPath}.warmUpAmount`}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <Label>זמן חימום (דק׳)</Label>
              <FormControl>
                <Input {...field} type="number" className="h-9 text-sm" placeholder="לפני התרגיל" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem className="space-y-1">
          <Label>תרגיל</Label>
          <ComboBox
            options={cardioWorkouts || []}
            value={cardioExercise}
            onSelect={(val) => setValue(`${parentPath}.cardioExercise`, val, { shouldDirty: true })}
          />
        </FormItem>
      </div>

      <FormField
        control={control}
        name={`${parentPath}.distance`}
        render={({ field }) => (
          <FormItem className="space-y-1 md:w-1/2">
            <Label>מרחק</Label>
            <FormControl>
              <Textarea
                {...field}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="הכנס מרחק"
                className="text-sm"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`${parentPath}.tips`}
        render={({ field }) => (
          <FormItem className="space-y-1">
            <Label>דגשים</Label>
            <FormControl>
              <TextEditor value={field.value || ""} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CardioExercise;
