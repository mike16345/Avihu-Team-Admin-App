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
        className="max-w-md p-0 bg-white dark:bg-slate-900 border border-[#E6ECF2] dark:border-slate-800 rounded-[20px]"
        style={{ fontFamily: "Assistant, Heebo, system-ui, sans-serif" }}
      >
        <DialogHeader className="p-6 pb-3 text-right">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F6F9] text-[#53677A]">
              <FaTag size={13} />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-[#172B4D] dark:text-slate-50">
                {title || "בחר שם לתבנית"}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-[12px] text-[#667085] mt-0.5">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-col gap-4 px-6 pb-6" onSubmit={form.handleSubmit(handleSave)}>
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <input
                    {...field}
                    autoFocus
                    placeholder="לדוגמה: פול-בודי למתחילים"
                    className="w-full rounded-xl border border-[#DCE3EA] dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-[#172B4D] dark:text-slate-100 placeholder:text-[#98A2B3] transition-colors focus:border-[#9FC5E8] focus:outline-none focus:ring-2 focus:ring-[#9FC5E8]/40"
                  />
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#344054] hover:bg-[#F4F7FA] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                ביטול
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#4A90E2] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3F7FCC]"
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
