export enum QueryKeys {
  WORKOUT_PRESETS = "workoutPlanPresets",
  USER_WORKOUT_PLAN = "workout-plan-", // QueryKeys.USER_WORKOUT_PLAN + `${userId}`
  USER_DIET_PLAN = "diet-plans-", // QueryKeys.USER_DIET_PLAN + `${userId}`
  DIET_PLAN_PRESETS = "diet-plan-presets",
  EXERCISE_METHODS = "exercise-methods-",
  WEIGH_INS = "weigh-ins-", // QueryKeys.WEIGH_INS + userId
  RECORDED_WORKOUTS = "recored-workouts-", // QueryKeys.RECORDED_WORKOUTS + userId
  BLOGS = "blogs-", // QueryKeys.BLOGS + blogId
  EXPIRING_USERS = "expiringUsers", // QueryKeys.EXPIRING_USERS +
  NO_DIET_PLAN = "no-diet-plan", // QueryKeys.NO_DIET_PLAN +
  NO_WORKOUT_PLAN = "no-workout-plan", // QueryKeys.NO_WORKOUT_PLAN +
  MENU_ITEMS = "menu-items-", //add foodgroup or id here
  EXERCISES = "exercises-", //add  id here
  MUSCLE_GROUP = "muscle-group-", //add  id here
}
