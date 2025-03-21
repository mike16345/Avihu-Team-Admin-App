export enum MainRoutes {
  HOME = "/",
  DIET_PLANS = "/dietPlans",
  DIET_PLAN = "/diet-plans/:id",
  USERS = "/users",
  USER_FORM = "/users/add",
  WORKOUT_PLANS_PRESETS = "/workoutPlans",
  DIET_PLANS_PRESETS = "/dietPlans",
  USER_WORKOUT_PLAN = "/workout-plans",
  PRESETS = "/presets",
}

export enum PresetRoutes {
  DIET_PLANS = MainRoutes.PRESETS + "/dietPlans",
  WORKOUT_PLANS = MainRoutes.PRESETS + "/workoutPlans",
}
