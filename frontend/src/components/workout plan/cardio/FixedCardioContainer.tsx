/**
 * FixedCardioContainer — the "קבוע" cardio plan layout.
 *
 * Constrained-width card so the cardio settings (a couple of small
 * numeric inputs + a free-text tips editor) don't sprawl across the
 * full editor width. Brand-aligned: blue-tinted inputs with focus
 * ring, icon labels, max-w container.
 */
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import TextEditor from "@/components/ui/TextEditor";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import React from "react";
import { useFormContext } from "react-hook-form";
import { FaClock, FaCalendarWeek, FaNoteSticky } from "react-icons/fa6";

const Label: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({
  icon,
  children,
}) => (
  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
    <span className="text-blue-600 dark:text-blue-300">{icon}</span>
    {children}
  </span>
);

const FixedCardioContainer: React.FC = () => {
  const { control } = useFormContext<WorkoutSchemaType>();

  return (
    <div
      dir="rtl"
      style={{ fontFamily: "Assistant, Heebo, system-ui, sans-serif" }}
      className="flex w-full max-w-3xl flex-col gap-5 rounded-2xl border border-blue-100/60 bg-white p-5 shadow-sm dark:border-blue-900/40 dark:bg-slate-900"
    >
      {/* Two compact number inputs side by side — narrow widths so
          they don't read as text fields when they're really tiny
          integers (minutes / count). */}
      <div className="flex flex-wrap gap-4">
        <FormField
          control={control}
          name="cardio.plan.minsPerWeek"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <Label icon={<FaClock size={10} />}>כמות אירובי לשבוע (דק׳)</Label>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  placeholder="60"
                  className="h-11 w-32 rounded-xl border-blue-100/60 bg-blue-50/30 text-center text-base font-bold tabular-nums text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-200/60 dark:border-blue-900/40 dark:bg-blue-950/15 dark:text-slate-100 dark:focus:bg-slate-900"
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
            <FormItem className="space-y-1.5">
              <Label icon={<FaCalendarWeek size={10} />}>כמות פעמים לשבוע</Label>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  max={7}
                  placeholder="3"
                  className="h-11 w-32 rounded-xl border-blue-100/60 bg-blue-50/30 text-center text-base font-bold tabular-nums text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-200/60 dark:border-blue-900/40 dark:bg-blue-950/15 dark:text-slate-100 dark:focus:bg-slate-900"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Tips editor — full-width inside the constrained card. Wrapped
          in its own subtle blue surface so it visually separates from
          the numeric inputs above. */}
      <FormField
        control={control}
        name="cardio.plan.tips"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <Label icon={<FaNoteSticky size={10} />}>דגשים</Label>
            <FormControl>
              <div className="rounded-xl border border-blue-100/60 bg-blue-50/20 dark:border-blue-900/40 dark:bg-blue-950/10">
                <TextEditor
                  className="bg-transparent"
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default FixedCardioContainer;
