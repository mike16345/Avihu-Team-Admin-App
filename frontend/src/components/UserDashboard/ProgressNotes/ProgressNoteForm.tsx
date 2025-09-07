import { useEffect, useState } from "react";
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
import CustomSelect from "@/components/ui/CustomSelect";
import { Textarea } from "@/components/ui/textarea";
import DatePicker from "@/components/ui/DatePicker";
import { useProgressNoteContext } from "@/context/useProgressNoteContext";
import useAddProgressNote from "@/hooks/mutations/progressNotes/useAddProgressNote";
import useUpdateProgressNote from "@/hooks/mutations/progressNotes/useUpdateProgressNote";
import { useParams } from "react-router-dom";
import { useUsersStore } from "@/store/userStore";

const progressOptions = [
  { name: "25%", value: "25" },
  { name: "50%", value: "50" },
  { name: "75%", value: "75" },
  { name: "100%", value: "100" },
];

const ProgressNoteForm = () => {
  const { id } = useParams();
  const { currentUser } = useUsersStore();
  const { progressNote } = useProgressNoteContext();
  const addNote = useAddProgressNote(id || "");
  const updateNote = useUpdateProgressNote(id || "");

  const [isEdit, setIsEdit] = useState(false);

  const initalTrainerName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : undefined;

  const progressNoteForm = useForm<z.infer<typeof progressNoteSchema>>({
    resolver: zodResolver(progressNoteSchema),
    defaultValues: {
      date: new Date(),
      content: undefined,
      trainer: initalTrainerName,
    },
  });

  const {
    reset,
    formState: { isDirty },
  } = progressNoteForm;

  const onSubmit = (values: z.infer<typeof progressNoteSchema>) => {
    if (!id) return;

    const note = { ...values, userId: id };

    if (isEdit) {
      if (!progressNote?._id) return;

      updateNote.mutate({ ...note, noteId: progressNote?._id });
    } else {
      addNote.mutate(note);
    }
  };

  useEffect(() => {
    if (!progressNote) return setIsEdit(false);

    setIsEdit(true);
    reset(progressNote);
  }, [progressNote]);

  return (
    <Form {...progressNoteForm}>
      <form
        onSubmit={progressNoteForm.handleSubmit(onSubmit)}
        className="space-y-4 w-full"
        dir="rtl"
      >
        <FormField
          control={progressNoteForm.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block">תאריך</FormLabel>
              <FormControl>
                <DatePicker
                  selectedDate={field.value}
                  onChangeDate={(date: Date) => field.onChange(date)}
                />
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
        <div className="flex gap-5 w-full flex-wrap justify-around">
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
        </div>
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
        <CustomButton
          variant="success"
          className="w-full"
          type="submit"
          title="שמור"
          disabled={!isDirty}
          isLoading={addNote.isPending || updateNote.isPending}
        />
      </form>
    </Form>
  );
};

export default ProgressNoteForm;
