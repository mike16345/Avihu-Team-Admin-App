/**
 * ExerciseForm — add / edit a single exercise preset.
 *
 * Visual refresh aligned with the Elevate Coach design language:
 *   - Uppercase tracking labels (semantic groups)
 *   - Rounded-xl inputs with subtle slate borders
 *   - Image preview card with overlay remove button
 *   - Sticky save action at the bottom of the sheet
 *
 * Hooks, mutations and schema are untouched — pure styling update.
 */
import React, { useEffect, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { QueryKeys } from "@/enums/QueryKeys";
import { IPresetFormProps } from "@/interfaces/interfaces";
import { exerciseSchema } from "@/schemas/exerciseSchema";
import useUpdateExercise from "@/hooks/mutations/exercise/useUpdateExercise";
import useAddExercise from "@/hooks/mutations/exercise/useAddExercise";
import useExerciseQuery from "@/hooks/queries/exercises/useExerciseQuery";
import { invalidateQueryKeys } from "@/QueryClient/queryClient";
import { Input } from "../ui/input";
import TextEditor from "../ui/TextEditor";
import { buildPhotoUrl } from "@/lib/utils";
import Loader from "../ui/Loader";
import MuscleGroupDropdown from "../ui/MuscleGroupDropdown";
import {
  FaTag,
  FaVideo,
  FaCircleInfo,
  FaPersonRunning,
  FaImage,
  FaXmark,
  FaCheck,
  FaCloudArrowUp,
} from "react-icons/fa6";

const SectionLabel: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({
  icon,
  children,
}) => (
  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
    <span className="text-slate-400 dark:text-slate-500">{icon}</span>
    {children}
  </label>
);

const ExerciseForm: React.FC<IPresetFormProps> = ({ objectId, closeSheet }) => {
  const exerciseForm = useForm<z.infer<typeof exerciseSchema>>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      muscleGroup: "",
      linkToVideo: "",
      tipFromTrainer: "",
    },
  });

  const { data: exercise, isLoading } = useExerciseQuery(objectId || "undefined");
  const { reset } = exerciseForm;

  const [image, setImage] = useState<string>();
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  const successFunc = (message: string) => {
    invalidateQueryKeys([QueryKeys.EXERCISES, QueryKeys.EXERCISES + objectId]);
    toast.success(message);
    closeSheet();
  };

  const errorFunc = (err: any) =>
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, { description: err.message });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    const existingImageKey = exerciseForm.getValues("imageUrl");
    setImageToDelete(existingImageKey || null);

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setImage(reader.result.toString());
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    const existingImage = exerciseForm.getValues("imageUrl");
    if (existingImage) {
      setImageToDelete(existingImage);
      exerciseForm.setValue("imageUrl", "");
    } else {
      setImageToDelete(null);
    }
    setImage(undefined);
  };

  const addNewExercise = useAddExercise({
    onSuccess: () => successFunc("פריט נשמר בהצלחה!"),
    onError: errorFunc,
  });

  const editExercise = useUpdateExercise({
    onSuccess: () => successFunc("פריט עודכן בהצלחה!"),
    onError: errorFunc,
  });

  const onSubmit = (values: z.infer<typeof exerciseSchema>) => {
    if (objectId) {
      editExercise.mutate({
        id: objectId,
        exercise: values,
        imageToUpload: image,
        imageToDelete: imageToDelete || undefined,
      });
    } else {
      addNewExercise.mutate({ exercise: values, image });
    }
  };

  useEffect(() => {
    if (!exercise) return;
    reset({
      ...exercise.data,
      tipFromTrainer: exercise.data?.tipFromTrainer || "",
    });
  }, [exercise]);

  if (isLoading) return <Loader size="large" />;

  const isPending = addNewExercise.isPending || editExercise.isPending;
  const isEdit = !!objectId;
  const previewImageUrl = image || buildPhotoUrl(exerciseForm.getValues().imageUrl || "");
  const showPreview = !!image || !!exerciseForm.getValues().imageUrl;

  return (
    <Form {...exerciseForm}>
      <form
        onSubmit={exerciseForm.handleSubmit(onSubmit)}
        className="flex flex-col gap-5 text-right"
      >
        {/* Name */}
        <FormField
          control={exerciseForm.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <SectionLabel icon={<FaTag size={11} />}>שם התרגיל</SectionLabel>
              <FormControl>
                <Input
                  placeholder="לדוגמה: לחיצת חזה במכונה"
                  {...field}
                  className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-visible:ring-blue-200"
                />
              </FormControl>
              <FormMessage className="text-xs font-semibold text-rose-600 dark:text-rose-400" />
            </FormItem>
          )}
        />

        {/* Muscle group */}
        <FormField
          control={exerciseForm.control}
          name="muscleGroup"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <SectionLabel icon={<FaPersonRunning size={11} />}>קבוצת שריר</SectionLabel>
              <MuscleGroupDropdown
                onSelect={field.onChange}
                value={field.value}
                listEmptyMessage="לא נמצאו קבוצות שריר"
              />
              <FormMessage className="text-xs font-semibold text-rose-600 dark:text-rose-400" />
            </FormItem>
          )}
        />

        {/* Video link */}
        <FormField
          control={exerciseForm.control}
          name="linkToVideo"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <SectionLabel icon={<FaVideo size={11} />}>לינק לסרטון</SectionLabel>
              <FormControl>
                <Input
                  placeholder="https://youtube.com/watch?v=…"
                  {...field}
                  dir="ltr"
                  className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-visible:ring-blue-200"
                />
              </FormControl>
              <FormMessage className="text-xs font-semibold text-rose-600 dark:text-rose-400" />
            </FormItem>
          )}
        />

        {/* Trainer tip */}
        <FormField
          control={exerciseForm.control}
          name="tipFromTrainer"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <SectionLabel icon={<FaCircleInfo size={11} />}>טיפ / דגשים מהמדריך</SectionLabel>
              <FormControl>
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <TextEditor
                    defaultValue={field.value || ""}
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs font-semibold text-rose-600 dark:text-rose-400" />
            </FormItem>
          )}
        />

        {/* Image upload */}
        <FormItem className="space-y-1.5">
          <SectionLabel icon={<FaImage size={11} />}>תמונה לתרגיל (אופציונלי)</SectionLabel>
          {!showPreview ? (
            <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 px-4 py-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/20">
              <FaCloudArrowUp className="text-slate-400 group-hover:text-blue-500" size={24} />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 group-hover:text-blue-700">
                בחר תמונה
              </span>
              <span className="text-[11px] text-slate-400">PNG, JPG, או GIF</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <img
                src={previewImageUrl}
                alt="תצוגה מקדימה"
                className="w-full max-h-64 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                aria-label="הסר תמונה"
                className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-md transition-colors hover:bg-rose-50 hover:text-rose-700"
              >
                <FaXmark size={13} />
              </button>
              <label className="absolute right-2 top-2 flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-white/90 px-3 text-xs font-bold text-slate-700 shadow-md transition-colors hover:bg-slate-50">
                <FaCloudArrowUp size={11} />
                החלפה
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </FormItem>

        {/* Actions */}
        <div className="sticky bottom-0 -mx-6 mt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-3 backdrop-blur">
          <button
            type="button"
            onClick={closeSheet}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ביטול
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="brand-gradient brand-gradient-hover brand-glow inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                שומר…
              </>
            ) : (
              <>
                <FaCheck size={12} />
                {isEdit ? "שמור שינויים" : "שמור תרגיל"}
              </>
            )}
          </button>
        </div>
      </form>
    </Form>
  );
};

export default ExerciseForm;
