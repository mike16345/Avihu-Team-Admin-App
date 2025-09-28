import lessonGroupSchema, { LessonGroupSchemaType } from "@/schemas/lessonGroupSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, FormMessage, FormField, FormItem, FormControl, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { IPresetFormProps } from "@/interfaces/interfaces";
import useLessonGroupQuery from "@/hooks/queries/lessonGroups/useLessonGroupQuery";
import useAddLessonGroup from "@/hooks/mutations/lessonGroups/useAddLessonGroup";
import useUpdateLessonGroup from "@/hooks/mutations/lessonGroups/useUpdateLessonGroup";
import CustomButton from "../ui/CustomButton";
import Loader from "../ui/Loader";
import { QueryKeys } from "@/enums/QueryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface LessonGroupFormProps extends IPresetFormProps {}

const LessonGroupForm: FC<LessonGroupFormProps> = ({ objectId, closeSheet }) => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useLessonGroupQuery(objectId);

  const onUpdateSuccess = (lessonGroup: any) => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.BLOGS] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.BLOGS, objectId] });
    onSuccess(lessonGroup);
  };

  const onSuccess = (lessonGroup: any) => {
    toast.success("פריט נשמר בהצלחה!");
    queryClient.invalidateQueries({ queryKey: [QueryKeys.LESSON_GROUPS] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.LESSON_GROUPS, lessonGroup?._id] });
    closeSheet();
  };

  const addLessonGroup = useAddLessonGroup({ onSuccess });
  const updateLessonGroup = useUpdateLessonGroup({ onSuccess: onUpdateSuccess });

  const form = useForm<LessonGroupSchemaType>({
    resolver: zodResolver(lessonGroupSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values: LessonGroupSchemaType) => {
    if (objectId) {
      updateLessonGroup.mutate({ id: objectId, group: values.name });
    } else {
      addLessonGroup.mutate(values);
    }
  };

  const { handleSubmit, control, reset } = form;

  const isPending = addLessonGroup.isPending || updateLessonGroup.isPending;

  useEffect(() => {
    if (!data) return;

    reset(data.data);
  }, [data]);

  if (isLoading) return <Loader />;

  return (
    <Form {...form}>
      <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          name="name"
          control={control}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>שם</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <CustomButton
          className="w-full"
          variant={"success"}
          title="שמור"
          type="submit"
          isLoading={isPending}
        />
      </form>
    </Form>
  );
};

export default LessonGroupForm;
