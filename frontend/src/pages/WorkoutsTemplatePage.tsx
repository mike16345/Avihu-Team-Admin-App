import TemplateTabs from "@/components/templates/TemplateTabs";
import TemplateTabsSkeleton from "@/components/ui/skeletons/TemplateTabsSkeleton";
import useExercisePresetApi from "@/hooks/api/useExercisePresetApi";
import useMuscleGroupsApi from "@/hooks/api/useMuscleGroupsApi";
import { useWorkoutPlanPresetApi } from "@/hooks/api/useWorkoutPlanPresetsApi";
import {
  IExercisePresetItem,
  IMuscleGroupItem,
  IWorkoutPlanPreset,
} from "@/interfaces/IWorkoutPlan";
import React, { useEffect, useState } from "react";
import ErrorPage from "./ErrorPage";
import { useQuery } from "@tanstack/react-query";
import { ITabs } from "@/interfaces/interfaces";

const WorkoutsTemplatePage = () => {
  const { getExercisePresets, deleteExercise } = useExercisePresetApi();
  const { getAllWorkoutPlanPresets, deleteWorkoutPlanPreset } = useWorkoutPlanPresetApi();
  const { getAllMuscleGroups, deleteMuscleGroup } = useMuscleGroupsApi();

  const [workoutPlanPresets, setWorkoutPlanPresets] = useState<IWorkoutPlanPreset[]>([]);
  const muscleGroups = useQuery({
    queryKey: ["muscleGroups"],
    staleTime: 30,
    queryFn: getAllMuscleGroups,
  });
  const [muscleGroupPresets, setMuscleGroupPresets] = useState<IMuscleGroupItem[]>([]);
  const [exercisePresets, setExercisePresets] = useState<IExercisePresetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log(muscleGroups.data?.data);

  const tabs: ITabs = {
    tabHeaders: [
      /*  {
        name: `תבניות אימונים`,
        value: `WorkoutPlans`,
      }, */
      {
        name: `קבוצות שריר`,
        value: `muscleGroups`,
      },
      /* {
        name: `תרגילים`,
        value: `exercises`,
      }, */
    ],
    tabContent: [
      /* {
        value: `WorkoutPlans`,
        btnPrompt: `הוסף תבנית`,
        state: workoutPlanPresets,
        setState: setWorkoutPlanPresets,
        sheetForm: `workoutPlan`,
        deleteFunc: deleteWorkoutPlanPreset,
      }, */
      {
        value: `muscleGroups`,
        btnPrompt: `הוסף קבוצת שריר`,
        state: muscleGroups.data?.data,
        setState: setMuscleGroupPresets,
        sheetForm: `muscleGroup`,
        deleteFunc: deleteMuscleGroup,
      },
      /* {
        value: `exercises`,
        btnPrompt: `הוסף תרגיל`,
        state: exercisePresets,
        setState: setExercisePresets,
        sheetForm: `Exercise`,
        deleteFunc: deleteExercise,
      }, */
    ],
  };

  useEffect(() => {
    /* setIsLoading(true); */
    /*   getExercisePresets()
      .then((res) => setExercisePresets(res))
      .catch((err) => setError(err));

    getAllWorkoutPlanPresets()
      .then((res) => setWorkoutPlanPresets(res))
      .catch((err) => setError(err));
 */
    /*  getAllMuscleGroups()
      .then((res) => setMuscleGroupPresets(res.data))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false)); */
    /*   setTimeout(() => {
      
    }, 1000); */
  }, []);

  if (muscleGroups.isLoading) return <TemplateTabsSkeleton />;
  if (muscleGroups.error) return <ErrorPage message={muscleGroups.error.message} />;

  return (
    <>
      <div>
        <h1 className="text-2xl pb-5">תבניות אימון</h1>
        <TemplateTabs tabs={tabs} />
      </div>
    </>
  );
};

export default WorkoutsTemplatePage;
