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
import { convertItemsToOptions, getNestedZodError } from "@/lib/utils";
import useDietPlanPresetsQuery from "@/hooks/queries/dietPlans/useDietPlanPresetsQuery";
import { cleanWorkoutObject } from "@/utils/workoutPlanUtils";
import { normalizeDietPlan } from "@/utils/dietPlanUtils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useDirtyFormContext } from "@/context/useFormContext";
import useGetDietPlan from "@/hooks/queries/dietPlans/useGetDietPlan";
import CustomSelect from "@/components/ui/CustomSelect";
import FormResponseBubbleWrapper from "@/components/formResponses/FormResponseBubbleWrapper";

export const ViewDietPlanPage = () => {
  const navigation = useNavigate();
  const { id } = useParams();
  const { users } = useUsersStore();
  const { data: fetchedUser } = useUserQuery(id);
  const user = users.find((user) => user._id === id) || fetchedUser;

  const queryClient = useQueryClient();

  const [isNewPlan, setIsNewPlan] = useState(false);
  const [openPresetModal, setOpenPresetModal] = useState(false);

  const { setIsDirty } = useDirtyFormContext();

  const form = useForm<IDietPlan>({
    resolver: zodResolver(dietPlanSchema),
    defaultValues: defaultDietPlan,
    mode: "onBlur",
  });

  const { reset, getValues, watch } = form;
  const meals = watch("meals");

  const { isLoading, data, error } = useGetDietPlan(id || "");

  const dietPlanPresets = useDietPlanPresetsQuery();

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

  const handleValidSubmit = (values: IDietPlan) => {
    const dietPlanToAdd = {
      ...values,
      userId: id,
    };

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
    const result = dietPlanSchema.safeParse({
      ...getValues(),
      userId: id,
    });

    if (!result.success) {
      const { title, description } = getNestedZodError(result.error);

      toast.error(title, { description });
    }
  };

  const handleSelect = (presetName: string) => {
    const selectedPreset = dietPlanPresets.data?.data.find((preset) => preset.name === presetName);

    if (!selectedPreset) return;
    const { name: _presetName, ...presetData } = selectedPreset;
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
    <div className=" flex flex-col gap-4 size-full">
      {user && <BasicUserDetails user={user} />}
      <FormResponseBubbleWrapper
        userId={id}
        query={{ formType: user && user?.isOnboarded ? "monthly" : "onboarding", userId: id }} // TODO: Check if user is onboarded
      />

      <BackButton navLink={MainRoutes.USERS + `/${id}?tab=${weightTab}`} />
      <CustomSelect
        className="sm:w-[350px] mr-1"
        placeholder="בחר תפריט"
        onValueChange={handleSelect}
        items={
          dietPlanPresets.data?.data
            ? convertItemsToOptions(dietPlanPresets.data?.data, "name", "name")
            : []
        }
      />

      <Form {...form}>
        <DietPlanForm>
          {(meals?.length || 0) > 0 && (
            <div className="flex gap-3 flex-row  fixed bottom-10 end-16">
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
                onClick={form.handleSubmit(handleValidSubmit, handleInvalidSubmit)}
                title="שמור תפריט"
                disabled={addDietPlanPreset.isPending}
                isLoading={createDietPlan.isPending || editDietPlan.isPending}
              />
            </div>
          )}
        </DietPlanForm>
      </Form>
      <InputModal
        onClose={() => setOpenPresetModal(false)}
        open={openPresetModal}
        onSubmit={(val) => handleAddPreset(val)}
      />
    </div>
  );
};
