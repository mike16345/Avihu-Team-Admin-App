import { useForm } from "react-hook-form";
import {
  fullWorkoutPlanSchema,
  workoutPresetSchema,
  WorkoutSchemaType,
} from "@/schemas/workoutPlanSchema";
import { Form } from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import useWorkoutPlanQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanQuery";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useUsersStore } from "@/store/userStore";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import { MainRoutes } from "@/enums/Routes";
import { weightTab } from "@/pages/UserDashboard";
import useWorkoutPlanPresetsQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanPresetsQuery";
import { collectAllErrors, getZodErrorIssues, ValidationErrorEntry } from "@/lib/utils";
import ValidationErrorsDialog from "../Alerts/ValidationErrorsDialog";
import WorkoutPresetPicker from "../templates/workoutTemplates/WorkoutPresetPicker";
import PresetMetaPanel from "../templates/workoutTemplates/PresetMetaPanel";
import useAddWorkoutPlan from "@/hooks/mutations/workouts/useAddWorkoutPlan";
import useUpdateWorkoutPlan from "@/hooks/mutations/workouts/useUpdateWorkoutPlan";
import { parseErrorFromObject } from "@/utils/workoutPlanUtils";
import { toast } from "sonner";
import { invalidateQueryKeys } from "@/QueryClient/queryClient";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { QueryKeys } from "@/enums/QueryKeys";
import useAddWorkoutPreset from "@/hooks/mutations/workouts/useAddWorkoutPreset";
import InputModal from "../ui/InputModal";
import { defaultSimpleCardioOption } from "@/constants/cardioOptions";
import { ICompleteWorkoutPlan, ISimpleCardioType } from "@/interfaces/IWorkoutPlan";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import WorkoutPlanStatsStrip from "../workout plan/WorkoutPlanStatsStrip";
import WorkoutPlanSkeleton from "../workout plan/WorkoutPlanSkeleton";
import { WorkoutPlanPageHeader } from "../workout plan/WorkoutPlanPageHeader";
import { WorkoutPlanSaveActions } from "../workout plan/WorkoutPlanSaveActions";
import { WorkoutPresetLoadBar } from "../workout plan/WorkoutPresetLoadBar";
import { useNavigationBlocker } from "@/hooks/useNavigationBlocker";
import UnsavedChangesDialog from "../Alerts/UnsavedChangesDialog";
import { summariseWorkoutDirty } from "@/utils/dirtyFieldsSummary";

const calculateMinPerWorkout = (workout: WorkoutSchemaType) => {
  let workoutPlan = workout;
  if (workoutPlan.cardio.type == "complex") return workoutPlan;
  const cardioPlan = workoutPlan.cardio.plan as ISimpleCardioType;

  const minsPerWorkout = cardioPlan.minsPerWeek / cardioPlan.timesPerWeek;

  workoutPlan = {
    ...workoutPlan,
    cardio: {
      type: workoutPlan.cardio.type,
      plan: {
        ...cardioPlan,
        minsPerWorkout,
      },
    },
  };

  return workoutPlan;
};

interface CreateWorkoutPlanWrapperProps {
  children: React.ReactNode;
  embedded?: boolean;
}

