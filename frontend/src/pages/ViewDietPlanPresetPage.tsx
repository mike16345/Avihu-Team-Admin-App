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
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/enums/QueryKeys";
import { useNavigate } from "react-router-dom";
import { MainRoutes } from "@/enums/Routes";
import BackLink from "@/components/ui/BackLink";
import { useDirtyFormContext } from "@/context/useFormContext";
import { dietPlanSchema, validateDietPlan } from "@/components/DietPlan/DietPlanSchema";
import useDietPlanPresetQuery from "@/hooks/queries/dietPlans/useDietPlanPresetQuery";
import useAddDietPlanPreset from "@/hooks/mutations/DietPlans/useAddDietPlanPreset";
import useUpdateDietPlanPreset from "@/hooks/mutations/DietPlans/useUpdateDietPlanPreset";
import { presetNameSchema, PresetNameSchemaType } from "@/schemas/dietPlanPresetSchema";
import DietPlanMetaPanel from "@/components/templates/dietTemplates/DietPlanMetaPanel";
import { FaUtensils, FaTag } from "react-icons/fa6";

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
    <div
      data-testid="diet-plan-preset-page"
      dir="rtl"
      className="flex flex-col gap-5 size-full"
      style={{ fontFamily: "Assistant, Heebo, system-ui, sans-serif" }}
    >
      {/* Back link uses navigate(-1) — context-aware. If the trainer
          arrived from the home dashboard shortcut → back returns
          home; if they came from the diet templates list → back
          returns to the list. Either way they don't lose context. */}
      <BackLink label="חזרה" />

      {/* Hero header — same family shell as forms/workouts/leads */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100/60 bg-white shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
        <div className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full bg-blue-100/60 dark:bg-blue-950/30 blur-3xl" />
        <div className="relative flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl brand-gradient text-white shadow-md shadow-blue-500/25">
            <FaUtensils size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">תבנית תפריט</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              בנה תפריט תזונה חוזר לשימוש למתאמנים — שם, תיוג, ארוחות ותוספים
            </p>
          </div>
        </div>
      </div>

      {/* Identity card — name in a styled input that matches the
          workout preset editor (same pattern, same field affordance). */}
      <div className="rounded-2xl border border-blue-100/60 bg-white p-5 shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
        <Form {...presetNameForm}>
          <form>
            <FormField
              control={presetNameForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <FaTag size={10} />
                    שם התפריט
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="שם לתפריט…"
                      className="h-11 w-full max-w-xs rounded-xl border-blue-100/60 bg-blue-50/30 text-base font-semibold text-slate-800 placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-200/60 dark:border-blue-900/40 dark:bg-blue-950/15 dark:text-slate-100 dark:focus:bg-slate-900"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      <Form {...planForm}>
        <DietPlanMetaPanel />
        <DietPlanForm>
          {(meals?.length || 0) > 0 && (
            <button
              type="button"
              disabled={createPreset.isPending || updatePreset.isPending}
              onClick={presetNameForm.handleSubmit(handleSubmit)}
              className="inline-flex items-center justify-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-32 w-full md:fixed md:bottom-10 md:end-10"
            >
              {createPreset.isPending || updatePreset.isPending ? "שומר…" : "שמור תבנית"}
            </button>
          )}
        </DietPlanForm>
      </Form>
    </div>
  );
};
