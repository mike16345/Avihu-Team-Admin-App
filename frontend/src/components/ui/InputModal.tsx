import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "./button";
import { Input } from "./input";
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center pb-2">{title || `בחר שם לתבנית`}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSave)}>
            <FormField
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <DialogFooter className=" pt-2 gap-3">
              <Button variant={"success"} type="submit" className="w-full">
                שמור
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InputModal;
