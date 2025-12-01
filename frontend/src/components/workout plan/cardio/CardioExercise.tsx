import ComboBox from "@/components/ui/combo-box";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const CardioExercise: React.FC<CardioExerciseProps> = ({ parentPath }) => {
  const { control, setValue, watch } = useFormContext<WorkoutSchemaType, typeof parentPath>();
  const { data: cardioWorkoutResponse } = useCardioWorkoutQuery();
  const cardioExercise = watch(`${parentPath}.cardioExercise`);

  const handleUpdateExercise = (cardioExercise: string) => {
    setValue(`${parentPath}.cardioExercise`, cardioExercise);
  };

  const cardioWorkouts = useMemo(() => {
    if (!cardioWorkoutResponse?.data) return [];

    return convertItemsToOptions(cardioWorkoutResponse.data, `name`, `name`);
  }, [cardioWorkoutResponse?.data]);

  return (
    <div className="px-5 py-2 space-y-3">
      <div className="flex flex-wrap gap-5 w-5/6 justify-start  items-end">
        <FormField
          control={control}
          name={`${parentPath}.warmUpAmount`}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="warmUpAmount" className="font-bold underline">
                זמן חימום (דק'):
              </FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="זמן חימום לפני תרגיל.." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-fit">
          <Label className="font-bold underline">תרגיל:</Label>
          <ComboBox
            options={cardioWorkouts || []}
            value={cardioExercise}
            onSelect={(val) => handleUpdateExercise(val)}
          />
        </div>
      </div>
      <div className=" md:w-1/2">
        <FormField
          control={control}
          name={`${parentPath}.distance`}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="distance" className="font-bold underline">
                מרחק:
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="הכנס מרחק.."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div>
        <FormField
          control={control}
          name={`${parentPath}.tips`}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="tips" className="font-bold underline">
                דגשים:
              </FormLabel>
              <FormControl>
                <TextEditor value={field.value || ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default CardioExercise;
