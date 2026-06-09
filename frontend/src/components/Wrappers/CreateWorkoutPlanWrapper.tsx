import { useForm } from "react-hook-form";
import {
  fullWorkoutPlanSchema,
  workoutPresetSchema,
  WorkoutSchemaType,
} from "@/schemas/workoutPlanSchema";
import { Form } from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "../ui/CustomButton";
import useWorkoutPlanQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanQuery";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useUsersStore } from "@/store/userStore";
import BasicUserDetails from "../UserDashboard/UserInfo/BasicUserDetails";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import { MainRoutes } from "@/enums/Routes";
import { weightTab } from "@/pages/UserDashboard";
import BackButton from "../ui/BackButton";
import useWorkoutPlanPresetsQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanPresetsQuery";
import { collectAllErrors, getZodErrorIssues, ValidationErrorEntry } from "@/lib/utils";
import ValidationErrorsDialog from "../Alerts/ValidationErrorsDialog";
import WorkoutPresetPicker from "../templates/workoutTemplates/WorkoutPresetPicker";
import PresetMetaPanel from "../templates/workoutTemplates/PresetMetaPanel";
import { FaFolderOpen } from "react-icons/fa6";
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
import FormResponseBubbleWrapper from "../formResponses/FormResponseBubbleWrapper";
import WorkoutPlanStatsStrip from "../workout plan/WorkoutPlanStatsStrip";
import WorkoutPlanSkeleton from "../workout plan/WorkoutPlanSkeleton";
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
  /**
   * When true the wrapper renders without the standalone-page header
   * (h1, back button, user details, form-response bubble) — used when the
   * editor is embedded inside the user dashboard. A clean stats strip is
   * shown instead, summarising the current plan.
   */
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
  // Rich preset-picker modal (replaces the bare ComboBox)
  const [openPresetPicker, setOpenPresetPicker] = useState(false);
  // Validation summary dialog — populated when the form fails to submit
  const [validationErrors, setValidationErrors] = useState<ValidationErrorEntry[]>([]);

  /**
   * Unsaved-changes guard — intercept any navigation while the form is
   * dirty and show our custom dialog. Hooks into useNavigationBlocker
   * (works with the classic BrowserRouter, unlike RR's useBlocker).
   */
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

  /**
   * Shared handler used by both the embedded and standalone layouts
   * when the trainer picks a preset from the WorkoutPresetPicker modal.
   * Forwards every meta field so the new plan inherits the trainer's
   * tagging (level, goal, duration, notes, limitations).
   */
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
    const { userId, ...rest } = workoutPlan as ICompleteWorkoutPlan;
    const preset = { name, ...rest };

    const { error } = workoutPresetSchema.safeParse(preset);
    const nestedError = error ? getZodErrorIssues(error?.issues)[0] : null;
    if (nestedError)
      return toast.error(nestedError?.title, { description: nestedError?.description });

    addWorkoutPlanPreset.mutate(preset);
  };

  const handleFindUser = () => {
    const user = users.find((user) => user._id === id);

    if (!user) {
      setIsNoUserWithId(true);
      return;
    }

    return user;
  };

  const onInvalidSubmit = (errors: any) => {
    const all = collectAllErrors(errors);
    if (all.length === 0) return;
    setValidationErrors(all);
  };

  const user = useMemo(handleFindUser, [id]) || userQuery.data;

  useEffect(() => {
    if (!data) return;

    reset(data.data);
  }, [data]);

  // Keep the browser-level beforeunload warning too (for tab close /
  // refresh). The custom in-app dialog is driven by useNavigationBlocker
  // above; the helper hook here only handles `window.onbeforeunload`.
  useUnsavedChangesWarning(isDirty);

  /**
   * After a successful save (data refetches → useEffect resets form →
   * isDirty becomes false), if the user chose "Save and continue" in the
   * dialog, honour the pending navigation now.
   */
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

  /**
   * Show the skeleton on first load only — once we've ever had data (or
   * confirmed there is none, i.e. 404), the user can build a plan from
   * scratch. We avoid showing the skeleton on background refetches.
   */
  const showSkeleton = isLoadingPlan && isFetchingPlan && !data;
  if (embedded && showSkeleton) {
    return <WorkoutPlanSkeleton />;
  }

  return (
    <Form {...form}>
      <div className="flex flex-col gap-4 w-full">
        {!embedded && (
          <div className="space-y-2">
            <h1 className="text-4xl">תוכנית אימון</h1>
            <BackButton navLink={MainRoutes.USERS + `/${id}?tab=${weightTab}`} />

            {user && <BasicUserDetails user={user} />}
            <FormResponseBubbleWrapper
              userId={id}
              query={{
                formType: user && user?.onboardingCompleted ? "monthly" : "onboarding",
                userId: id,
              }} // TODO: Check if user is onboarded
            />
          </div>
        )}

        {embedded && <WorkoutPlanStatsStrip />}

        {embedded ? (
          <div
            dir="rtl"
            className="flex flex-col gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
          >
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                טען תבנית קיימת
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                בחר תבנית שמורה כדי לאכלס את התוכנית במהירות
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpenPresetPicker(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700 dark:hover:bg-blue-950/30"
            >
              <FaFolderOpen size={12} />
              {selectedPreset ? `תבנית: ${selectedPreset}` : "בחר תבנית"}
            </button>
          </div>
        ) : (
          <div
            dir="rtl"
            className="flex items-center gap-3"
            style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
          >
            <button
              type="button"
              onClick={() => setOpenPresetPicker(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700 dark:hover:bg-blue-950/30"
            >
              <FaFolderOpen size={12} />
              {selectedPreset ? `תבנית: ${selectedPreset}` : "בחר תבנית"}
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              בחר תבנית כדי לאכלס את התוכנית במהירות
            </span>
          </div>
        )}
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}>
          {/* Meta panel — same 2-column layout used in the preset editor.
              Lets the trainer tag the client's plan with frequency,
              duration, level, goal, equipment, focus, limitations and
              notes. All fields are optional. */}
          <PresetMetaPanel />

          {children}

          {embedded ? (
            <div
              dir="rtl"
              className="sticky bottom-0 z-10 mt-3 flex flex-col gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-end"
              style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
            >
              {/* In RTL, the first child renders on the right — so "שמור
                  כתבנית" appears right of the green "שמור תוכנית" button. */}
              <button
                type="button"
                onClick={() => setOpenPresetModal(true)}
                disabled={updateWorkoutPlan.isPending || addWorkoutPlan.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addWorkoutPlanPreset.isPending ? "שומר תבנית…" : "שמור כתבנית"}
              </button>
              <button
                type="submit"
                disabled={
                  addWorkoutPlanPreset.isPending ||
                  updateWorkoutPlan.isPending ||
                  addWorkoutPlan.isPending
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {updateWorkoutPlan.isPending || addWorkoutPlan.isPending ? "שומר…" : "שמור תוכנית"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:justify-end sm:sticky sm:bottom-0 gap-2 py-1">
              <CustomButton
                className=" w-auto sm:w-fit"
                variant="secondary"
                type="button"
                onClick={() => setOpenPresetModal(true)}
                title="שמור תוכנית כתבנית"
                disabled={updateWorkoutPlan.isPending || addWorkoutPlan.isPending}
                isLoading={addWorkoutPlanPreset.isPending}
              />
              <button
                type="submit"
                disabled={
                  addWorkoutPlanPreset.isPending ||
                  updateWorkoutPlan.isPending ||
                  addWorkoutPlan.isPending
                }
                className="inline-flex w-full sm:w-32 items-center justify-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {updateWorkoutPlan.isPending || addWorkoutPlan.isPending ? "שומר…" : "שמור תוכנית"}
              </button>
            </div>
          )}
        </form>
      </div>
      <InputModal
        onClose={() => setOpenPresetModal(false)}
        open={openPresetModal}
        onSubmit={(val) => handleAddPreset(val)}
      />

      {/* Rich preset picker — opens from the "בחר תבנית" button */}
      <WorkoutPresetPicker
        open={openPresetPicker}
        onOpenChange={setOpenPresetPicker}
        presets={presetList}
        onSelect={applyPreset}
      />

      {/* Validation summary — lists every form error in one place */}
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
