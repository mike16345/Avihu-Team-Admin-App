import React, { useEffect } from "react";
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
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import useMuscleGroupsApi from "@/hooks/api/useMuscleGroupsApi";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IMuscleGroupItem } from "@/interfaces/IWorkoutPlan";

interface MusceGroupFormProps {
  objectId?: string;
  closeSheet: () => void;
}

const muscleGroupSchema = z.object({
  name: z.string().min(1, { message: `אנא בחר שם לקבוצת השריר` }),
});

const MusceGroupForm: React.FC<MusceGroupFormProps> = ({ objectId, closeSheet }) => {
  const { getMuscleGroupById, addMuscleGroup, updateMuscleGroup } = useMuscleGroupsApi();
  const queryClient = useQueryClient();

  const addNewMuscleGroup = useMutation({
    mutationFn: addMuscleGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`muscleGroups`] });
    },
  });
  const updateAMuscleGroup = useMutation({
    mutationFn: ({ objectId, values }: { objectId: string; values: IMuscleGroupItem }) =>
      updateMuscleGroup(objectId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`muscleGroups`] });
    },
  });

  const muscleGroupForm = useForm<z.infer<typeof muscleGroupSchema>>({
    resolver: zodResolver(muscleGroupSchema),
    defaultValues: {
      name: "",
    },
  });

  const { reset } = muscleGroupForm;

  const onSubmit = (values: z.infer<typeof muscleGroupSchema>) => {
    if (objectId) {
      updateAMuscleGroup.mutate({ objectId, values });
      if (updateAMuscleGroup.isError) {
        toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
          description: updateAMuscleGroup.error.message,
        });
        return;
      }
      toast.success(`פריט נשמר בהצלחה!`);
      closeSheet();
    } else {
      addNewMuscleGroup.mutate(values);
      if (addNewMuscleGroup.isError) {
        toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
          description: addNewMuscleGroup.error.message,
        });
        return;
      }

      toast.success(`פריט נשמר בהצלחה!`);
      closeSheet();
    }
  };

  useEffect(() => {
    if (!objectId) return;

    getMuscleGroupById(objectId)
      .then((res) => reset(res.data))
      .catch((err) => console.log(err));
  }, []);
  return (
    <Form {...muscleGroupForm}>
      <form onSubmit={muscleGroupForm.handleSubmit(onSubmit)} className="space-y-4 text-right">
        <FormField
          control={muscleGroupForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם</FormLabel>
              <FormControl>
                <Input placeholder="הכנס פריט כאן..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit">
          שמור
        </Button>
      </form>
    </Form>
  );
};

export default MusceGroupForm;
