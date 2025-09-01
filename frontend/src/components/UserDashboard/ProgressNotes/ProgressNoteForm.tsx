import React, { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { progressNoteSchema } from "@/schemas/progressNoteSchema";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/ui/CustomButton";
import moment from "moment-timezone";
import { convertStringsToOptions } from "@/lib/utils";
import CustomSelect from "@/components/ui/CustomSelect";
import { Textarea } from "@/components/ui/textarea";

const progressOptions = convertStringsToOptions(["25", "50", "75", "100"]);

const ProgressNoteForm = () => {
  const progressNoteForm = useForm<z.infer<typeof progressNoteSchema>>({
    resolver: zodResolver(progressNoteSchema),
    defaultValues: {
      date: moment().format("YYYY-MM-DD"),
      content: undefined,
      trainer: undefined,
      cardio: undefined,
      diet: undefined,
      workouts: undefined,
    },
  });

  const { reset } = progressNoteForm;

  const onSubmit = (values: z.infer<typeof progressNoteSchema>) => {
    console.log("success", values);
  };

  return (
    <Form {...progressNoteForm}>
      <form
        onSubmit={progressNoteForm.handleSubmit(onSubmit)}
        className="space-y-4 w-fit"
        dir="rtl"
      >
        <FormField
          control={progressNoteForm.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>תאריך</FormLabel>
              <FormControl>
                <Input type="date" placeholder="הכנס פריט כאן..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={progressNoteForm.control}
          name="trainer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם המאמן</FormLabel>
              <FormControl>
                <Input placeholder="הכנס פריט כאן..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={progressNoteForm.control}
          name="diet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>תזונה</FormLabel>
              <FormControl>
                <CustomSelect
                  items={progressOptions}
                  selectedValue={field.value?.toString()}
                  onValueChange={(val) => field.onChange(+val)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={progressNoteForm.control}
          name="cardio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>אירובי</FormLabel>
              <FormControl>
                <CustomSelect
                  items={progressOptions}
                  selectedValue={field.value?.toString()}
                  onValueChange={(val) => field.onChange(+val)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={progressNoteForm.control}
          name="workouts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>אימונים</FormLabel>
              <FormControl>
                <CustomSelect
                  items={progressOptions}
                  selectedValue={field.value?.toString()}
                  onValueChange={(val) => field.onChange(+val)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={progressNoteForm.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>תוכן</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CustomButton className="w-full" type="submit" title="שמור" />
      </form>
    </Form>
  );
};

export default ProgressNoteForm;
