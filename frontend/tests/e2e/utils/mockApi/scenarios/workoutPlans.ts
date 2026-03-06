import { apiRoute, type MockScenarioMap } from "../routes";

const WORKOUT_PLAN_USER_PATH = "/workoutPlans/user";

export const workoutPlansScenarios = {
  "workout-plans.user.empty": [
    apiRoute({
      method: "GET",
      pathname: WORKOUT_PLAN_USER_PATH,
      data: {
        userId: "user-created-001",
        workoutPlans: [],
        cardio: {
          type: "simple",
          plan: {
            minsPerWeek: 0,
            timesPerWeek: 0,
          },
        },
      },
      message: "No workout plan",
    }),
  ],
} satisfies MockScenarioMap;
