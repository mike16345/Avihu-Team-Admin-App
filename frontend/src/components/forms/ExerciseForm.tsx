import React, { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { QueryKeys } from "@/enums/QueryKeys";
import { IPresetFormProps } from "@/interfaces/interfaces";
import { exerciseSchema } from "@/schemas/exerciseSchema";
import useMuscleGroupsQuery from "@/hooks/queries/MuscleGroups/useMuscleGroupsQuery";
import useUpdateExercise from "@/hooks/mutations/exercise/useUpdateExercise";
import useAddExercise from "@/hooks/mutations/exercise/useAddExercise";
import useExerciseQuery from "@/hooks/queries/exercises/useExerciseQuery";
import { invalidateQueryKeys } from "@/QueryClient/queryClient";
import { Input } from "../ui/input";

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

  const { data: muscleGroups = [] } = useMuscleGroupsQuery();
  const { data: exercise } = useExerciseQuery(objectId || "");

  const { reset } = exerciseForm;

  const successFunc = (message: string) => {
    invalidateQueryKeys([QueryKeys.EXERCISES, QueryKeys.EXERCISES + id]);

    toast.success(message);
    closeSheet();
  };

  const errorFunc = (err: any) =>
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: err.message,
    });

  const addNewExercise = useAddExercise({
    onSuccess: () => successFunc(`פריט נשמר בהצלחה!`),
    onError: errorFunc,
  });

  const editExercise = useUpdateExercise({
    onSuccess: () => successFunc(`פריט עודכן בהצלחה!`),
    onError: errorFunc,
  });

  const onSubmit = (values: z.infer<typeof exerciseSchema>) => {
    if (objectId) {
      editExercise.mutate({ id: objectId, exercise: values });
    } else {
      addNewExercise.mutate(values);
    }
  };

  useEffect(() => {
    if (!exercise) return;

    reset(exercise.data);
  }, [exercise]);

  return (
    <Form {...exerciseForm}>
      <form onSubmit={exerciseForm.handleSubmit(onSubmit)} className="space-y-4 text-right">
        <FormField
          control={exerciseForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם התרגיל</FormLabel>
              <FormControl>
                <Input placeholder="הכנס פריט כאן..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={exerciseForm.control}
          name="linkToVideo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>לינק לסרטון</FormLabel>
              <FormControl>
                <Input placeholder="https://youtube.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={exerciseForm.control}
          name="tipFromTrainer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>דגשים</FormLabel>
              <FormControl>
                <Input placeholder="דגשים לתרגיל..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={exerciseForm.control}
          name="muscleGroup"
          render={({ field }) => (
            <FormItem>
              <FormLabel>קבוצת שריר</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder={field.value} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent dir="rtl">
                  {muscleGroups?.map((muscleGroup) => (
                    <SelectItem key={muscleGroup.name} value={muscleGroup.name}>
                      {muscleGroup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <CustomButton
          className="w-full"
          type="submit"
          title="שמור"
          isLoading={addNewExercise.isPending || editExercise.isPending}
        />
      </form>
    </Form>
  );
};

export default ExerciseForm;
