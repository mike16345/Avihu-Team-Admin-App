import { IDietPlan } from "@/interfaces/IDietPlan";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "react-router";
import { defaultDietPlan } from "@/constants/DietPlanConsts";
import DietPlanForm from "@/components/DietPlan/DietPlanForm";
import Loader from "@/components/ui/Loader";
import ErrorPage from "./ErrorPage";
import { normalizeDietPlan, removeIdsAndVersions } from "@/utils/dietPlanUtils";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/enums/QueryKeys";
import { useNavigate } from "react-router-dom";
import { MainRoutes } from "@/enums/Routes";
import { useDirtyFormContext } from "@/context/useFormContext";
import { dietPlanSchema, validateDietPlan } from "@/components/DietPlan/DietPlanSchema";
import useDietPlanPresetQuery from "@/hooks/queries/dietPlans/useDietPlanPresetQuery";
import useAddDietPlanPreset from "@/hooks/mutations/DietPlans/useAddDietPlanPreset";
import useUpdateDietPlanPreset from "@/hooks/mutations/DietPlans/useUpdateDietPlanPreset";
import { presetNameSchema, PresetNameSchemaType } from "@/schemas/dietPlanPresetSchema";
import DietPlanMetaPanel from "@/components/templates/dietTemplates/DietPlanMetaPanel";
import { DietPlanPresetHeader } from "@/components/templates/dietTemplates/DietPlanPresetHeader";
import { DietPlanPresetNameCard } from "@/components/templates/dietTemplates/DietPlanPresetNameCard";
import { DietPlanPresetSaveAction } from "@/components/templates/dietTemplates/DietPlanPresetSaveAction";

export const ViewDietPlanPresetPage = () => {
  const { setErrors, setIsDirty } = useDirtyFormContext();

  const navigation = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [isEditingPreset, setIsEditingPreset] = useState(false);

  const presetNameForm = useForm<PresetNameSchemaType>({
    resolver: zodResolver(presetNameSchema),
    defaultValues: {
      name: "",
    },
  });

  const { reset } = presetNameForm;

  const planForm = useForm<IDietPlan>({
    resolver: zodResolver(dietPlanSchema),
    defaultValues: defaultDietPlan,
    mode: "onBlur",
  });

  const { reset: resetPlanForm, getValues: getPlanValues, watch: watchPlan } = planForm;
  const meals = watchPlan("meals");

  const onSuccess = () => {
    navigation(MainRoutes.DIET_PLANS);
    toast.success("תפריט נשמר בהצלחה!");
    queryClient.invalidateQueries({ queryKey: [QueryKeys.DIET_PLAN_PRESETS] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.DIET_PLAN_PRESETS + id] });
  };

  const onError = (e: any) => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: e?.data?.message || "",
    });
  };

  const { isLoading, error, data } = useDietPlanPresetQuery(id || "undefined");

  const createPreset = useAddDietPlanPreset({ onSuccess, onError });
  const updatePreset = useUpdateDietPlanPreset({ onSuccess, onError });

  const handleSavePreset = (values: PresetNameSchemaType) => {
    const dietPlan = getPlanValues();
    const dietPlanPreset = {
      ...dietPlan,
      name: values.name,
    };

    const { isValid, errors } = validateDietPlan(dietPlan);

    if (!isValid) {
      setErrors(errors);
      return;
    }

    if (isEditingPreset && id) {
      const cleanedDietPlan = removeIdsAndVersions(dietPlanPreset);
      updatePreset.mutate({ id, cleanedDietPlan });
      return;
    }

    createPreset.mutate(dietPlanPreset);
  };

  useEffect(() => {
    if (!data) return;

    const normalized = normalizeDietPlan(data.data);
    reset(normalized);
    resetPlanForm(normalized);
    setIsEditingPreset(true);
    setIsDirty(false);
  }, [data, reset, resetPlanForm, setIsDirty]);

  const hasMeals = (meals?.length || 0) > 0;
  const isSavingPreset = createPreset.isPending || updatePreset.isPending;
  const savePreset = presetNameForm.handleSubmit(handleSavePreset);

  if (isLoading) return <Loader size="large" />;
  if (error) return <ErrorPage message={error.message} />;

  return (
    <div
      data-testid="diet-plan-preset-page"
      dir="rtl"
      className="flex flex-col gap-5 size-full font-['Assistant','Heebo',system-ui,sans-serif]"
    >
      <DietPlanPresetHeader />
      <DietPlanPresetNameCard form={presetNameForm} />

      <Form {...planForm}>
        <DietPlanMetaPanel />
        <DietPlanForm>
          {hasMeals && (
            <DietPlanPresetSaveAction
              disabled={isSavingPreset}
              isSaving={isSavingPreset}
              onSave={savePreset}
            />
          )}
        </DietPlanForm>
      </Form>
    </div>
  );
};
