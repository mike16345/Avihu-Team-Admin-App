import TemplateTabs from "@/components/templates/TemplateTabs";
import TemplateTabsSkeleton from "@/components/ui/skeletons/TemplateTabsSkeleton";
import useExercisePresetApi from "@/hooks/api/useExercisePresetApi";
import useMuscleGroupsApi from "@/hooks/api/useMuscleGroupsApi";
import { useWorkoutPlanPresetApi } from "@/hooks/api/useWorkoutPlanPresetsApi";
import { IExercisePresetItem, IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";
import React, { useEffect, useState } from "react";
import ErrorPage from "./ErrorPage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ITabs } from "@/interfaces/interfaces";

const WorkoutsTemplatePage = () => {
  /* const { getExercisePresets, deleteExercise } = useExercisePresetApi();
  const { getAllWorkoutPlanPresets, deleteWorkoutPlanPreset } = useWorkoutPlanPresetApi(); */
  const { getAllMuscleGroups, deleteMuscleGroup } = useMuscleGroupsApi();

  const muscleGroups = useQuery({
    queryKey: ["muscleGroups"],
    staleTime: Infinity,
    queryFn: getAllMuscleGroups,
  });

  const queryClient = useQueryClient();

  const deleteExistingMuscleGroup = useMutation({
    mutationFn: deleteMuscleGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`muscleGroups`] });
    },
  });
  const [exercisePresets, setExercisePresets] = useState<IExercisePresetItem[]>([]);
  const [workoutPlanPresets, setWorkoutPlanPresets] = useState<IWorkoutPlanPreset[]>([]);

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
        sheetForm: `muscleGroup`,
        deleteFunc: deleteExistingMuscleGroup,
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
