import { Control } from "react-hook-form";
import { FaFolderOpen, FaTag } from "react-icons/fa6";

import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { WorkoutPresetSchemaType } from "@/schemas/workoutPlanSchema";

type WorkoutPresetIdentityCardProps = {
  control: Control<WorkoutPresetSchemaType>;
  selectedPreset: string;
  onOpenPresetPicker: () => void;
};

const getPresetButtonLabel = (selectedPreset: string) => {
  if (selectedPreset) return `תבנית: ${selectedPreset}`;
  return "בחר תבנית";
};

export function WorkoutPresetIdentityCard({
  control,
  selectedPreset,
  onOpenPresetPicker,
}: WorkoutPresetIdentityCardProps) {
  return (
    <div className="rounded-2xl border border-blue-100/60 bg-white p-5 shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <FaTag size={10} />
                שם התבנית
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="לדוגמה: דחיפה־משיכה־רגליים · ABC · 4 ימים"
                  className="h-11 w-full rounded-xl border-blue-100/60 bg-blue-50/30 text-base font-semibold text-slate-800 placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-200/60 dark:border-blue-900/40 dark:bg-blue-950/15 dark:text-slate-100 dark:focus:bg-slate-900"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <FaFolderOpen size={10} />
            העתק מתבנית קיימת
          </span>
          <button
            type="button"
            onClick={onOpenPresetPicker}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-blue-100/60 bg-blue-50/30 px-4 text-sm font-bold text-blue-700 transition-all hover:border-blue-400 hover:bg-blue-50 hover:-translate-y-px dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300 dark:hover:border-blue-700"
          >
            <FaFolderOpen size={12} />
            {getPresetButtonLabel(selectedPreset)}
          </button>
        </div>
      </div>
    </div>
  );
}
