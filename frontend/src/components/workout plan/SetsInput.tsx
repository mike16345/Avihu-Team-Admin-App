/**
 * SetsInput — a single row in the sets table.
 *
 * Layout: [purple pill "סט N"] [min reps input] [max reps input] [actions]
 */
import React, { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

interface SetsInputProps {
  index: number;
  setNumber: number;
  fieldNamePrefix: string;
  children?: ReactNode;
  onUpdateSet?: (index: number, newSet: any) => void;
}

const SetsInput: React.FC<SetsInputProps> = ({
  index,
  setNumber,
  fieldNamePrefix,
  children,
}) => {
  const { control } = useFormContext();
  const basePath = `${fieldNamePrefix}.${index}`;

  return (
    <div className="flex items-end gap-3" dir="rtl">
      <div className="mt-6 inline-flex h-8 min-w-[58px] items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40 px-3 text-xs font-bold text-purple-700 dark:text-purple-300">
        סט {setNumber}
      </div>

      <FormField
        control={control}
        name={`${basePath}.minReps`}
        render={({ field }) => (
          <FormItem className="w-24 space-y-1">
            <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              מינ׳ חזרות
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                min={0}
                placeholder="8"
                className="h-9 text-sm"
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
          <FormItem className="w-24 space-y-1">
            <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              מקס׳ חזרות
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                min={0}
                placeholder="12"
                className="h-9 text-sm"
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
