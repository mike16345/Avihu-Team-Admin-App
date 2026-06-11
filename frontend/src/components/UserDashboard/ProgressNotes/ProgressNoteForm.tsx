/**
 * ProgressNoteForm — single-row layout
 *
 * All inputs (date, trainer, diet/workouts/cardio %) live on ONE horizontal
 * row as compact dropdowns/inputs. Content editor + save sit beneath.
 */
import { useEffect, useMemo, useState } from "react";
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

  // Trainer dropdown options — the logged-in trainer + every
  // sub-trainer they manage. Stored as the *name* (string) so the
  // note's `trainer` field stays human-readable for mobile + future
  // reads, even if a sub-trainer is later removed from the team.
  const { data: subTrainers = [] } = useSubTrainersQuery();
  const trainerOptions = useMemo(() => {
    const list: { name: string; value: string }[] = [];
    if (currentUser) {
      const name = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();
      if (name) list.push({ name: `${name} (אני)`, value: name });
    }
    subTrainers.forEach((t) => {
      const tname = t.fullName?.trim();
      if (!tname) return;
      // Skip the current user if they also appear as a sub-trainer.
      if (list.some((o) => o.value === tname)) return;
      list.push({ name: tname, value: tname });
    });
    return list;
  }, [currentUser, subTrainers]);

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
        className="flex w-full flex-col gap-3"
        dir="rtl"
      >
        {/* All meta fields in one row */}
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
                  {/* Restricted to trainers with access (main trainer
                      + every sub-trainer on the team). Free-text was
                      a footgun — typos broke filtering and reporting. */}
                  <CustomSelect
                    items={trainerOptions}
                    selectedValue={field.value || ""}
                    onValueChange={(val) => field.onChange(val)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={progressNoteForm.control}
            name="diet"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[11px] font-semibold text-slate-600">🥗 תזונה</FormLabel>
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
              <FormItem className="space-y-1">
                <FormLabel className="text-[11px] font-semibold text-slate-600">
                  💪 אימונים
                </FormLabel>
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
              <FormItem className="space-y-1">
                <FormLabel className="text-[11px] font-semibold text-slate-600">
                  🏃 אירובי
                </FormLabel>
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

        {/* Content */}
        <FormField
          control={progressNoteForm.control}
          name="content"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-[11px] font-semibold text-slate-600">
                תוכן (אופציונלי)
              </FormLabel>
              <FormControl>
                <TextEditor value={field.value} onChange={(val) => field.onChange(val)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <p className="text-[11px] text-slate-400">
            {isEdit ? "שינויים יישמרו רק אחרי לחיצה על שמור." : ""}
          </p>
          <button
            type="submit"
            disabled={!isDirty || addNote.isPending || updateNote.isPending}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {addNote.isPending || updateNote.isPending
              ? "שומר…"
              : isEdit
                ? "שמור שינויים"
                : "שמור פתק"}
          </button>
        </div>
      </form>
    </Form>
  );
};

export default ProgressNoteForm;
