export enum QueryKeys {
  WORKOUT_PRESETS = "workoutPlanPresets",
  USER_WORKOUT_PLAN = "workout-plan-", // QueryKeys.USER_WORKOUT_PLAN + `${userId}`
  USER_DIET_PLAN = "diet-plans-", // QueryKeys.USER_DIET_PLAN + `${userId}`
  DIET_PLAN_PRESETS = "diet-plan-presets",
  WEIGH_INS = "weigh-ins-", // QueryKeys.WEIGH_INS + userId
  RECORDED_WORKOUTS = "recored-workouts-", // QueryKeys.RECORDED_WORKOUTS + userId
}
