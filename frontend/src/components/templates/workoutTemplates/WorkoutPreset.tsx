import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import useWorkoutPlanPresetQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanPresetQuery";
import { useNavigate, useParams } from "react-router-dom";
import { MainRoutes } from "@/enums/Routes";
import { Form } from "@/components/ui/form";
import BackLink from "@/components/ui/BackLink";
import useAddWorkoutPreset from "@/hooks/mutations/workouts/useAddWorkoutPreset";
import { collectAllErrors, ValidationErrorEntry } from "@/lib/utils";
import WorkoutPresetPicker from "./WorkoutPresetPicker";
import ValidationErrorsDialog from "../../Alerts/ValidationErrorsDialog";
import useWorkoutPlanPresetsQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanPresetsQuery";
import { ISimpleCardioType, IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";
import { parseErrorFromObject } from "@/utils/workoutPlanUtils";
import useUpdateWorkoutPlanPreset from "@/hooks/mutations/workouts/useUpdateWorkoutPlanPreset";
import { defaultSimpleCardioOption } from "@/constants/cardioOptions";
import { WorkoutPresetSchemaType, workoutPresetSchema } from "@/schemas/workoutPlanSchema";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { onSuccess } from "@/lib/query";
import { QueryKeys } from "@/enums/QueryKeys";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import PresetMetaPanel from "./PresetMetaPanel";
import { WorkoutPresetEditorHeader } from "./WorkoutPresetEditorHeader";
import { WorkoutPresetIdentityCard } from "./WorkoutPresetIdentityCard";
import { WorkoutPresetSaveAction } from "./WorkoutPresetSaveAction";

const getWorkoutPresetErrorMessage = (error: any) =>
  error?.data?.message || parseErrorFromObject(error?.data || "");

const normalizeSimpleCardioPlan = (values: WorkoutPresetSchemaType) => {
  const simpleCardioPlan =
    values.cardio.type == "simple" && (values.cardio.plan as ISimpleCardioType);

  if (!simpleCardioPlan) return values;

  return {
    ...values,
    cardio: {
      type: values.cardio.type,
      plan: {
        ...simpleCardioPlan,
        minsPerWorkout: simpleCardioPlan.minsPerWeek / simpleCardioPlan.timesPerWeek,
      },
    },
  };
};

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
    const message = getWorkoutPresetErrorMessage(error);

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
  const [openPresetPicker, setOpenPresetPicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrorEntry[]>([]);

  const presetList = useMemo(() => workoutPlanPresets?.data || [], [workoutPlanPresets?.data]);

  const handleSelectPreset = (preset: IWorkoutPlanPreset) => {
    reset({
      name: getValues("name"),
      workoutPlans: preset.workoutPlans,
      cardio: preset.cardio || { type: "simple", plan: defaultSimpleCardioOption },
      workoutsPerWeek: preset.workoutsPerWeek,
      durationMinutes: preset.durationMinutes,
      level: preset.level,
      goal: preset.goal,
      equipment: preset.equipment,
      muscleFocus: preset.muscleFocus,
      note: preset.note,
      limitations: preset.limitations,
    });
    setSelectedPreset(preset.name);
  };

  const onSubmit = (values: WorkoutPresetSchemaType) => {
    const workoutPlan = normalizeSimpleCardioPlan(values);

    if (id) {
      updateWorkoutPlanPreset.mutate({ presetId: id, updatedPreset: workoutPlan });
    } else {
      addWorkoutPreset.mutate(workoutPlan);
    }
  };

  const onInvalidSubmit = (errors: any) => {
    const all = collectAllErrors(errors);
    if (all.length === 0) return;
    setValidationErrors(all);
  };

  useEffect(() => {
    if (!data) return;

    reset(data);
  }, [data, reset]);

  useUnsavedChangesWarning(isDirty);
  const isSaving = addWorkoutPreset.isPending || updateWorkoutPlanPreset.isPending;

  return (
    <>
      <div dir="rtl" className="flex h-full flex-col gap-5 p-4 font-heebo">
        <BackLink label="חזרה" />

        <WorkoutPresetEditorHeader />

        <Form {...form}>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}>
            <WorkoutPresetIdentityCard
              control={form.control}
              selectedPreset={selectedPreset}
              onOpenPresetPicker={() => setOpenPresetPicker(true)}
            />

            <PresetMetaPanel />

            <div className="border-b-2 rounded">{children}</div>
            <WorkoutPresetSaveAction isSaving={isSaving} />
          </form>
        </Form>
      </div>

      <WorkoutPresetPicker
        open={openPresetPicker}
        onOpenChange={setOpenPresetPicker}
        presets={presetList}
        onSelect={handleSelectPreset}
      />

      <ValidationErrorsDialog
        open={validationErrors.length > 0}
        onOpenChange={(open) => !open && setValidationErrors([])}
        errors={validationErrors}
        intro="יש לתקן את השדות הבאים לפני שמירת התבנית"
      />
    </>
  );
};
