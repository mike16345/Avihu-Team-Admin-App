import { WorkoutPlan } from "@/enums/WorkoutPlans";

const workoutPlanNames = {
  [WorkoutPlan.WorkoutABeginner]: "Workout A - Beginner",
  [WorkoutPlan.WorkoutAAdvanced]: "Workout A - Advanced",
  [WorkoutPlan.WorkoutAPro]: "Workout A - Pro",
  [WorkoutPlan.WorkoutBBeginner]: "Workout B - Beginner",
  [WorkoutPlan.WorkoutBAdvanced]: "Workout B - Advanced",
  [WorkoutPlan.WorkoutBPro]: "Workout B - Pro",
  [WorkoutPlan.WorkoutCBeginner]: "Workout C - Beginner",
  [WorkoutPlan.WorkoutCAdvanced]: "Workout C - Advanced",
  [WorkoutPlan.WorkoutCPro]: "Workout C - Pro",
};

export function getWorkoutPlanName(plan: WorkoutPlan): string {
  return workoutPlanNames[plan] || "";
}

export function poundsToKg(pounds: number) {
  const conversionFactor = 0.453592;
  const kilograms = pounds * conversionFactor;

  return kilograms.toFixed(2);
}
