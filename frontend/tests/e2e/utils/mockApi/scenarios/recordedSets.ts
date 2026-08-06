import { apiRoute, type MockScenarioMap } from "../routes";

const RECORDED_SETS_USER_PATH = "/recordedSets/user";

export const recordedSetsScenarios = {
  "recorded-sets.user.empty": [
    apiRoute({
      method: "GET",
      pathname: RECORDED_SETS_USER_PATH,
      data: [],
      message: "No recorded sets",
    }),
  ],
  "recorded-sets.user.rir": [
    apiRoute({
      method: "GET",
      pathname: RECORDED_SETS_USER_PATH,
      data: [
        {
          userId: "user-admin-001",
          muscleGroup: "חזה",
          recordedSets: {
            "לחיצת חזה": [
              {
                plan: "אימון A",
                weight: 80,
                repsDone: 8,
                setNumber: 1,
                date: "2026-07-01T10:00:00.000Z",
                note: "",
                rir: 2,
              },
              {
                plan: "אימון A",
                weight: 85,
                repsDone: 6,
                setNumber: 1,
                date: "2026-07-15T10:00:00.000Z",
                note: "",
                rir: 0,
              },
              {
                plan: "אימון A",
                weight: 87.5,
                repsDone: 5,
                setNumber: 1,
                date: "2026-07-20T10:00:00.000Z",
                note: "",
              },
              {
                plan: "אימון A",
                weight: 90,
                repsDone: 4,
                setNumber: 1,
                date: "2026-08-01T10:00:00.000Z",
                note: "",
                rir: 1,
              },
              {
                plan: "אימון A",
                weight: 85,
                repsDone: 6,
                setNumber: 2,
                date: "2026-08-01T10:00:00.000Z",
                note: "",
                rir: 0,
              },
              {
                plan: "אימון A",
                weight: 80,
                repsDone: 8,
                setNumber: 3,
                date: "2026-08-01T10:00:00.000Z",
                note: "",
              },
            ],
          },
        },
      ],
      message: "Recorded sets loaded",
    }),
    apiRoute({
      method: "GET",
      pathname: "/muscleGroups",
      data: [{ _id: "muscle-chest", name: "חזה" }],
      message: "Muscle groups loaded",
    }),
    apiRoute({
      method: "GET",
      pathname: "/workoutPlans/user",
      data: {
        userId: "user-admin-001",
        workoutPlans: [
          {
            planName: "אימון A",
            muscleGroups: [
              {
                muscleGroup: "חזה",
                exercises: [{ name: "לחיצת חזה", exerciseId: "exercise-bench" }],
              },
            ],
          },
        ],
        cardio: {
          type: "simple",
          plan: { minsPerWeek: 0, timesPerWeek: 0 },
        },
      },
      message: "Workout plan loaded",
    }),
    apiRoute({
      method: "GET",
      pathname: "/progressNote/one",
      data: { userId: "user-001", progressNotes: [] },
      message: "No progress notes",
    }),
  ],
} satisfies MockScenarioMap;
