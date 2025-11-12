import { IDietPlan } from "@/interfaces/IDietPlan";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "react-router";
import { defaultDietPlan } from "@/constants/DietPlanConsts";
import DietPlanForm from "@/components/DietPlan/DietPlanForm";
import Loader from "@/components/ui/Loader";
import ErrorPage from "./ErrorPage";
import { Input } from "@/components/ui/input";
import { normalizeDietPlan, removeIdsAndVersions } from "@/utils/dietPlanUtils";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomButton from "@/components/ui/CustomButton";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/enums/QueryKeys";
import { useNavigate } from "react-router-dom";
import { MainRoutes } from "@/enums/Routes";
import BackButton from "@/components/ui/BackButton";
import { useDirtyFormContext } from "@/context/useFormContext";
import { dietPlanSchema, validateDietPlan } from "@/components/DietPlan/DietPlanSchema";
import useDietPlanPresetQuery from "@/hooks/queries/dietPlans/useDietPlanPresetQuery";
import useAddDietPlanPreset from "@/hooks/mutations/DietPlans/useAddDietPlanPreset";
import useUpdateDietPlanPreset from "@/hooks/mutations/DietPlans/useUpdateDietPlanPreset";
import { presetNameSchema, PresetNameSchemaType } from "@/schemas/dietPlanPresetSchema";

export const ViewDietPlanPresetPage = () => {
  const { setErrors, setIsDirty } = useDirtyFormContext();

  const navigation = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [isNewPlan, setIsNewPlan] = useState(true);

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

  const handleSubmit = (values: PresetNameSchemaType) => {
    const dietPlan = getPlanValues();
    const dietPlanToAdd = {
      ...dietPlan,
      name: values.name,
    };

    const { isValid, errors } = validateDietPlan(dietPlan);

    if (!isValid) {
      setErrors(errors);
      return;
    }

    if (!isNewPlan && !!id) {
      const cleanedDietPlan = removeIdsAndVersions(dietPlanToAdd);

      updatePreset.mutate({ id, cleanedDietPlan });
    } else {
      createPreset.mutate(dietPlanToAdd);
    }
  };

  useEffect(() => {
    if (!data) return;

    const normalized = normalizeDietPlan(data.data);
    reset(normalized);
    resetPlanForm(normalized);
    setIsNewPlan(false);
    setIsDirty(false);
  }, [data, reset, resetPlanForm, setIsDirty]);

  if (isLoading) return <Loader size="large" />;
  if (error) return <ErrorPage message={error.message} />;

  return (
    <div className=" flex flex-col gap-4 size-full ">
      <BackButton navLink={MainRoutes.DIET_PLANS} />
      <div className="w-1/3 ">
        <Form {...presetNameForm}>
          <form>
            <FormField
              control={presetNameForm.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="font-bold underline pb-3">שם התפריט:</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="שם לתפריט..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </form>
        </Form>
      </div>
      <Form {...planForm}>
        <DietPlanForm>
          {(meals?.length || 0) > 0 && (
            <CustomButton
              className="font-bold sm:w-32 w-full"
              variant="success"
              title="שמור תפריט"
              isLoading={createPreset.isPending || updatePreset.isPending}
              onClick={presetNameForm.handleSubmit(handleSubmit)}
            />
          )}
        </DietPlanForm>
      </Form>
    </div>
  );
};
