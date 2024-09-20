import React, { Fragment, useState } from "react";
import {
  ICompleteWorkoutPlan,
  IMuscleGroupWorkouts,
  IWorkoutPlan,
  IWorkoutPlanPreset,
} from "@/interfaces/IWorkoutPlan";
import WorkoutPlanContainer from "./WorkoutPlanContainer";
import { useWorkoutPlanApi } from "@/hooks/api/useWorkoutPlanApi";
import { cleanWorkoutObject } from "@/utils/workoutPlanUtils";
import { Button } from "../ui/button";
import { BsFillPencilFill } from "react-icons/bs";
import { BsPlusCircleFill } from "react-icons/bs";
import { useParams } from "react-router-dom";
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

const CreateWorkoutPlan: React.FC = () => {
  const { id } = useParams();
  const { addWorkoutPlan, getWorkoutPlanByUserId, updateWorkoutPlanByUserId } = useWorkoutPlanApi();
  const { getAllWorkoutPlanPresets } = useWorkoutPlanPresetApi();
  const { isEditable, setIsEditable, toggleIsEditable } = useIsEditableContext();
  const [selectedPreset, setSelectedPreset] = useState<IWorkoutPlanPreset | null>(null);

  const existingWorkoutPlan = useQuery({
    queryFn: () => getWorkoutPlanByUserId(id || ``),
    staleTime: FULL_DAY_STALE_TIME,
    queryKey: [id],
    enabled: !!id,
    retry: createRetryFunction(404),
  });

  const workoutPlanPresets = useQuery({
    queryFn: () => getAllWorkoutPlanPresets().then((res) => res.data),
    staleTime: FULL_DAY_STALE_TIME,
    enabled: isEditable,
    queryKey: [QueryKeys.WORKOUT_PRESETS],
  });

  const queryClient = useQueryClient();

  const updateWorkoutPlan = useMutation({
    mutationFn: ({
      id,
      cleanedPostObject,
    }: {
      id: string;
      cleanedPostObject: ICompleteWorkoutPlan;
    }) => updateWorkoutPlanByUserId(id, cleanedPostObject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [id] });
    },
  });

  const [isCreate, setIsCreate] = useState(true);
  const [workoutPlan, setWorkoutPlan] = useState<IWorkoutPlan[]>([]);

  if (existingWorkoutPlan.data?.data && workoutPlan.length == 0) {
    setWorkoutPlan(existingWorkoutPlan.data.data.workoutPlans);
    setIsCreate(false);
    setIsEditable(false);
  }

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

  const handleSubmit = async () => {
    if (!id) return;

    const postObject: ICompleteWorkoutPlan = {
      workoutPlans: [...workoutPlan],
    };

    const cleanedPostObject = cleanWorkoutObject(postObject);

    if (isCreate) {
      addWorkoutPlan(id, cleanedPostObject)
        .then(() => toast.success(`תוכנית אימון נשמרה בהצלחה!`))
        .catch((err) =>
          toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
            description: `${err?.data?.message || ""}`,
          })
        );
    } else {
      updateWorkoutPlan.mutate({ id, cleanedPostObject });
      if (updateWorkoutPlan.isError) {
        return toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
          description: updateWorkoutPlan.error.message,
        });
      }
      toast.success(`תוכנית אימון נשמרה בהצלחה!`);
    }
  };

  if (existingWorkoutPlan.isLoading) return <Loader size="large" />;
  if (
    existingWorkoutPlan.isError &&
    existingWorkoutPlan.error?.data?.message !== `Workout plan not found!`
  )
    return <ErrorPage message={existingWorkoutPlan.error.message} />;

  const workoutPresetsOptions = convertItemsToOptions(workoutPlanPresets.data || [], "name");

  return (
    <>
      <div className="flex flex-col gap-4 px-20 py-4   w-full ">
        <div className=" w-full flex justify-between items-center">
          <h1 className="text-4xl">תוכנית אימון</h1>
          <Toggle onClick={() => toggleIsEditable()} className="px-3 rounded cursor-pointer ">
            <BsFillPencilFill />
          </Toggle>
        </div>
        <p>
          {isEditable
            ? `כאן תוכל לערוך תוכנית אימון קיימת ללקוח שלך`
            : `כאן תוכל לצפות בתוכנית האימון הקיימת של לקוח זה`}
        </p>
        <div className="flex flex-col gap-4">
          <div className="w-1/4">
            {isEditable && (
              <ComboBox
                value={selectedPreset}
                options={workoutPresetsOptions}
                onSelect={(currentValue) => {
                  setWorkoutPlan(currentValue.workoutPlans);
                  setSelectedPreset(currentValue.name);
                }}
              />
            )}
          </div>

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
          <div className="w-full flex items-center justify-center">
            {isEditable && (
              <Button onClick={handleAddWorkout}>
                <div className="flex flex-col items-center font-bold">
                  הוסף אימון
                  <BsPlusCircleFill />
                </div>
              </Button>
            )}
          </div>
        </div>
        {isEditable && (
          <div className="flex justify-end">
            <CustomButton
              variant="success"
              onClick={handleSubmit}
              title="שמור תוכנית אימון"
              isLoading={updateWorkoutPlan.isPending}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default CreateWorkoutPlan;
