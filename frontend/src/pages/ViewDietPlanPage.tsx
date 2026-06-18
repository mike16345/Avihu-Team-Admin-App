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
import { useNavigate } from "react-router-dom";
import { MainRoutes } from "@/enums/Routes";
import { QueryKeys } from "@/enums/QueryKeys";
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
import DietPlanStatsStrip from "@/components/DietPlan/DietPlanStatsStrip";
import { useNavigationBlocker } from "@/hooks/useNavigationBlocker";
import UnsavedChangesDialog from "@/components/Alerts/UnsavedChangesDialog";
import { summariseDietDirty } from "@/utils/dirtyFieldsSummary";
import { DietPlanPageHeader } from "@/components/DietPlan/DietPlanPageHeader";
import { DietPlanPresetLoadBar } from "@/components/DietPlan/DietPlanPresetLoadBar";
import { DietPlanSaveActions } from "@/components/DietPlan/DietPlanSaveActions";

interface ViewDietPlanPageProps {
  embedded?: boolean;
}

export const ViewDietPlanPage = ({ embedded = false }: ViewDietPlanPageProps) => {
  const navigation = useNavigate();
  const { id } = useParams();
  const { users } = useUsersStore();
  const { data: fetchedUser } = useUserQuery(id);
  const user = users.find((user) => user._id === id) || fetchedUser;
  const userProfileDietTab = MainRoutes.USERS + `/${id}?tab=${weightTab}`;

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

  const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);
  const [savingToProceed, setSavingToProceed] = useState(false);

  useNavigationBlocker(isDirty, (next) => setPendingNav(() => next));

  const { isLoading, data, error } = useGetDietPlan(id || "");

  const dietPlanPresets = useDietPlanPresetsQuery();

  const onSuccess = () => {
    toast.success("תפריט נשמר בהצלחה!");
    invalidateQueryKeys([`${QueryKeys.USER_DIET_PLAN}${id}`]);
    if (!embedded) navigation(userProfileDietTab);
  };

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

  const isPlanSaving = createDietPlan.isPending || editDietPlan.isPending;
  const isSaveDisabled = addDietPlanPreset.isPending || isPlanSaving;
  const hasMeals = (meals?.length || 0) > 0;
  const saveDietPlan = form.handleSubmit(handleValidSubmit, handleInvalidSubmit);

  if (isLoading) return <Loader size="large" />;

  return (
    <div dir="rtl" className="flex flex-col gap-4 size-full font-heebo">
      {!embedded && (
        <DietPlanPageHeader backLink={userProfileDietTab} user={user} userId={id} />
      )}

      <Form {...form}>
        {embedded && <DietPlanStatsStrip />}

        <DietPlanPresetLoadBar
          embedded={embedded}
          onOpenPresetPicker={() => setOpenPickerModal(true)}
        />

        <DietPlanForm>
          {hasMeals && (
            <DietPlanSaveActions
              embedded={embedded}
              isPlanSaving={isPlanSaving}
              isPresetSaving={addDietPlanPreset.isPending}
              isSaveDisabled={isSaveDisabled}
              onOpenPresetModal={() => setOpenPresetModal(true)}
              onSavePlan={saveDietPlan}
            />
          )}
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
