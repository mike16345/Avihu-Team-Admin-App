import { useEffect, useMemo } from "react";
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
import CustomSelect from "@/components/ui/CustomSelect";
import DatePicker from "@/components/ui/DatePicker";
import { useProgressNoteContext } from "@/context/useProgressNoteContext";
import useAddProgressNote from "@/hooks/mutations/progressNotes/useAddProgressNote";
import useUpdateProgressNote from "@/hooks/mutations/progressNotes/useUpdateProgressNote";
import { useParams } from "react-router-dom";
import { useUsersStore } from "@/store/userStore";
import { useSubTrainersQuery } from "@/hooks/queries/subTrainers/useSubTrainersQuery";
import TextEditor from "@/components/ui/TextEditor";

const progressOptions = [
  { name: "25%", value: "25" },
  { name: "50%", value: "50" },
  { name: "75%", value: "75" },
  { name: "100%", value: "100" },
];

const percentageFields = [
  { name: "diet", label: "🥗 תזונה" },
  { name: "workouts", label: "💪 אימונים" },
  { name: "cardio", label: "🏃 אירובי" },
] as const;

const buildProgressNoteDefaults = (trainer?: string): z.infer<typeof progressNoteSchema> => ({
  date: new Date(),
  content: "",
  trainer: trainer ?? "",
  diet: undefined,
  workouts: undefined,
  cardio: undefined,
});

const ProgressNoteForm = () => {
  const { id } = useParams();
  const { currentUser } = useUsersStore();
  const { progressNote } = useProgressNoteContext();
  const addNote = useAddProgressNote(id || "");
  const updateNote = useUpdateProgressNote(id || "");

  const initialTrainerName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : undefined;

  const { data: subTrainers = [] } = useSubTrainersQuery();
  const trainerOptions = useMemo(() => {
    const list: { name: string; value: string }[] = [];
    if (currentUser) {
      const name = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();
      if (name) list.push({ name: `${name} (אני)`, value: name });
    }
    subTrainers.forEach((trainer) => {
      const trainerName = trainer.fullName?.trim();
      if (!trainerName) return;
      if (list.some((option) => option.value === trainerName)) return;
      list.push({ name: trainerName, value: trainerName });
    });
    return list;
  }, [currentUser, subTrainers]);

  const defaultValues = useMemo(
    () => buildProgressNoteDefaults(initialTrainerName),
    [initialTrainerName]
  );

  const progressNoteForm = useForm<z.infer<typeof progressNoteSchema>>({
    resolver: zodResolver(progressNoteSchema),
    defaultValues,
  });

  const {
    reset,
    formState: { isDirty },
  } = progressNoteForm;

  const onSubmit = (values: z.infer<typeof progressNoteSchema>) => {
    if (!id) return;

    const note = { ...values, userId: id };

    if (progressNote?._id) {
      updateNote.mutate({ ...note, noteId: progressNote._id });
      return;
    }

    addNote.mutate(note);
  };

  useEffect(() => {
    if (progressNote) {
      reset(progressNote as z.infer<typeof progressNoteSchema>);
      return;
    }

    reset(buildProgressNoteDefaults(initialTrainerName));
  }, [progressNote, reset, initialTrainerName]);

  const isSaving = addNote.isPending || updateNote.isPending;
  const isEditing = Boolean(progressNote?._id);
  const saveButtonLabel = isSaving ? "שומר…" : isEditing ? "שמור שינויים" : "שמור פתק";

  return (
    <Form {...progressNoteForm}>
      <form
        onSubmit={progressNoteForm.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-3"
        dir="rtl"
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <FormField
            control={progressNoteForm.control}
            name="date"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[11px] font-semibold text-slate-600">תאריך</FormLabel>
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
              <FormItem className="space-y-1">
                <FormLabel className="text-[11px] font-semibold text-slate-600">שם המאמן</FormLabel>
                <FormControl>
                  <CustomSelect
                    items={trainerOptions}
                    selectedValue={field.value || ""}
                    onValueChange={(value) => field.onChange(value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {percentageFields.map((percentageField) => (
            <FormField
              key={percentageField.name}
              control={progressNoteForm.control}
              name={percentageField.name}
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[11px] font-semibold text-slate-600">
                    {percentageField.label}
                  </FormLabel>
                  <FormControl>
                    <CustomSelect
                      items={progressOptions}
                      selectedValue={field.value?.toString()}
                      onValueChange={(value) => field.onChange(+value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <FormField
          control={progressNoteForm.control}
          name="content"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-[11px] font-semibold text-slate-600">
                תוכן (אופציונלי)
              </FormLabel>
              <FormControl>
                <TextEditor value={field.value} onChange={(value) => field.onChange(value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between gap-2 pt-1">
          <p className="text-[11px] text-slate-400">
            {isEditing ? "שינויים יישמרו רק אחרי לחיצה על שמור." : ""}
          </p>
          <button
            type="submit"
            disabled={!isDirty || isSaving}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {saveButtonLabel}
          </button>
        </div>
      </form>
    </Form>
  );
};

export default ProgressNoteForm;
