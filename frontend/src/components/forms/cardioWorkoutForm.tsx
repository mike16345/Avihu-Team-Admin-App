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
import CustomButton from "../ui/CustomButton";
import { QueryKeys } from "@/enums/QueryKeys";
import { cardioWorkoutSchema } from "@/schemas/cardioWorkoutSchema";
import useUpdateCardiWorkout from "@/hooks/mutations/cardioWorkout/useUpdateCardioWorkout";
import { onError, onSuccess } from "@/lib/query";
import useAddCardioWorkout from "@/hooks/mutations/cardioWorkout/useAddCardioWrkout";
import useGetOneCardioWorkoutQuery from "@/hooks/queries/cardioWorkout/useGetOneCardioWorkoutQuery";

interface CardiWorkoutFormProps {
  objectId?: string;
  closeSheet: () => void;
}

const CardioWorkoutForm: React.FC<CardiWorkoutFormProps> = ({ objectId, closeSheet }) => {
  const successFunc = () => {
    onSuccess(`פריט נשמר בהצלחה!`, [
      QueryKeys.CARDIO_WORKOUT_PRESET,
      QueryKeys.CARDIO_WORKOUT_PRESET + objectId,
    ]);
    closeSheet();
  };

  const cardioWorkoutResponse = useGetOneCardioWorkoutQuery(objectId);
  const addCardioWorkout = useAddCardioWorkout({ onSuccess: successFunc, onError });
  const updateCardioWorkout = useUpdateCardiWorkout({ onSuccess: successFunc, onError });

  const cardioWorkoutForm = useForm<z.infer<typeof cardioWorkoutSchema>>({
    resolver: zodResolver(cardioWorkoutSchema),
    defaultValues: {
      name: "",
    },
  });

  const { reset } = cardioWorkoutForm;

  const onSubmit = (values: z.infer<typeof cardioWorkoutSchema>) => {
    if (objectId) {
      updateCardioWorkout.mutate({ id: objectId, cardioWorkout: values });
    } else {
      addCardioWorkout.mutate(values);
    }
  };

  useEffect(() => {
    if (!cardioWorkoutResponse.data) return;

    reset(cardioWorkoutResponse.data?.data);
  }, [cardioWorkoutResponse.data]);

  return (
    <Form {...cardioWorkoutForm}>
      <form onSubmit={cardioWorkoutForm.handleSubmit(onSubmit)} className="space-y-4 text-right">
        <FormField
          control={cardioWorkoutForm.control}
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
        <CustomButton
          className="w-full"
          type="submit"
          title="שמור"
          isLoading={updateCardioWorkout.isPending || addCardioWorkout.isPending}
        />
      </form>
    </Form>
  );
};

export default CardioWorkoutForm;
