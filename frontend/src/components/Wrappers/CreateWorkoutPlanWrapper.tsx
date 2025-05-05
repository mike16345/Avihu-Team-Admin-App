import { useForm } from "react-hook-form";
import {
  fullWorkoutPlanSchema,
  workoutPresetSchema,
  WorkoutSchemaType,
} from "@/schemas/workoutPlanSchema";
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
import { convertItemsToOptions, getNestedError, getZodErrorIssues } from "@/lib/utils";
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
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";

const calculateMinPerWorkout = (workout: WorkoutSchemaType) => {
  let workoutPlan = workout;
  if (workoutPlan.cardio.type == "complex") return workoutPlan;
  const cardioPlan = workoutPlan.cardio.plan as ISimpleCardioType;

  const minsPerWorkout = cardioPlan.minsPerWeek / cardioPlan.timesPerWeek;

  workoutPlan = {
    ...workoutPlan,
    cardio: {
      type: workoutPlan.cardio.type,
      plan: {
        ...cardioPlan,
        minsPerWorkout,
      },
    },
  };

  return workoutPlan;
};

const CreateWorkoutPlanWrapper = ({ children }: { children: React.ReactNode }) => {
  const form = useForm<WorkoutSchemaType>({
    resolver: zodResolver(fullWorkoutPlanSchema),
    defaultValues: {
      tips: [],
      cardio: { type: "simple", plan: defaultSimpleCardioOption },
      workoutPlans: [],
    },
  });
  const {
    formState: { isDirty },
    reset,
  } = form;
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
    if (!id) return Promise.reject("User ID is required!");
    const workoutPlan = calculateMinPerWorkout(values);
    const cleanedPostObject = cleanWorkoutObject(workoutPlan);

    if (!data) {
      return addWorkoutPlan.mutate({ id, workoutPlan: cleanedPostObject });
    } else {
      return updateWorkoutPlan.mutate({ id, cleanedWorkoutPlan: cleanedPostObject });
    }
  };

  const handleAddPreset = (name: string) => {
    const workoutPlan = calculateMinPerWorkout(form.getValues());
    const preset = cleanWorkoutObject(
      {
        ...workoutPlan,
        name,
      },
      "userId"
    );
    const { error } = workoutPresetSchema.safeParse(preset);
    const nestedError = error ? getZodErrorIssues(error?.issues)[0] : null;
    if (nestedError)
      return toast.error(nestedError?.title, { description: nestedError?.description });

    addWorkoutPlanPreset.mutate(preset);
  };

  const handleFindUser = () => {
    const user = users.find((user) => user._id === id);

    if (!user) {
      setIsNoUserWithId(true);
      return;
    }

    return user;
  };

  const onInvalidSubmit = (e: any) => {
    const errorMessage = getNestedError(e);

    toast.error(errorMessage?.title, { description: errorMessage?.description });
  };

  const user = useMemo(handleFindUser, [id]) || userQuery.data;

  useEffect(() => {
    if (!data) return;

    reset(data.data);
  }, [data]);

  useUnsavedChangesWarning(isDirty);

  return (
    <Form {...form}>
      <div className="flex flex-col gap-4 w-full">
        <div className="space-y-2">
          <h1 className="text-4xl">תוכנית אימון</h1>
          <BackButton navLink={MainRoutes.USERS + `/${id}?tab=${weightTab}`} />

          {user && <BasicUserDetails user={user} />}
          <div className="sm:w-fit sm:min-w-40">
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
        </div>
        <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}>
          <div className="flex flex-col md:flex-row md:justify-end gap-2 py-1">
            <CustomButton
              className="font-bold w-auto sm:w-fit"
              variant="default"
              type="button"
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
          {children}
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

export default CreateWorkoutPlanWrapper;
