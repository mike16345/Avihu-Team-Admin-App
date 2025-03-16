import { useForm } from "react-hook-form";
import { z } from "zod";
import { fullWorkoutPlanSchema, WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
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
import ComboBox from "../ui/combo-box";
import useWorkoutPlanPresetsQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanPresetsQuery";
import { convertItemsToOptions } from "@/lib/utils";
import useAddWorkoutPlan from "@/hooks/mutations/workouts/useAddWorkoutPlan";
import useUpdateWorkoutPlan from "@/hooks/mutations/workouts/useUpdateWorkoutPlan";
import { cleanWorkoutObject, parseErrorFromObject } from "@/utils/workoutPlanUtils";
import { toast } from "sonner";
import { invalidateQueryKeys } from "@/QueryClient/queryClient";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { QueryKeys } from "@/enums/QueryKeys";
import useAddWorkoutPreset from "@/hooks/mutations/workouts/useAddWorkoutPreset";
import InputModal from "../ui/InputModal";
import { defaultSimpleCardioOption } from "@/constants/cardioOptions";
import { ISimpleCardioType } from "@/interfaces/IWorkoutPlan";

const NewWorkoutPlan = ({ children }: { children: React.ReactNode }) => {
  const form = useForm<z.infer<typeof fullWorkoutPlanSchema>>({
    resolver: zodResolver(fullWorkoutPlanSchema),
    defaultValues: {
      tips: [],
      cardio: { type: "simple", plan: defaultSimpleCardioOption },
      workoutPlans: [],
    },
  });
  const { reset } = form;
  const { id = "" } = useParams();
  const navigation = useNavigate();
  const users = useUsersStore((state) => state.users);

  const [isNoUserWithId, setIsNoUserWithId] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [openPresetModal, setOpenPresetModal] = useState(false);

  const onSuccess = () => {
    toast.success(`תכנית אימון נשמרה בהצלחה!`);
    navigation(MainRoutes.USERS + `/${id}?tab=${weightTab}`);
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

  const { data } = useWorkoutPlanQuery(id);
  const userQuery = useUserQuery(id, isNoUserWithId);
  const workoutPlanPresets = useWorkoutPlanPresetsQuery();

  const addWorkoutPlan = useAddWorkoutPlan({ onError, onSuccess });
  const updateWorkoutPlan = useUpdateWorkoutPlan({ onError, onSuccess });
  const addWorkoutPlanPreset = useAddWorkoutPreset({ onError, onSuccess: presetSuccess });

  const workoutPresetsOptions = useMemo(
    () => convertItemsToOptions(workoutPlanPresets.data?.data || [], "name"),
    [workoutPlanPresets.data]
  );

  const onSubmit = (values: WorkoutSchemaType) => {
    console.log("submitting", values);
    // if (!id) return Promise.reject();
    let workoutPlan = values;
    const cardioPlan = values.cardio.type == "simple" && (values.cardio.plan as ISimpleCardioType);

    if (cardioPlan) {
      const minsPerWorkout = cardioPlan.minsPerWeek / cardioPlan.timesPerWeek;
      console.log("minsPerWeek", minsPerWorkout);

      workoutPlan = {
        ...values,
        cardio: {
          type: values.cardio.type,
          plan: {
            ...cardioPlan,
            minsPerWorkout,
          },
        },
      };
    }

    const cleanedPostObject = cleanWorkoutObject(workoutPlan);

    console.log("cleaning", cleanedPostObject);
    return;
    if (!data) {
      return addWorkoutPlan.mutate({ id, workoutPlan: cleanedPostObject });
    } else {
      return updateWorkoutPlan.mutate({ id, cleanedWorkoutPlan: cleanedPostObject });
    }
  };

  const handleAddPreset = (name: string) => {
    const preset = cleanWorkoutObject({
      name,
      ...form.getValues(),
    });
    delete preset.userId;

    // addWorkoutPlanPreset.mutate(preset);
  };

  const user =
    useMemo(() => {
      const user = users.find((user) => user._id === id);

      if (!user) {
        setIsNoUserWithId(true);
        return;
      }

      return user;
    }, [id]) || userQuery.data;

  useEffect(() => {
    if (!data) return;

    reset(data.data);
  }, [data]);

  if (form.formState.errors) {
    console.log("errors", form.formState.errors);
  }

  return (
    <Form {...form}>
      <div className="flex flex-col gap-2 w-full">
        <h1 className="text-4xl">תוכנית אימון</h1>
        <BackButton navLink={MainRoutes.USERS + `/${id}?tab=${weightTab}`} />

        {user && <BasicUserDetails user={user} />}
        <div className="sm:w-1/4">
          <ComboBox
            value={selectedPreset}
            options={workoutPresetsOptions}
            onSelect={(preset) => {
              reset({
                ...preset,
                cardio: preset.cardio || { type: "simple", plan: defaultSimpleCardioOption },
              });

              setSelectedPreset(preset.name);
            }}
          />
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {children}
          <div className="flex flex-col md:flex-row md:justify-end gap-2 py-1">
            <CustomButton
              className="font-bold w-auto sm:w-fit"
              variant="default"
              onClick={() => setOpenPresetModal(true)}
              title="שמור תוכנית אימון כתבנית"
              disabled={updateWorkoutPlan.isPending || addWorkoutPlan.isPending}
              isLoading={addWorkoutPlanPreset.isPending}
            />
            <CustomButton
              className="w-full sm:w-32"
              variant="success"
              type="submit"
              title="שמור תוכנית אימון"
              disabled={addWorkoutPlanPreset.isPending}
              isLoading={updateWorkoutPlan.isPending || addWorkoutPlan.isPending}
            />
          </div>
        </form>
      </div>
      <InputModal
        onClose={() => setOpenPresetModal(false)}
        open={openPresetModal}
        onSubmit={(val) => handleAddPreset(val)}
      />
    </Form>
  );
};

export default NewWorkoutPlan;
