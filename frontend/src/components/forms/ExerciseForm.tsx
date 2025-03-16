import React, { useEffect, useState } from "react";
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
import { Input } from "../ui/input";
import useExercisePresetApi from "@/hooks/api/useExercisePresetApi";
import { toast } from "sonner";
import useMuscleGroupsApi from "@/hooks/api/useMuscleGroupsApi";
import { IExercisePresetItem, IMuscleGroupItem } from "@/interfaces/IWorkoutPlan";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CustomButton from "../ui/CustomButton";
import { QueryKeys } from "@/enums/QueryKeys";
import { IPresetFormProps } from "@/interfaces/interfaces";
import { exerciseSchema } from "@/schemas/exerciseSchema";

const ExerciseForm: React.FC<IPresetFormProps> = ({ objectId, closeSheet }) => {
  const { getExerciseById, addExercise, updateExercise } = useExercisePresetApi();
  const { getAllMuscleGroups } = useMuscleGroupsApi();
  const [muscleGroups, setMuscleGroups] = useState<IMuscleGroupItem[]>();

  const exerciseForm = useForm<z.infer<typeof exerciseSchema>>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      muscleGroup: "",
      linkToVideo: "",
      tipFromTrainer: "",
    },
  });

  const { reset } = exerciseForm;

  const queryClient = useQueryClient();

  const successFunc = (message: string) => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.EXERCISES] });
    toast.success(message);
    closeSheet();
  };

  const errorFunc = (err: any) =>
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: err.message,
    });

  const addNewExercise = useMutation({
    mutationFn: addExercise,
    onSuccess: () => successFunc(`פריט נשמר בהצלחה!`),
    onError: errorFunc,
  });

  const editExercise = useMutation({
    mutationFn: ({ objectId, values }: { objectId: string; values: IExercisePresetItem }) =>
      updateExercise(objectId, values),
    onSuccess: () => successFunc(`פריט עודכן בהצלחה!`),
    onError: errorFunc,
  });

  const onSubmit = (values: z.infer<typeof exerciseSchema>) => {
    if (objectId) {
      editExercise.mutate({ objectId, values });
    } else {
      addNewExercise.mutate(values);
    }
  };

  useEffect(() => {
    getAllMuscleGroups()
      .then((res) => setMuscleGroups(res.data))
      .catch((err) => console.log(err));

    if (!objectId) return;

    getExerciseById(objectId)
      .then((res) => reset(res.data))
      .catch((err) => console.log(err));
  }, []);

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
