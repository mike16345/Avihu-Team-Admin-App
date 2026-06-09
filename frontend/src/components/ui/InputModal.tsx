import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaTag, FaCheck } from "react-icons/fa6";
import ERROR_MESSAGES from "@/utils/errorMessages";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "./form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface InputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title?: string;
  description?: string;
}

const nameSchema = z.object({
  name: z
    .string()
    .min(1, ERROR_MESSAGES.stringMin(1))
    .refine((value) => value.trim().length > 0, ERROR_MESSAGES.noSpacesAllowed),
});
type NameSchemaType = z.infer<typeof nameSchema>;

const InputModal: React.FC<InputModalProps> = ({ onClose, open, onSubmit, title, description }) => {
  const form = useForm<NameSchemaType>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(nameSchema),
  });

  const handleSave = (value: NameSchemaType) => {
    onSubmit(value.name);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        dir="rtl"
        className="max-w-md p-0 bg-white dark:bg-slate-900 border border-blue-100/60 dark:border-slate-800"
        style={{ fontFamily: "Assistant, Heebo, system-ui, sans-serif" }}
      >
        {/* Header with brand-gradient icon */}
        <DialogHeader className="p-6 pb-3 text-right">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-sm">
              <FaTag size={13} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                {title || "בחר שם לתבנית"}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex flex-col gap-4 px-6 pb-6"
            onSubmit={form.handleSubmit(handleSave)}
          >
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <input
                    {...field}
                    autoFocus
                    placeholder="לדוגמה: פול-בודי למתחילים"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Footer: cancel + save. Save is a tight brand-gradient
                pill — no more wide flat green. Cancel as a quiet
                ghost button keeps the modal balanced. */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                ביטול
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl brand-gradient brand-gradient-hover px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5"
              >
                <FaCheck size={11} />
                <span>שמור</span>
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InputModal;
