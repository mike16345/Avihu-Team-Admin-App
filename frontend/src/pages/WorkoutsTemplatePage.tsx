import TemplateTabs from "@/components/templates/TemplateTabs";
import useExercisePresetApi from "@/hooks/api/useExercisePresetApi";
import useMuscleGroupsApi from "@/hooks/api/useMuscleGroupsApi";
import { useWorkoutPlanPresetApi } from "@/hooks/api/useWorkoutPlanPresetsApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ITabs } from "@/interfaces/interfaces";
import { QueryKeys } from "@/enums/QueryKeys";
import useExerciseMethodApi from "@/hooks/api/useExerciseMethodsApi";

const WorkoutsTemplatePage = () => {
  const { deleteExercise } = useExercisePresetApi();
  const { deleteWorkoutPlanPreset } = useWorkoutPlanPresetApi();
  const { deleteMuscleGroup } = useMuscleGroupsApi();
  const { deleteExerciseMethod } = useExerciseMethodApi();

  const queryClient = useQueryClient();

  const deleteWorkoutPreset = useMutation({
    mutationFn: deleteWorkoutPlanPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.WORKOUT_PRESETS] });
    },
  });

  const deleteExistingMuscleGroup = useMutation({
    mutationFn: deleteMuscleGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MUSCLE_GROUP] });
    },
  });

  const deleteExistingExercise = useMutation({
    mutationFn: deleteExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXERCISES] });
    },
  });

  const deleteExistingExerciseMethod = useMutation({
    mutationFn: deleteExerciseMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXERCISE_METHODS] });
    },
  });

  const tabs: ITabs = {
    tabHeaders: [
      {
        name: `תבניות אימונים`,
        value: `WorkoutPlans`,
        queryKey: QueryKeys.WORKOUT_PRESETS,
      },
      {
        name: `קבוצות שריר`,
        value: `muscleGroups`,
        queryKey: QueryKeys.MUSCLE_GROUP,
      },
      {
        name: `תרגילים`,
        value: `exercises`,
        queryKey: QueryKeys.EXERCISES,
      },
      {
        name: `שיטות אימון`,
        value: `exercisesMethods`,
        queryKey: QueryKeys.EXERCISE_METHODS,
      },
    ],
    tabContent: [
      {
        value: `WorkoutPlans`,
        btnPrompt: `הוסף תבנית`,
        sheetForm: `workoutPlan`,
        deleteFunc: deleteWorkoutPreset,
      },
      {
        value: `muscleGroups`,
        btnPrompt: `הוסף קבוצת שריר`,
        sheetForm: `muscleGroup`,
        deleteFunc: deleteExistingMuscleGroup,
      },
      {
        value: `exercises`,
        btnPrompt: `הוסף תרגיל`,
        sheetForm: `Exercise`,
        deleteFunc: deleteExistingExercise,
      },
      {
        value: `exercisesMethods`,
        btnPrompt: `הוסף שיטת אימון`,
        sheetForm: `exercisesMethods`,
        deleteFunc: deleteExistingExerciseMethod,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-3 ">
      <h1 className="text-2xl text-center sm:text-right ">תבניות אימון</h1>
      <TemplateTabs tabs={tabs} />
    </div>
  );
};

export default WorkoutsTemplatePage;
