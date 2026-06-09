/**
 * WorkoutsTemplatePage — admin "תבניות אימון" page.
 *
 * Visual refresh ONLY. The data contract is untouched:
 *  - Tab values, query keys, sheet form names, delete mutations: identical
 *  - IWorkoutPlanPreset / IExercise / etc. schemas: identical
 *  - Routes /presets/workoutPlans/:id: identical
 *
 * The mobile Client-App consumes the same preset data — DO NOT
 * rename any field, value, or endpoint.
 */
import TemplateTabs from "@/components/templates/TemplateTabs";
import { ITabs } from "@/interfaces/interfaces";
import { QueryKeys } from "@/enums/QueryKeys";
import useDeleteWorkoutPreset from "@/hooks/mutations/workouts/useDeleteWorkoutPlanPreset";
import useDeleteExercise from "@/hooks/mutations/exercise/useDeleteExercise";
import useDeleteExerciseMethod from "@/hooks/mutations/exerciseMethod/useDeleteExerciseMethod";
import useDeleteCardioWorkout from "@/hooks/mutations/cardioWorkout/useDeleteCardioWorkout";
import { FaDumbbell } from "react-icons/fa6";

const WorkoutsTemplatePage = () => {
  const deleteWorkoutPreset = useDeleteWorkoutPreset();
  const deleteExistingExercise = useDeleteExercise();
  const deleteExistingExerciseMethod = useDeleteExerciseMethod();
  const deleteCardioWorkout = useDeleteCardioWorkout();

  // Data contract — DO NOT CHANGE values, queryKeys, or sheetForm names.
  const tabs: ITabs = {
    tabHeaders: [
      { name: `תבניות אימונים`, value: `WorkoutPlans`, queryKey: QueryKeys.WORKOUT_PRESETS },
      { name: `תרגילים`, value: `exercises`, queryKey: QueryKeys.EXERCISES },
      { name: `שיטות אימון`, value: `exercisesMethods`, queryKey: QueryKeys.EXERCISE_METHODS },
      { name: `אירובי`, value: `cardioWorkouts`, queryKey: QueryKeys.CARDIO_WORKOUT_PRESET },
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
    <div
      data-testid="workout-templates-page"
      dir="rtl"
      className="flex flex-col gap-5 px-1"
      style={{ fontFamily: "Assistant, Heebo, system-ui, sans-serif" }}
    >
      {/* Hero header — matches the forms page (FormPresetsPage) so the
          two library areas read as siblings. Gradient blob + brand-icon
          + title + subtitle. */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100/60 bg-white shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
        <div className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full bg-blue-100/60 dark:bg-blue-950/30 blur-3xl" />
        <div className="relative flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl brand-gradient text-white shadow-md shadow-blue-500/25">
            <FaDumbbell size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">תבניות אימון</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              ניהול תבניות אימון, תרגילים, שיטות אימון ותרגילי אירובי
            </p>
          </div>
        </div>
      </div>

      <TemplateTabs tabs={tabs} />
    </div>
  );
};

export default WorkoutsTemplatePage;
