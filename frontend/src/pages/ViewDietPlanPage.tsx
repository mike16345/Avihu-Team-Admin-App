import { IDietPlan } from "@/interfaces/IDietPlan";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "react-router";
import { defaultDietPlan } from "@/constants/DietPlanConsts";
import DietPlanForm from "@/components/DietPlan/DietPlanForm";
import Loader from "@/components/ui/Loader";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { dietPlanSchema } from "@/components/DietPlan/DietPlanSchema";
import { useQueryClient } from "@tanstack/react-query";
import CustomButton from "@/components/ui/CustomButton";
import { useNavigate } from "react-router-dom";
import { MainRoutes } from "@/enums/Routes";
import { QueryKeys } from "@/enums/QueryKeys";
import BackLink from "@/components/ui/BackLink";
import BasicUserDetails from "@/components/UserDashboard/UserInfo/BasicUserDetails";
import { useUsersStore } from "@/store/userStore";
import { weightTab } from "./UserDashboard";
import useAddDietPlanPreset from "@/hooks/mutations/DietPlans/useAddDietPlanPreset";
import InputModal from "@/components/ui/InputModal";
import { invalidateQueryKeys } from "@/QueryClient/queryClient";
import useUpdateDietPlan from "@/hooks/mutations/DietPlans/useUpdateDietPlan";
import useAddDietPlan from "@/hooks/mutations/DietPlans/useAddDietPlan";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import { presetNameSchema } from "@/schemas/dietPlanPresetSchema";
import { getNestedZodError } from "@/lib/utils";
import useDietPlanPresetsQuery from "@/hooks/queries/dietPlans/useDietPlanPresetsQuery";
import { cleanWorkoutObject } from "@/utils/workoutPlanUtils";
import { normalizeDietPlan } from "@/utils/dietPlanUtils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useDirtyFormContext } from "@/context/useFormContext";
import useGetDietPlan from "@/hooks/queries/dietPlans/useGetDietPlan";
import DietPlanPresetPicker from "@/components/templates/dietTemplates/DietPlanPresetPicker";
import { FaUtensils, FaChevronDown } from "react-icons/fa6";
import FormResponseBubbleWrapper from "@/components/formResponses/FormResponseBubbleWrapper";
import DietPlanStatsStrip from "@/components/DietPlan/DietPlanStatsStrip";
import { useNavigationBlocker } from "@/hooks/useNavigationBlocker";
import UnsavedChangesDialog from "@/components/Alerts/UnsavedChangesDialog";
import { summariseDietDirty } from "@/utils/dirtyFieldsSummary";

interface ViewDietPlanPageProps {
  /**
   * When true the page renders without its standalone header (back button,
   * user details, form-response bubble) — used when embedded inside the
   * user-dashboard "תפריט תזונה" tab. A clean stats strip is shown
   * instead, and the save flow stays on the same page.
   */
  embedded?: boolean;
}

