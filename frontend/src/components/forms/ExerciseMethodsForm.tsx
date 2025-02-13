import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form";
import React from 'react'
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '../ui/input';
import CustomButton from '../ui/CustomButton';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

interface ExerciseMethodsFormProps {
  objectId?: string;
  closeSheet: () => void;
}

const ExerciseMethodsSchema = z.object({
  title: z.string().min(1, { message: `אנא בחר שם לשיטת אימון` }),
  description: z.string().min(1, { message: `אנא הקלד תיאור לשיטת אימון` }),
});

const ExerciseMethodsForm:React.FC<ExerciseMethodsFormProps> = ({closeSheet,objectId}) => {
    /* const onSuccess = (e: any) => {
    queryClient.invalidateQueries({ queryKey: [`muscleGroups`] });
    toast.success(`פריט נשמר בהצלחה!`);
    closeSheet();
  };

  const onError = (e: any) => {
    console.log("error", e);
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: e.data.message,
    });
  };
  const addNewMuscleGroup = useMutation({
    mutationFn: addMuscleGroup,
    onSuccess,
    onError,
  });

  const updateAMuscleGroup = useMutation({
    mutationFn: ({ objectId, values }: { objectId: string; values: IMuscleGroupItem }) =>
      updateMuscleGroup(objectId, values),
    onSuccess,
    onError,
  }); */

  const exercisesMethodsForm = useForm<z.infer<typeof ExerciseMethodsSchema>>({
      resolver: zodResolver(ExerciseMethodsSchema),
      defaultValues: {
        title: "",
        description:""
      },
    });

    const { reset } = exercisesMethodsForm;

    const onSubmit = (values: z.infer<typeof ExerciseMethodsSchema>) => {
        toast.success(`${values.title} ${values.description}`)
        /* if (objectId) {
          updateAMuscleGroup.mutate({ objectId, values });
        } else {
          addNewMuscleGroup.mutate(values);
        } */
      };


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
                <Textarea placeholder="הכנס תיאור כאן..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CustomButton
          className="w-full"
          type="submit"
          title="שמור"
          /* isLoading={updateAMuscleGroup.isPending || addNewMuscleGroup.isPending} */
        />
      </form>
    </Form>
  )
}

export default ExerciseMethodsForm
