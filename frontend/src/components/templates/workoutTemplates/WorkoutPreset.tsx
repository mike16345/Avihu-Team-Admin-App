import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import useWorkoutPlanPresetQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanPresetQuery";
import { useParams } from "react-router-dom";
import BackButton from "@/components/ui/BackButton";
import { MainRoutes } from "@/enums/Routes";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomButton from "@/components/ui/CustomButton";
import useAddWorkoutPreset from "@/hooks/mutations/workouts/useAddWorkoutPreset";
import { Input } from "@/components/ui/input";
import ComboBox from "@/components/ui/combo-box";
import { convertItemsToOptions } from "@/lib/utils";
import useWorkoutPlanPresetsQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanPresetsQuery";
import { IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";
import { cleanWorkoutObject } from "@/utils/workoutPlanUtils";
import useUpdateWorkoutPlanPreset from "@/hooks/mutations/workouts/useUpdateWorkoutPlanPreset";
import { defaultSimpleCardioOption } from "@/constants/cardioOptions";
import { WorkoutPresetSchemaType, workoutPresetSchema } from "@/schemas/workoutPlanSchema";
import { useForm } from "react-hook-form";

export const CreateWorkoutPresetWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const { id = "" } = useParams();
  const form = useForm<WorkoutPresetSchemaType>({
    resolver: zodResolver(workoutPresetSchema),
    defaultValues: {
      name: "",
      workoutPlans: [],
      cardio: { type: "simple", plan: defaultSimpleCardioOption },
    },
  });
  const { reset, handleSubmit } = form;

  const { data: workoutPlanPresets } = useWorkoutPlanPresetsQuery();
  const { data } = useWorkoutPlanPresetQuery(id);
  const addWorkoutPreset = useAddWorkoutPreset({});
  const updateWorkoutPlanPreset = useUpdateWorkoutPlanPreset();

  const [selectedPreset, setSelectedPreset] = useState("");

  const workoutPresetsOptions = useMemo(
    () => convertItemsToOptions(workoutPlanPresets?.data || [], "name"),
    [workoutPlanPresets?.data]
  );

  const handleSelectPreset = (preset: IWorkoutPlanPreset) => {
    reset({
      workoutPlans: preset.workoutPlans,
      cardio: preset.cardio,
    });
    setSelectedPreset(preset.name);
  };

  const onSubmit = (values: WorkoutPresetSchemaType) => {
    const cleanedPreset = cleanWorkoutObject(values);

    if (id) {
      updateWorkoutPlanPreset.mutate({ presetId: id, updatedPreset: cleanedPreset });
    } else {
      addWorkoutPreset.mutate(cleanedPreset);
    }
  };

  useEffect(() => {
    if (!data) return;

    reset(data);
  }, [data]);

  return (
    <>
      <div className="flex flex-col gap-4 p-4 h-full">
        <h1 className="text-4xl">תבנית אימון</h1>
        <BackButton navLink={MainRoutes.WORKOUT_PLANS_PRESETS} />
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="w-full py-4 border-b-2 mb-2">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel className="font-bold text-lg pb-3">שם התבנית</FormLabel>
                        <FormControl>
                          <Input className="sm:w-2/4" {...field} placeholder="שם..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <div className="space-y-2 sm:w-2/4">
                  <span>תבניות</span>
                  <ComboBox
                    value={selectedPreset}
                    options={workoutPresetsOptions}
                    onSelect={(currentValue) => {
                      handleSelectPreset(currentValue);
                    }}
                  />
                </div>
              </div>
            </div>

            {children}
            <div className="flex sm:justify-end py-1.5">
              <CustomButton
                className="w-full sm:w-32"
                variant="success"
                type="submit"
                title="שמור תוכנית אימון"
                disabled={addWorkoutPreset.isPending || updateWorkoutPlanPreset.isPending}
                isLoading={addWorkoutPreset.isPending || updateWorkoutPlanPreset.isPending}
              />
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};
