import React, { Fragment, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  ICardioPlan,
  ICompleteWorkoutPlan,
  IMuscleGroupWorkouts,
  IWorkoutPlan,
  IWorkoutPlanPreset,
} from "@/interfaces/IWorkoutPlan";
import WorkoutPlanContainer from "./WorkoutPlanContainer";
import { useWorkoutPlanApi } from "@/hooks/api/useWorkoutPlanApi";
import { cleanWorkoutObject, parseErrorFromObject } from "@/utils/workoutPlanUtils";
import { Button } from "../ui/button";
import { BsFillPencilFill } from "react-icons/bs";
import { BsPlusCircleFill } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner";
import { useWorkoutPlanPresetApi } from "@/hooks/api/useWorkoutPlanPresetsApi";
import { useIsEditableContext } from "@/context/useIsEditableContext";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import Loader from "../ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { convertItemsToOptions, createRetryFunction } from "@/lib/utils";
import CustomButton from "../ui/CustomButton";
import ComboBox from "../ui/combo-box";
import WorkoutPlanContainerWrapper from "../Wrappers/WorkoutPlanContainerWrapper";
import { QueryKeys } from "@/enums/QueryKeys";
import { MainRoutes } from "@/enums/Routes";
import BackButton from "../ui/BackButton";
import TipAdder from "../ui/TipAdder";
import BasicUserDetails from "../UserDashboard/UserInfo/BasicUserDetails";
import { useUsersStore } from "@/store/userStore";
import { IUser } from "@/interfaces/IUser";
import { useUsersApi } from "@/hooks/api/useUsersApi";
import { weightTab } from "@/pages/UserDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CardioWrapper from "./cardio/CardioWrapper";
import { defaultSimpleCardioOption } from "@/constants/cardioOptions";

const defaultCardioPlan: ICardioPlan = {
  type: `simple`,
  plan: defaultSimpleCardioOption,
};

