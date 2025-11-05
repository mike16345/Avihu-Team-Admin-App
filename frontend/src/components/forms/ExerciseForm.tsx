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
import CustomButton from "../ui/CustomButton";
import TextEditor from "../ui/TextEditor";
import { buildPhotoUrl } from "@/lib/utils";
import { Button } from "../ui/button";

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

  const { data: muscleGroups } = useMuscleGroupsQuery();
  const { data: exercise } = useExerciseQuery(objectId || "undefined");

  const { reset } = exerciseForm;

  const [image, setImage] = useState<string>();
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  const successFunc = (message: string) => {
    invalidateQueryKeys([QueryKeys.EXERCISES, QueryKeys.EXERCISES + objectId]);

    toast.success(message);
    closeSheet();
  };

  const errorFunc = (err: any) =>
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: err.message,
    });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (!file) return;

    const existingImageKey = exerciseForm.getValues("imageUrl");
    setImageToDelete(existingImageKey || null);

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setImage(reader.result.toString());
      }
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
    onSuccess: () => successFunc(`פריט נשמר בהצלחה!`),
    onError: errorFunc,
  });

  const editExercise = useUpdateExercise({
    onSuccess: () => successFunc(`פריט עודכן בהצלחה!`),
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
              <FormLabel>טיפ מהמדריך</FormLabel>
              <FormControl>
                <TextEditor value={field.value || ""} onChange={(val) => field.onChange(val)} />
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
                  {muscleGroups?.data?.map((muscleGroup) => (
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

        <FormItem>
          <FormLabel>תמונה</FormLabel>
          <FormControl>
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
          </FormControl>
          <FormMessage />
        </FormItem>

        {(image || exerciseForm.getValues().imageUrl) && (
          <div className="flex flex-col gap-4 mt-2 relative">
            <img
              src={image || buildPhotoUrl(exerciseForm.getValues().imageUrl || "")}
              alt="Selected"
              className="w-full  rounded-md"
            />
            <Button
              type="button"
              className="bg-red-500 text-base text-white  rounded"
              onClick={handleRemoveImage}
            >
              הסר תמונה
            </Button>
          </div>
        )}

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
