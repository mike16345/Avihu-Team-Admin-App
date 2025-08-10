import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import useWorkoutPlanPresetQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanPresetQuery";
import { useNavigate, useParams } from "react-router-dom";
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
import { convertItemsToOptions, getNestedError } from "@/lib/utils";
import useWorkoutPlanPresetsQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanPresetsQuery";
import { ISimpleCardioType, IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";
import { cleanWorkoutObject, parseErrorFromObject } from "@/utils/workoutPlanUtils";
import useUpdateWorkoutPlanPreset from "@/hooks/mutations/workouts/useUpdateWorkoutPlanPreset";
import { defaultSimpleCardioOption } from "@/constants/cardioOptions";
import { WorkoutPresetSchemaType, workoutPresetSchema } from "@/schemas/workoutPlanSchema";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { onSuccess } from "@/lib/query";
import { QueryKeys } from "@/enums/QueryKeys";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";

export const CreateWorkoutPresetWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const { id = "" } = useParams();
  const navigation = useNavigate();

  const form = useForm<WorkoutPresetSchemaType>({
    resolver: zodResolver(workoutPresetSchema),
    defaultValues: {
      name: "",
      workoutPlans: [],
      cardio: { type: "simple", plan: defaultSimpleCardioOption },
    },
  });
  const {
    formState: { isDirty },
    getValues,
    reset,
    handleSubmit,
  } = form;

  const { data: workoutPlanPresets } = useWorkoutPlanPresetsQuery();
  const { data } = useWorkoutPlanPresetQuery(id);

  const onMutateSuccess = () => {
    navigation(MainRoutes.WORKOUT_PLANS_PRESETS);
  };

  const onError = (error: any) => {
    const message = error?.data?.message || parseErrorFromObject(error?.data || "");

    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: message,
    });
  };

  const addWorkoutPreset = useAddWorkoutPreset({
    onSuccess: () => {
      onSuccess("תבנית נשמר בהצלחה!", [QueryKeys.WORKOUT_PRESETS]);
      onMutateSuccess();
    },
    onError,
  });
  const updateWorkoutPlanPreset = useUpdateWorkoutPlanPreset({
    onSuccess: () => {
      onSuccess("תבנית עודכן בהצלחה!", [QueryKeys.WORKOUT_PRESETS, QueryKeys.WORKOUT_PRESETS + id]);
      onMutateSuccess();
    },
    onError,
  });

  const [selectedPreset, setSelectedPreset] = useState("");

  const workoutPresetsOptions = useMemo(
    () => convertItemsToOptions(workoutPlanPresets?.data || [], "name"),
    [workoutPlanPresets?.data]
  );

  const handleSelectPreset = (preset: IWorkoutPlanPreset) => {
    reset({
      name: getValues("name"),
      workoutPlans: preset.workoutPlans,
      cardio: preset.cardio || { type: "simple", plan: defaultSimpleCardioOption },
    });
    setSelectedPreset(preset.name);
  };

  const onSubmit = (values: WorkoutPresetSchemaType) => {
    let workoutPlan = values;
    const cardioPlan = values.cardio.type == "simple" && (values.cardio.plan as ISimpleCardioType);

    if (cardioPlan) {
      const minsPerWorkout = cardioPlan.minsPerWeek / cardioPlan.timesPerWeek;

      workoutPlan = {
        ...values,
        cardio: {
          type: values.cardio.type,
          plan: {
            ...cardioPlan,
            minsPerWorkout,
          },
        },
      };
    }

    if (id) {
      updateWorkoutPlanPreset.mutate({ presetId: id, updatedPreset: workoutPlan });
    } else {
      addWorkoutPreset.mutate(workoutPlan);
    }
  };

  const onInvalidSubmit = (e: any) => {
    const errorMessage = getNestedError(e);
    toast.error(errorMessage?.title, { description: errorMessage?.description });
  };

  useEffect(() => {
    if (!data) return;

    reset(data);
  }, [data]);

  useUnsavedChangesWarning(isDirty);

  return (
    <>
      <div className="flex flex-col gap-4 p-4 h-full">
        <h1 className="text-3xl">תבנית אימון</h1>
        <BackButton navLink={MainRoutes.WORKOUT_PLANS_PRESETS} />
        <Form {...form}>
          <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}>
            <div className="w-full ">
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
                <div className="space-y-2 sm:w-fit sm:min-w-24">
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

            <div className="border-b-2 rounded">{children}</div>
            <div className="flex sm:justify-end py-1.5 sm:sticky sm:bottom-0">
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
