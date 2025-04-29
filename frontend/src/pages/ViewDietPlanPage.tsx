import { useDietPlanApi } from "@/hooks/api/useDietPlanApi";
import { IDietPlan } from "@/interfaces/IDietPlan";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "react-router";
import { defaultDietPlan } from "@/constants/DietPlanConsts";
import DietPlanForm from "@/components/DietPlan/DietPlanForm";
import Loader from "@/components/ui/Loader";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { dietPlanSchema } from "@/components/DietPlan/DietPlanSchema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CustomButton from "@/components/ui/CustomButton";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { useNavigate } from "react-router-dom";
import { MainRoutes } from "@/enums/Routes";
import { QueryKeys } from "@/enums/QueryKeys";
import BackButton from "@/components/ui/BackButton";
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
import { createRetryFunction, getNestedZodError } from "@/lib/utils";
import useDietPlanPresetsQuery from "@/hooks/queries/dietPlans/useDietPlanPresetsQuery";
import { cleanWorkoutObject } from "@/utils/workoutPlanUtils";

export const ViewDietPlanPage = () => {
  const navigation = useNavigate();
  const { id } = useParams();
  const { users } = useUsersStore();
  const { data: fetchedUser } = useUserQuery(id);
  const user = users.find((user) => user._id === id) || fetchedUser;

  const { getDietPlanByUserId } = useDietPlanApi();
  const queryClient = useQueryClient();

  const [isNewPlan, setIsNewPlan] = useState(false);
  const [openPresetModal, setOpenPresetModal] = useState(false);

  const handleGetDietPlan = async () => {
    if (!id) return;

    try {
      const plan = await getDietPlanByUserId(id);

      setIsNewPlan(false);
      setDietPlan(plan);

      return plan;
    } catch (err) {
      setDietPlan(defaultDietPlan);
      setIsNewPlan(true);
      throw err;
    }
  };

  const { isLoading, data } = useQuery({
    queryKey: [`${QueryKeys.USER_DIET_PLAN}${id}`],
    enabled: !!id,
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: handleGetDietPlan,
    retry: createRetryFunction(404, 2),
  });

  const dietPlanPresets = useDietPlanPresetsQuery();

  const [dietPlan, setDietPlan] = useState<IDietPlan | undefined>(data);

  const updateDietPlan = (dietPlan: IDietPlan) => setDietPlan(dietPlan);

  const onSuccess = () => {
    toast.success("תפריט נשמר בהצלחה!");
    invalidateQueryKeys([`${QueryKeys.USER_DIET_PLAN}${id}`]);
    navigation(MainRoutes.USERS + `/${id}?tab=${weightTab}`);
  };

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

  const handleSubmit = () => {
    if (!dietPlan) return;
    const dietPlanToAdd = {
      ...dietPlan,
      userId: id,
    };

    const { error } = dietPlanSchema.safeParse(dietPlanToAdd);

    if (error) {
      const { title, description } = getNestedZodError(error);

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

  const handleSelect = (presetName: string) => {
    const selectedPreset = dietPlanPresets.data?.data.find((preset) => preset.name === presetName);

    if (!selectedPreset) return;
    const { name: _, ...rest } = selectedPreset;

    setDietPlan({
      ...rest,
    });
  };

  const handleAddPreset = (name: string) => {
    if (!dietPlan) return;
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
    if (data) {
      setDietPlan(data);
      setIsNewPlan(false);
    } else {
      setIsNewPlan(true);
      setDietPlan(defaultDietPlan);
    }
  }, []);

  if (isLoading || dietPlanPresets.isLoading) return <Loader size="large" />;

  return (
    <div className=" flex flex-col gap-4 size-full hide-scrollbar overflow-y-auto">
      <div className="my-6">
        <h1 className="text-2xl font-semibold ">עריכת תפריט תזונה</h1>
        {user && <BasicUserDetails user={user} />}
      </div>

      <BackButton navLink={MainRoutes.USERS + `/${id}?tab=${weightTab}`} />
      <Select onValueChange={(val) => handleSelect(val)}>
        <SelectTrigger dir="rtl" className="sm:w-[350px] mr-1">
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

      {dietPlan && (
        <>
          <DietPlanForm dietPlan={dietPlan} updateDietPlan={updateDietPlan} />
          {dietPlan && dietPlan.meals.length > 0 && (
            <div className="flex gap-3 flex-col md:flex-row">
              <CustomButton
                className="font-bold  sm:w-fit "
                variant="default"
                onClick={() => setOpenPresetModal(true)}
                title="שמור תפריט כתבנית"
                disabled={createDietPlan.isPending || editDietPlan.isPending}
                isLoading={addDietPlanPreset.isPending}
              />
              <CustomButton
                className="font-bold w-full sm:w-32"
                variant="success"
                onClick={handleSubmit}
                title="שמור תפריט"
                disabled={addDietPlanPreset.isPending}
                isLoading={createDietPlan.isPending || editDietPlan.isPending}
              />
            </div>
          )}
        </>
      )}
      <InputModal
        onClose={() => setOpenPresetModal(false)}
        open={openPresetModal}
        onSubmit={(val) => handleAddPreset(val)}
      />
    </div>
  );
};
