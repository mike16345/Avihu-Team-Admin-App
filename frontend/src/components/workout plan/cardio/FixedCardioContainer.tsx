/**
 * FixedCardioContainer — the "קבוע" cardio plan layout.
 * Visual refresh: purple accents, rounded-2xl white card, section labels.
 */
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import TextEditor from "@/components/ui/TextEditor";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import React from "react";
import { useFormContext } from "react-hook-form";

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
    {children}
  </span>
);

const FixedCardioContainer: React.FC = () => {
  const { control } = useFormContext<WorkoutSchemaType>();

  return (
    <div
      dir="rtl"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
      className="flex w-full flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="cardio.plan.minsPerWeek"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <Label>כמות אירובי לשבוע (דק׳)</Label>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  className="h-9 text-sm"
                  placeholder="הכנס זמן בדקות"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="cardio.plan.timesPerWeek"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <Label>כמות פעמים לשבוע</Label>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  className="h-9 text-sm"
                  placeholder="כמה אימונים בשבוע"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="cardio.plan.tips"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <Label>דגשים</Label>
            <FormControl>
              <TextEditor
                className="bg-white dark:bg-slate-900"
                value={field.value || ""}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default FixedCardioContainer;
