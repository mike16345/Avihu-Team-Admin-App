import TemplateTabs from "@/components/templates/TemplateTabs";
import { ITabs } from "@/interfaces/interfaces";
import { QueryKeys } from "@/enums/QueryKeys";
import useDeleteWorkoutPreset from "@/hooks/mutations/workouts/useDeleteWorkoutPlanPreset";
import useDeleteExercise from "@/hooks/mutations/exercise/useDeleteExercise";
import useDeleteExerciseMethod from "@/hooks/mutations/exerciseMethod/useDeleteExerciseMethod";
import useDeleteCardioWorkout from "@/hooks/mutations/cardioWorkout/useDeleteCardioWorkout";

const WorkoutsTemplatePage = () => {
  const deleteWorkoutPreset = useDeleteWorkoutPreset();
  const deleteExistingExercise = useDeleteExercise();
  const deleteExistingExerciseMethod = useDeleteExerciseMethod();
  const deleteCardioWorkout = useDeleteCardioWorkout();

  const tabs: ITabs = {
    tabHeaders: [
      {
        name: `תבניות אימונים`,
        value: `WorkoutPlans`,
        queryKey: QueryKeys.WORKOUT_PRESETS,
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
      {
        name: `אירובי`,
        value: `cardioWorkouts`,
        queryKey: QueryKeys.CARDIO_WORKOUT_PRESET,
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
      {
        value: `cardioWorkouts`,
        btnPrompt: `הוסף תרגיל`,
        sheetForm: `cardioWorkouts`,
        deleteFunc: deleteCardioWorkout,
      },
    ],
  };

  return (
    <div data-testid="workout-templates-page" className="flex flex-col gap-3 ">
      <h1 className="text-2xl text-center sm:text-right ">תבניות אימון</h1>
      <TemplateTabs tabs={tabs} />
    </div>
  );
};

export default WorkoutsTemplatePage;
