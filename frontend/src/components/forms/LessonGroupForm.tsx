/**
 * LessonGroupForm — create / edit a lesson group.
 *
 * Visual refresh: matches the rest of the redesigned admin panel —
 * uppercase tracking labels, rounded-xl inputs, blue accent for the
 * save button, validation message styling consistent with other forms.
 *
 * Hooks and mutations untouched — purely visual.
 */
import lessonGroupSchema, { LessonGroupSchemaType } from "@/schemas/lessonGroupSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, FormMessage, FormField, FormItem, FormControl } from "../ui/form";
import { Input } from "../ui/input";
import { IPresetFormProps } from "@/interfaces/interfaces";
import useLessonGroupQuery from "@/hooks/queries/lessonGroups/useLessonGroupQuery";
import useAddLessonGroup from "@/hooks/mutations/lessonGroups/useAddLessonGroup";
import useUpdateLessonGroup from "@/hooks/mutations/lessonGroups/useUpdateLessonGroup";
import Loader from "../ui/Loader";
import { QueryKeys } from "@/enums/QueryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { FaCheck, FaPenToSquare } from "react-icons/fa6";

interface LessonGroupFormProps extends IPresetFormProps {}

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({
  children,
  required,
}) => (
  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
    {children}
    {required && <span className="ms-1 text-rose-500">*</span>}
  </label>
);

const LessonGroupForm: FC<LessonGroupFormProps> = ({ objectId, closeSheet }) => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useLessonGroupQuery(objectId);

  const onUpdateSuccess = (lessonGroup: any) => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.BLOGS] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.BLOGS, objectId] });
    onSuccess(lessonGroup);
  };

  const onSuccess = (lessonGroup: any) => {
    toast.success(objectId ? "הקבוצה עודכנה" : "הקבוצה נוצרה");
    queryClient.invalidateQueries({ queryKey: [QueryKeys.LESSON_GROUPS] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.LESSON_GROUPS, lessonGroup?._id] });
    closeSheet();
  };

  const addLessonGroup = useAddLessonGroup({ onSuccess });
  const updateLessonGroup = useUpdateLessonGroup({ onSuccess: onUpdateSuccess });

  const form = useForm<LessonGroupSchemaType>({
    resolver: zodResolver(lessonGroupSchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = (values: LessonGroupSchemaType) => {
    if (objectId) {
      updateLessonGroup.mutate({ id: objectId, group: values });
    } else {
      addLessonGroup.mutate(values);
    }
  };

  const { handleSubmit, control, reset } = form;
  const isPending = addLessonGroup.isPending || updateLessonGroup.isPending;
  const isEdit = !!objectId;

  useEffect(() => {
    if (!data) return;
    reset(data.data);
  }, [data]);

  if (isLoading) return <Loader />;

  return (
    <Form {...form}>
      <form
        dir="rtl"
        className="flex flex-col gap-4 text-right"
        style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormField
          name="name"
          control={control}
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FieldLabel required>שם הקבוצה</FieldLabel>
              <FormControl>
                <Input {...field} placeholder="לדוגמה: מתכונים לחיטוב" className="h-10 text-sm" />
              </FormControl>
              <FormMessage className="text-xs font-semibold text-rose-600 dark:text-rose-400" />
            </FormItem>
          )}
        />
        <FormField
          name="description"
          control={control}
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FieldLabel>תיאור</FieldLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder="הסבר קצר על הקבוצה (לא חובה)"
                  className="text-sm leading-relaxed"
                />
              </FormControl>
              <FormMessage className="text-xs font-semibold text-rose-600 dark:text-rose-400" />
            </FormItem>
          )}
        />
        <button
          type="submit"
          disabled={isPending}
          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isEdit ? <FaPenToSquare size={11} /> : <FaCheck size={11} />}
          {isPending ? "שומר…" : isEdit ? "שמור שינויים" : "צור קבוצה"}
        </button>
      </form>
    </Form>
  );
};

export default LessonGroupForm;