export const ViewDietPlanPage = ({ embedded = false }: ViewDietPlanPageProps) => {
  const navigation = useNavigate();
  const { id } = useParams();
  const { users } = useUsersStore();
  const { data: fetchedUser } = useUserQuery(id);
  const user = users.find((user) => user._id === id) || fetchedUser;

  const queryClient = useQueryClient();

  const [isNewPlan, setIsNewPlan] = useState(false);
  const [openPresetModal, setOpenPresetModal] = useState(false);
  const [openPickerModal, setOpenPickerModal] = useState(false);

  const { setIsDirty } = useDirtyFormContext();

  const form = useForm<IDietPlan>({
    resolver: zodResolver(dietPlanSchema),
    defaultValues: defaultDietPlan,
    mode: "onBlur",
  });

  const { reset, getValues, watch, formState } = form;
  const meals = watch("meals");
  const isDirty = formState.isDirty;

  /**
   * Unsaved-changes guard: if the trainer tries to leave the page (tab
   * switch, sidebar link, back button) with dirty form state, intercept
   * and show a dialog. They can then save-and-continue, discard, or stay.
   * The `pendingNav` callback runs the deferred navigation once confirmed.
   */
  const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);
  const [savingToProceed, setSavingToProceed] = useState(false);

  useNavigationBlocker(isDirty, (next) => setPendingNav(() => next));

  const { isLoading, data, error } = useGetDietPlan(id || "");

  const dietPlanPresets = useDietPlanPresetsQuery();

  const onSuccess = () => {
    toast.success("תפריט נשמר בהצלחה!");
    invalidateQueryKeys([`${QueryKeys.USER_DIET_PLAN}${id}`]);
    if (!embedded) navigation(MainRoutes.USERS + `/${id}?tab=${weightTab}`);
  };

  // After a successful save (data refetches → form resets → isDirty
  // becomes false), if the user clicked "Save and continue" in the
  // unsaved-changes dialog, honour the pending navigation.
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

  const presetSuccess = () => {
    toast.success("תבנית נשמרה בהצלחה!");
    invalidateQueryKeys([QueryKeys.DIET_PLAN_PRESETS]);
  };

  const onError = (e: any) => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: e?.data?.message || "",
    });
  };

  const createDietPlan = useAddDietPlan({ onSuccess, onError });
  const editDietPlan = useUpdateDietPlan({ onSuccess, onError });
  const addDietPlanPreset = useAddDietPlanPreset({ onSuccess: presetSuccess, onError });

  const handleValidSubmit = (values: IDietPlan) => {
    const dietPlanToAdd = { ...values, userId: id };
    const result = dietPlanSchema.safeParse(dietPlanToAdd);
    if (!result.success) {
      const { title, description } = getNestedZodError(result.error);
      return toast.error(title, { description });
    }
    const cleanedDietPlan = cleanWorkoutObject(dietPlanToAdd);
    if (isNewPlan) {
      createDietPlan.mutate(cleanedDietPlan);
    } else {
      if (!id) return;
      editDietPlan.mutate({ id, cleanedDietPlan });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.NO_DIET_PLAN] });
    }
  };

  const handleInvalidSubmit = () => {
    const result = dietPlanSchema.safeParse({ ...getValues(), userId: id });
    if (!result.success) {
      const { title, description } = getNestedZodError(result.error);
      toast.error(title, { description });
    }
  };

  const handleSelectPreset = (preset: any) => {
    const { name: _presetName, ...presetData } = preset;
    void _presetName;
    reset(normalizeDietPlan(presetData as IDietPlan));
  };

  const handleAddPreset = (name: string) => {
    const dietPlan = getValues();
    const { error } = presetNameSchema.safeParse({ name: name });
    if (error) {
      const { title, description } = getNestedZodError(error);
      return toast.error(title, { description });
    }
    const preset: any = { ...dietPlan, name };
    delete preset.userId;
    delete preset._id;
    addDietPlanPreset.mutate(preset);
  };

  useEffect(() => {
    if (!id || !data) return;
    const { dietplan, failed } = data;
    reset(normalizeDietPlan(dietplan));
    if (failed) {
      setIsNewPlan(true);
      setIsDirty(true);
    }
  }, [data, id, reset, setIsDirty]);

  useEffect(() => {
    if (!error) return;
    if ((error as any)?.status === 404) {
      reset(normalizeDietPlan(defaultDietPlan));
      setIsNewPlan(true);
      setIsDirty(false);
    }
  }, [error, reset, setIsDirty]);

  if (isLoading) return <Loader size="large" />;

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-4 size-full"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {!embedded && (
        <>
          {user && <BasicUserDetails user={user} />}
          <FormResponseBubbleWrapper
            userId={id}
            query={{ formType: user?.onboardingCompleted ? "monthly" : "onboarding", userId: id }}
          />
          <BackLink to={MainRoutes.USERS + `/${id}?tab=${weightTab}`} label="חזרה לפרופיל המתאמן" />
        </>
      )}

      <Form {...form}>
        {embedded && <DietPlanStatsStrip />}

        {/* Preset picker — opens DietPlanPresetPicker modal with full
            search + filter capabilities (matches the templates page). */}
        {embedded ? (
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                טען תבנית קיימת
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                סנן לפי סוג תפריט, קלוריות והגבלות ובחר את המתאים למתאמן
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpenPickerModal(true)}
              className="inline-flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 sm:min-w-[260px]"
            >
              <span className="inline-flex items-center gap-2">
                <FaUtensils size={11} className="text-emerald-600" />
                בחר תפריט מתבנית
              </span>
              <FaChevronDown size={9} className="text-slate-400" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpenPickerModal(true)}
            className="mr-1 inline-flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 sm:w-[350px]"
          >
            <span className="inline-flex items-center gap-2">
              <FaUtensils size={11} className="text-emerald-600" />
              בחר תפריט מתבנית
            </span>
            <FaChevronDown size={9} className="text-slate-400" />
          </button>
        )}

        <DietPlanForm>
          {(meals?.length || 0) > 0 &&
            (embedded ? (
              <div className="sticky bottom-0 z-10 mt-3 flex flex-col gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpenPresetModal(true)}
                  disabled={createDietPlan.isPending || editDietPlan.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addDietPlanPreset.isPending ? "שומר תבנית…" : "שמור כתבנית"}
                </button>
                <button
                  type="button"
                  onClick={form.handleSubmit(handleValidSubmit, handleInvalidSubmit)}
                  disabled={
                    addDietPlanPreset.isPending ||
                    createDietPlan.isPending ||
                    editDietPlan.isPending
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {createDietPlan.isPending || editDietPlan.isPending ? "שומר…" : "שמור תפריט"}
                </button>
              </div>
            ) : (
              <div className="flex gap-3 flex-row fixed bottom-10 end-16">
                <CustomButton
                  className="font-bold sm:w-fit"
                  variant="default"
                  onClick={() => setOpenPresetModal(true)}
                  title="שמור תפריט כתבנית"
                  disabled={createDietPlan.isPending || editDietPlan.isPending}
                  isLoading={addDietPlanPreset.isPending}
                />
                <button
                  type="button"
                  onClick={form.handleSubmit(handleValidSubmit, handleInvalidSubmit)}
                  disabled={
                    addDietPlanPreset.isPending ||
                    createDietPlan.isPending ||
                    editDietPlan.isPending
                  }
                  className="inline-flex w-full sm:w-32 items-center justify-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {createDietPlan.isPending || editDietPlan.isPending ? "שומר…" : "שמור תפריט"}
                </button>
              </div>
            ))}
        </DietPlanForm>
      </Form>
      <InputModal
        onClose={() => setOpenPresetModal(false)}
        open={openPresetModal}
        onSubmit={(val) => handleAddPreset(val)}
      />

      <DietPlanPresetPicker
        open={openPickerModal}
        onOpenChange={setOpenPickerModal}
        presets={(dietPlanPresets.data?.data as any[]) ?? []}
        onSelect={handleSelectPreset}
      />

      <UnsavedChangesDialog
        open={pendingNav !== null}
        isSaving={createDietPlan.isPending || editDietPlan.isPending}
        subject="תפריט התזונה"
        changes={summariseDietDirty(formState.dirtyFields)}
        onSaveAndContinue={() => {
          setSavingToProceed(true);
          form.handleSubmit(handleValidSubmit, handleInvalidSubmit)();
        }}
        onDiscard={() => {
          // Drop dirty state by resetting to the server snapshot, then
          // honour the pending navigation.
          const snapshot = (data as any)?.dietplan;
          if (snapshot) reset(snapshot);
          else reset();
          const next = pendingNav;
          setPendingNav(null);
          if (next) next();
        }}
        onCancel={() => {
          setPendingNav(null);
        }}
      />
    </div>
  );
};
