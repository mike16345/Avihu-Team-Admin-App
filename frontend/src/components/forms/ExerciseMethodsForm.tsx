import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { useEffect } from "react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import CustomButton from "../ui/CustomButton";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import useExerciseMethodApi from "@/hooks/api/useExerciseMethodsApi";
import { QueryKeys } from "@/enums/QueryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { IExerciseMethod } from "@/interfaces/IWorkoutPlan";
import { ExerciseMethodsSchema } from "@/schemas/exerciseMethodSchema";
import { createRetryFunction } from "@/lib/utils";
import { IPresetFormProps } from "@/interfaces/interfaces";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import TextEditor from "../ui/TextEditor";
import Loader from "../ui/Loader";

const ExerciseMethodsForm: React.FC<IPresetFormProps> = ({ closeSheet, objectId }) => {
  const { addExerciseMethod, updateExerciseMethod, getExerciseMethodById } = useExerciseMethodApi();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.EXERCISE_METHODS + objectId],
    queryFn: () => getExerciseMethodById(objectId || ``),
    enabled: !!objectId,
    staleTime: FULL_DAY_STALE_TIME,
    retry: createRetryFunction(404, 2),
  });

  const onSuccess = (e: any) => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.EXERCISE_METHODS] });
    if (objectId) {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXERCISE_METHODS + objectId] });
    }
    toast.success(`פריט נשמר בהצלחה!`);
    closeSheet();
  };

  const onError = (e: any) => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: e.data.message,
    });
  };

  const addNewExerciseMethod = useMutation({
    mutationFn: addExerciseMethod,
    onSuccess,
    onError,
  });

  const editExerciseMethod = useMutation({
    mutationFn: ({ objectId, values }: { objectId: string; values: IExerciseMethod }) =>
      updateExerciseMethod(objectId, values),
    onSuccess,
    onError,
  });

  const exercisesMethodsForm = useForm<z.infer<typeof ExerciseMethodsSchema>>({
    resolver: zodResolver(ExerciseMethodsSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const { reset } = exercisesMethodsForm;

  const onSubmit = (values: z.infer<typeof ExerciseMethodsSchema>) => {
    if (objectId) {
      editExerciseMethod.mutate({ objectId, values });
    } else {
      addNewExerciseMethod.mutate(values);
    }
  };

  useEffect(() => {
    if (!data?.data) return;

    reset(data.data);
  }, [data]);

  if (isLoading) return <Loader size="large" />;

  return (
    <Form {...exercisesMethodsForm}>
      <form onSubmit={exercisesMethodsForm.handleSubmit(onSubmit)} className="space-y-4 text-right">
        <FormField
          control={exercisesMethodsForm.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם</FormLabel>
              <FormControl>
                <Input placeholder="הכנס שם כאן..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={exercisesMethodsForm.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>תיאור</FormLabel>
              <FormControl>
                <TextEditor
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CustomButton
          className="w-full"
          type="submit"
          title="שמור"
          isLoading={addNewExerciseMethod.isPending || editExerciseMethod.isPending}
        />
      </form>
    </Form>
  );
};

export default ExerciseMethodsForm;
