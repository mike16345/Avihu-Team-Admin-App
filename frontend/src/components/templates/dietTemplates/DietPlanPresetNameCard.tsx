import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { PresetNameSchemaType } from "@/schemas/dietPlanPresetSchema";
import type { UseFormReturn } from "react-hook-form";
import { FaTag } from "react-icons/fa6";

interface DietPlanPresetNameCardProps {
  form: UseFormReturn<PresetNameSchemaType>;
}

export function DietPlanPresetNameCard({ form }: DietPlanPresetNameCardProps) {
  return (
    <div className="rounded-2xl border border-blue-100/60 bg-white p-5 shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
      <Form {...form}>
        <form>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <FaTag size={10} />
                  שם התפריט
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="שם לתפריט…"
                    className="h-11 w-full max-w-xs rounded-xl border-blue-100/60 bg-blue-50/30 text-base font-semibold text-slate-800 placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-200/60 dark:border-blue-900/40 dark:bg-blue-950/15 dark:text-slate-100 dark:focus:bg-slate-900"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
