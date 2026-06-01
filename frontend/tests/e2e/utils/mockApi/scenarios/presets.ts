import { apiRoute, type MockScenarioMap } from "../routes";

const DIET_PLAN_PRESETS_ENDPOINT = "/presets/dietPlans";
const WORKOUT_PLAN_PRESETS_ENDPOINT = "/presets/workoutPlans";
const FORM_PRESETS_ENDPOINT = "/presets/forms";
const FORM_RESPONSES_ENDPOINT = "/presets/forms/responses";
const AGREEMENTS_SIGNED_ENDPOINT = "/agreements/admin/signed";

export const presetsScenarios = {
  "templates.diet.success": [
    apiRoute({
      method: "GET",
      pathname: DIET_PLAN_PRESETS_ENDPOINT,
      data: [],
      message: "Diet plan presets loaded",
    }),
  ],
  "templates.workouts.success": [
    apiRoute({
      method: "GET",
      pathname: WORKOUT_PLAN_PRESETS_ENDPOINT,
      data: [],
      message: "Workout presets loaded",
    }),
  ],
  "forms.presets.success": [
    apiRoute({
      method: "GET",
      pathname: FORM_PRESETS_ENDPOINT,
      data: [],
      message: "Form presets loaded",
    }),
  ],
  "forms.responses.success": [
    apiRoute({
      method: "GET",
      pathname: FORM_RESPONSES_ENDPOINT,
      data: [],
      message: "Form responses loaded",
    }),
  ],
  "agreements.signed.success": [
    apiRoute({
      method: "GET",
      pathname: AGREEMENTS_SIGNED_ENDPOINT,
      data: {
        results: [],
        totalResults: 0,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      message: "Signed agreements loaded",
    }),
  ],
} satisfies MockScenarioMap;