const CreateWorkoutPlan: React.FC = () => {
  const { id } = useParams();
  const navigation = useNavigate();
  const queryClient = useQueryClient();

  const [user, setUser] = useState<IUser>();

  const { users } = useUsersStore();

  const { getUser } = useUsersApi();
  const { addWorkoutPlan, getWorkoutPlanByUserId, updateWorkoutPlanByUserId } = useWorkoutPlanApi();
  const { getAllWorkoutPlanPresets } = useWorkoutPlanPresetApi();
  const { isEditable, setIsEditable, toggleIsEditable } = useIsEditableContext();

  const [selectedPreset, setSelectedPreset] = useState<IWorkoutPlanPreset | null>(null);
  const [isCreate, setIsCreate] = useState(true);
  const [workoutPlan, setWorkoutPlan] = useState<IWorkoutPlan[]>([]);
  const [workoutTips, setWorkoutTips] = useState<string[]>([]);
  const [cardioPlan, setCardioPlan] = useState<ICardioPlan>(defaultCardioPlan);

  const handleGetWorkoutPlan = async () => {
    try {
      const plan = await getWorkoutPlanByUserId(id || ``);
      if (plan.data && workoutPlan.length == 0) {
        setWorkoutPlan(plan.data.workoutPlans);
        setWorkoutTips(plan.data.tips || []);
        setCardioPlan(plan.data.cardio || defaultCardioPlan);
        setIsCreate(false);
        setIsEditable(false);
      }

      return plan;
    } catch (err: any) {
      throw err;
    }
  };

  const { isError, error, isLoading, data } = useQuery({
    queryFn: handleGetWorkoutPlan,
    staleTime: FULL_DAY_STALE_TIME,
    queryKey: [QueryKeys.USER_WORKOUT_PLAN + `${id}`],
    enabled: !!id,
    retry: createRetryFunction(404),
  });

  const workoutPlanPresets = useQuery({
    queryFn: getAllWorkoutPlanPresets,
    staleTime: FULL_DAY_STALE_TIME,
    enabled: isEditable,
    queryKey: [QueryKeys.WORKOUT_PRESETS],
  });

  const workoutPresetsOptions = useMemo(
    () => convertItemsToOptions(workoutPlanPresets.data?.data || [], "name"),
    [workoutPlanPresets.data]
  );

  const handleSubmit = async () => {
    if (!id) return Promise.reject();

    const postObject: ICompleteWorkoutPlan = {
      workoutPlans: [...workoutPlan],
      tips: workoutTips,
      cardio: cardioPlan,
    };

    const cleanedPostObject = cleanWorkoutObject(postObject);

    if (isCreate) {
      return addWorkoutPlan(id, cleanedPostObject);
    } else {
      return updateWorkoutPlanByUserId(id, cleanedPostObject);
    }
  };

  const onSuccess = () => {
    toast.success(`תכנית אימון נשמרה בהצלחה!`);
    navigation(MainRoutes.USERS + `/${id}?tab=${weightTab}`);
    queryClient.invalidateQueries({ queryKey: [`${QueryKeys.USER_WORKOUT_PLAN}${id}`] });
    queryClient.invalidateQueries({ queryKey: [`${QueryKeys.NO_WORKOUT_PLAN}`] });
  };

  const onError = (error: any) => {
    const message = parseErrorFromObject(error.data || "");

    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: message,
    });
  };

  const updateWorkoutPlan = useMutation({
    mutationFn: handleSubmit,
    onSuccess,
    onError,
  });

  const handlePlanNameChange = (newName: string, index: number) => {
    const newWorkoutPlan = workoutPlan.map((workout, i) =>
      i == index ? { ...workout, planName: newName } : workout
    );

    setWorkoutPlan(newWorkoutPlan);
  };

  const handleAddWorkout = () => {
    const newObject: IWorkoutPlan = {
      planName: `אימון ${workoutPlan.length + 1}`,
      muscleGroups: [],
    };

    setWorkoutPlan([...workoutPlan, newObject]);
  };

  const handleDeleteWorkout = (index: number) => {
    const filteredArr = workoutPlan.filter((_, i) => i !== index);

    setWorkoutPlan(filteredArr);
  };

  const handleSave = (index: number, workouts: IMuscleGroupWorkouts[]) => {
    setWorkoutPlan((prevWorkoutPlan) => {
      const workoutExists = prevWorkoutPlan[index];

      if (workoutExists) {
        return prevWorkoutPlan.map((workout, i) =>
          i === index ? { ...workout, muscleGroups: workouts } : workout
        );
      } else {
        return [
          ...prevWorkoutPlan,
          { planName: `אימון ${workoutPlan.length + 1}`, muscleGroups: workouts },
        ];
      }
    });
  };

  const handleSaveTip = (tips: string[]) => {
    setWorkoutTips(tips);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const user = users.find((user) => user._id === id) || (await getUser(id || ""));
      setUser(user);
    };

    fetchUser();
  }, []);

  useLayoutEffect(() => {
    if (data) {
      setWorkoutPlan(data.data.workoutPlans);
      setWorkoutTips(data.data.tips || []);
      setCardioPlan(data.data.cardio || defaultCardioPlan);
      setIsCreate(false);
      setIsEditable(false);
    }
  }, []);

  if (isLoading) return <Loader size="large" />;
  if (isError && error?.data?.message !== `Workout plan not found!`)
    return <ErrorPage message={error.message} />;

  return (
    <div className="flex flex-col gap-4 p-4 h-full ">
      <div className=" w-full flex justify-between items-center">
        <h1 className="text-4xl">תוכנית אימון</h1>

        <BackButton navLink={MainRoutes.USERS + `/${id}?tab=${weightTab}`} />
        <Toggle
          onClick={() => toggleIsEditable()}
          className="px-3 rounded cursor-pointer absolute top-5 left-32"
        >
          <BsFillPencilFill />
        </Toggle>
      </div>
      <p>
        {isEditable
          ? `כאן תוכל לערוך תוכנית אימון קיימת ללקוח שלך`
          : `כאן תוכל לצפות בתוכנית האימון הקיימת של לקוח זה`}
      </p>
      {user && <BasicUserDetails user={user} />}
      <div className="flex flex-col gap-4 border-b-2">
        <div className="sm:w-1/4">
          {isEditable && (
            <ComboBox
              value={selectedPreset}
              options={workoutPresetsOptions}
              onSelect={(currentValue) => {
                setWorkoutPlan(currentValue.workoutPlans);
                setSelectedPreset(currentValue.name);
                if (currentValue.cardio) {
                  setCardioPlan(currentValue.cardio);
                }
              }}
            />
          )}
        </div>
        <Tabs defaultValue="workout" className="" dir="rtl">
          <TabsList>
            <TabsTrigger value="workout">אימונים</TabsTrigger>
            <TabsTrigger value="cardio">אירובי</TabsTrigger>
          </TabsList>
          <TabsContent value="cardio">
            <CardioWrapper
              cardioPlan={cardioPlan}
              updateCardio={(cardioObject) => setCardioPlan(cardioObject)}
            />
          </TabsContent>

          <TabsContent value="workout">
            <div className="flex flex-col-reverse md:flex-row justify-between gap-8">
              <div className="flex flex-col w-full">
                {workoutPlan.map((workout, i) => {
                  return (
                    <Fragment key={workout?._id || i}>
                      <WorkoutPlanContainerWrapper workoutPlan={workout}>
                        <WorkoutPlanContainer
                          initialMuscleGroups={workout.muscleGroups}
                          handleSave={(muscleGroups) => {
                            handleSave(i, muscleGroups);
                          }}
                          title={workout.planName}
                          handlePlanNameChange={(newName) => handlePlanNameChange(newName, i)}
                          handleDeleteWorkout={() => handleDeleteWorkout(i)}
                        />
                      </WorkoutPlanContainerWrapper>
                    </Fragment>
                  );
                })}
              </div>

              <TipAdder tips={workoutTips} saveTips={handleSaveTip} isEditable={isEditable} />
            </div>
            <div className="w-full flex items-center justify-center mb-2">
              {isEditable && (
                <Button className="w-full sm:w-32" onClick={handleAddWorkout}>
                  <div className="flex flex-col items-center font-bold">
                    הוסף אימון
                    <BsPlusCircleFill />
                  </div>
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {isEditable && (
        <div className="flex justify-end">
          <CustomButton
            className="w-full sm:w-32"
            variant="success"
            onClick={() => updateWorkoutPlan.mutate()}
            title="שמור תוכנית אימון"
            isLoading={updateWorkoutPlan.isPending}
          />
        </div>
      )}
    </div>
  );
};

export default CreateWorkoutPlan;
