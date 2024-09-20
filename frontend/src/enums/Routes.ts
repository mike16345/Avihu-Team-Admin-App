export enum MainRoutes {
  HOME = "/",
  DIET_PLAN = "/diet-plans/:id",
  USERS = "/users",
  USER_FORM = "/users/add",
  WORKOUT_PLANS = "/workoutPlans",
  PRESETS = "/presets",
}

export enum PresetRoutes {
  DIET_PLANS = MainRoutes.PRESETS + "/dietPlans/",
}
