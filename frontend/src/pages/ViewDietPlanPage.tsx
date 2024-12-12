import { useDietPlanApi } from "@/hooks/api/useDietPlanApi";
import { IDietPlan } from "@/interfaces/IDietPlan";
import { useState } from "react";
import { toast } from "sonner";
import { useParams } from "react-router";
import { defaultDietPlan } from "@/constants/DietPlanConsts";
import DietPlanForm from "@/components/DietPlan/DietPlanForm";
import Loader from "@/components/ui/Loader";
import ErrorPage from "./ErrorPage";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import { validateDietPlan } from "@/components/DietPlan/DietPlanSchema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CustomButton from "@/components/ui/CustomButton";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { useNavigate } from "react-router-dom";
import { MainRoutes } from "@/enums/Routes";
import { QueryKeys } from "@/enums/QueryKeys";
import BackButton from "@/components/ui/BackButton";

export const ViewDietPlanPage = () => {
  const navigation = useNavigate();
  const { id } = useParams();
  const { addDietPlan, updateDietPlanByUserId, getDietPlanByUserId } = useDietPlanApi();
  const { getAllDietPlanPresets } = useDietPlanPresetApi();
  const queryClient = useQueryClient();

  const [isNewPlan, setIsNewPlan] = useState(false);
  const [dietPlan, setDietPlan] = useState<IDietPlan | null>(null);

  const updateDietPlan = (dietPlan: IDietPlan) => setDietPlan(dietPlan);

  const onSuccess = () => {
    toast.success("תפריט נשמר בהצלחה!");
    queryClient.invalidateQueries({ queryKey: [`${QueryKeys.USER_DIET_PLAN}${id}`] });
    navigation(MainRoutes.USERS + `/${id}`);
  };

  const onError = (e: any) => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: e?.data?.message || "",
    });
  };

  const createDietPlan = useMutation({
    mutationFn: addDietPlan,
    onSuccess: onSuccess,
    onError: onError,
  });

  const editDietPlan = useMutation({
    mutationFn: ({ id, dietPlanToAdd }: { id: string; dietPlanToAdd: IDietPlan }) =>
      updateDietPlanByUserId(id, dietPlanToAdd),
    onSuccess: onSuccess,
    onError: onError,
  });

  const handleSubmit = () => {
    if (!dietPlan) return;
    const dietPlanToAdd = {
      ...dietPlan,
      userId: id,
    };

    const { isValid, errors } = validateDietPlan(dietPlanToAdd);

    if (!isValid) {
      toast.error(`יש בעיה בקלט.`);
      return;
    }
    if (isNewPlan) {
      createDietPlan.mutate(dietPlanToAdd);
    } else {
      if (!id) return;

      editDietPlan.mutate({ id, dietPlanToAdd });
    }
  };

  const dietPlanPresets = useQuery({
    queryKey: [QueryKeys.DIET_PLAN_PRESETS],
    enabled: !!id,
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: () => getAllDietPlanPresets(),
  });

  const { isLoading, error, data } = useQuery({
    queryKey: [`${QueryKeys.USER_DIET_PLAN}${id}`],
    enabled: !!id,
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: () =>
      getDietPlanByUserId(id!)
        .then((plan) => {
          setDietPlan(plan);
          return plan;
        })
        .catch((e) => {
          setIsNewPlan(true);
          setDietPlan(defaultDietPlan);
          return e;
        }),
  });

  const handleSelect = (presetName: string) => {
    const selectedPreset = dietPlanPresets?.data?.find((preset) => preset.name === presetName);

    if (!selectedPreset) return;
    const { meals, totalCalories, freeCalories, customInstructions } = selectedPreset;

    setDietPlan({
      meals,
      totalCalories,
      freeCalories,
      customInstructions,
    });
  };

  if (isLoading || dietPlanPresets.isLoading) return <Loader size="large" />;
  if (error) return <ErrorPage message={error.message} />;
  const plan = dietPlan || data;

  return (
    <div className=" flex flex-col gap-4 size-full hide-scrollbar overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-4">עריכת תפריט תזונה</h1>
      <BackButton navLink={MainRoutes.USERS + `/${id}`} />
      <Select onValueChange={(val) => handleSelect(val)}>
        <SelectTrigger dir="rtl" className="w-[350px] mr-1">
          <SelectValue placeholder="בחר תפריט" />
        </SelectTrigger>
        <SelectContent dir="rtl">
          {dietPlanPresets &&
            dietPlanPresets.data?.data.map((preset) => (
              <SelectItem key={preset.name} value={preset.name}>
                {preset.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {plan && (
        <>
          <DietPlanForm dietPlan={plan} updateDietPlan={updateDietPlan} />
          {plan.meals.length > 0 && (
            <div>
              <CustomButton
                className="font-bold"
                variant="success"
                onClick={handleSubmit}
                title="שמור תפריט"
                isLoading={createDietPlan.isPending || editDietPlan.isPending}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
