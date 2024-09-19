import { useDietPlanApi } from "@/hooks/api/useDietPlanApi";
import { IDietPlan, IDietPlanPreset } from "@/interfaces/IDietPlan";
import { useEffect, useState } from "react";
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

export const ViewDietPlanPage = () => {
  const { id } = useParams();
  const { addDietPlan, updateDietPlanByUserId, getDietPlanByUserId } = useDietPlanApi();
  const { getAllDietPlanPresets } = useDietPlanPresetApi();
  const queryClient = useQueryClient();

  const [isNewPlan, setIsNewPlan] = useState(false);
  const [dietPlan, setDietPlan] = useState<IDietPlan | null>(null);

  const [presetList, setPresetList] = useState<IDietPlanPreset[]>([]);

  const updateDietPlan = (dietPlan: IDietPlan) => setDietPlan(dietPlan);

  const onSuccess = () => {
    toast.success("תפריט נשמר בהצלחה!");
    queryClient.invalidateQueries({ queryKey: [`diet-plans-${id}`] });
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

  const handleSelect = (presetName: string) => {
    const selectedPreset = presetList?.find((preset) => preset.name === presetName);

    if (!selectedPreset) return;

    setDietPlan({
      ...selectedPreset,
      meals: selectedPreset.meals,
      totalCalories: selectedPreset.totalCalories,
    });
  };

  const { isLoading, isError, error, data } = useQuery({
    queryKey: [`diet-plans-${id}`],
    enabled: !!id,
    queryFn: () =>
      getDietPlanByUserId(id!).catch((e) => {
        setIsNewPlan(true);
        return e;
      }),
  });

  useEffect(() => {
    getAllDietPlanPresets().then((res) => setPresetList(res.data));
  }, []);

  if (isLoading) return <Loader size="large" />;
  if (error) return <ErrorPage message={error.message} />;
  const plan = dietPlan || defaultDietPlan;

  return (
    <div className=" flex flex-col gap-4 size-full hide-scrollbar overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-4">עריכת תפריט תזונה</h1>
      <Select onValueChange={(val) => handleSelect(val)}>
        <SelectTrigger dir="rtl" className="w-[350px] mr-1">
          <SelectValue placeholder="בחר תפריט" />
        </SelectTrigger>
        <SelectContent dir="rtl">
          {presetList?.map((preset) => (
            <SelectItem key={preset.name} value={preset.name}>
              {preset.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
    </div>
  );
};