const CreateWorkoutPlanWrapper = ({
  children,
  embedded = false,
}: CreateWorkoutPlanWrapperProps) => {
  const form = useForm<WorkoutSchemaType>({
    resolver: zodResolver(fullWorkoutPlanSchema),
    defaultValues: {
      tips: [],
      cardio: { type: "simple", plan: defaultSimpleCardioOption },
      workoutPlans: [],
    },
  });
  const {
    formState: { isDirty, dirtyFields },
    reset,
  } = form;
  const { id = "" } = useParams();
  const navigation = useNavigate();
  const users = useUsersStore((state) => state.users);

  const [isNoUserWithId, setIsNoUserWithId] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [openPresetModal, setOpenPresetModal] = useState(false);
  const [openPresetPicker, setOpenPresetPicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrorEntry[]>([]);
  const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);
  const [savingToProceed, setSavingToProceed] = useState(false);
  useNavigationBlocker(isDirty, (next) => setPendingNav(() => next));

  const onSuccess = () => {
    toast.success(`תכנית אימון נשמרה בהצלחה!`);
    if (!embedded) navigation(MainRoutes.USERS + `/${id}?tab=${weightTab}`);
    invalidateQueryKeys([`${QueryKeys.USER_WORKOUT_PLAN}${id}`, QueryKeys.NO_WORKOUT_PLAN]);
  };

  const presetSuccess = () => {
    toast.success("תבנית נשמרה בהצלחה!");
    invalidateQueryKeys([QueryKeys.WORKOUT_PRESETS]);
  };

  const onError = (error: any) => {
    const message = parseErrorFromObject(error.data || "");

    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: message,
    });
  };

  const { data, isLoading: isLoadingPlan, isFetching: isFetchingPlan } = useWorkoutPlanQuery(id);
  const userQuery = useUserQuery(id, isNoUserWithId);
  const workoutPlanPresets = useWorkoutPlanPresetsQuery();

  const addWorkoutPlan = useAddWorkoutPlan({ onError, onSuccess });
  const updateWorkoutPlan = useUpdateWorkoutPlan({ onError, onSuccess });
  const addWorkoutPlanPreset = useAddWorkoutPreset({ onError, onSuccess: presetSuccess });

  const presetList = useMemo(() => workoutPlanPresets.data?.data || [], [workoutPlanPresets.data]);

  const applyPreset = (preset: (typeof presetList)[number]) => {
    reset({
      ...preset,
      cardio: preset.cardio || { type: "simple", plan: defaultSimpleCardioOption },
    });
    setSelectedPreset(preset.name);
  };

  const onSubmit = (values: WorkoutSchemaType) => {
    if (!id) return Promise.reject("User ID is required!");
    const workoutPlan = calculateMinPerWorkout(values) as ICompleteWorkoutPlan;

    if (!data) {
      return addWorkoutPlan.mutate({ id, workoutPlan: workoutPlan });
    } else {
      return updateWorkoutPlan.mutate({ id, cleanedWorkoutPlan: workoutPlan });
    }
  };

  const handleAddPreset = (name: string) => {
    const workoutPlan = calculateMinPerWorkout(form.getValues());
    const preset = { name, ...(workoutPlan as ICompleteWorkoutPlan) };
    delete (preset as Partial<ICompleteWorkoutPlan>).userId;

    const { error } = workoutPresetSchema.safeParse(preset);
    const nestedError = error ? getZodErrorIssues(error?.issues)[0] : null;
    if (nestedError)
      return toast.error(nestedError?.title, { description: nestedError?.description });

    addWorkoutPlanPreset.mutate(preset);
  };

  const user = useMemo(() => users.find((storedUser) => storedUser._id === id), [id, users]);

  const onInvalidSubmit = (errors: any) => {
    const all = collectAllErrors(errors);
    if (all.length === 0) return;
    setValidationErrors(all);
  };

  const displayedUser = user || userQuery.data;

  useEffect(() => {
    if (!user) setIsNoUserWithId(true);
  }, [user]);

  useEffect(() => {
    if (!data) return;

    reset(data.data);
  }, [data, reset]);

  useUnsavedChangesWarning(isDirty);

  useEffect(() => {
    if (!savingToProceed) return;
    if (isDirty) return;
    if (pendingNav) {
      const next = pendingNav;
      setPendingNav(null);
      next();
    }
    setSavingToProceed(false);
  }, [savingToProceed, isDirty, pendingNav]);

  const showSkeleton = isLoadingPlan && isFetchingPlan && !data;
  if (embedded && showSkeleton) {
    return <WorkoutPlanSkeleton />;
  }

  const isPlanSaving = updateWorkoutPlan.isPending || addWorkoutPlan.isPending;
  const isSaveDisabled = addWorkoutPlanPreset.isPending || isPlanSaving;
  const backLink = MainRoutes.USERS + `/${id}?tab=${weightTab}`;

  return (
    <Form {...form}>
      <div className="flex flex-col gap-4 w-full">
        {!embedded && (
          <WorkoutPlanPageHeader backLink={backLink} user={displayedUser} userId={id} />
        )}

        {embedded && <WorkoutPlanStatsStrip />}

        <WorkoutPresetLoadBar
          embedded={embedded}
          selectedPreset={selectedPreset}
          onOpenPresetPicker={() => setOpenPresetPicker(true)}
        />

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}>
          <PresetMetaPanel />

          {children}

          <WorkoutPlanSaveActions
            embedded={embedded}
            isPresetSaving={addWorkoutPlanPreset.isPending}
            isPlanSaving={isPlanSaving}
            isSaveDisabled={isSaveDisabled}
            onOpenPresetModal={() => setOpenPresetModal(true)}
          />
        </form>
      </div>
      <InputModal
        onClose={() => setOpenPresetModal(false)}
        open={openPresetModal}
        onSubmit={(val) => handleAddPreset(val)}
      />

      <WorkoutPresetPicker
        open={openPresetPicker}
        onOpenChange={setOpenPresetPicker}
        presets={presetList}
        onSelect={applyPreset}
      />

      <ValidationErrorsDialog
        open={validationErrors.length > 0}
        onOpenChange={(open) => !open && setValidationErrors([])}
        errors={validationErrors}
        intro="יש לתקן את השדות הבאים לפני שמירת התוכנית"
      />

      <UnsavedChangesDialog
        open={pendingNav !== null}
        isSaving={updateWorkoutPlan.isPending || addWorkoutPlan.isPending}
        subject="תוכנית האימונים"
        changes={summariseWorkoutDirty(dirtyFields)}
        onSaveAndContinue={() => {
          setSavingToProceed(true);
          form.handleSubmit(onSubmit, onInvalidSubmit)();
        }}
        onDiscard={() => {
          if (data?.data) reset(data.data);
          else reset();
          const next = pendingNav;
          setPendingNav(null);
          if (next) next();
        }}
        onCancel={() => {
          setPendingNav(null);
        }}
      />
    </Form>
  );
};

export default CreateWorkoutPlanWrapper;
