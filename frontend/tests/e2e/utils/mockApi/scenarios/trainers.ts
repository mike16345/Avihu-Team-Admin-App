import { apiRoute, type MockScenarioMap } from "../routes";

const TRAINERS_ENDPOINT = "/trainers";
const TRAINERS_PAGINATED_ENDPOINT = `${TRAINERS_ENDPOINT}/paginated`;
const TRAINERS_ONE_ENDPOINT = `${TRAINERS_ENDPOINT}/one`;
const SUB_TRAINERS_PAGINATED_ENDPOINT = "/subTrainers/paginated";

const trainer = {
  _id: "trainer-001",
  fullName: "מאמן לדוגמה",
  email: "trainer@example.com",
  phone: "0501234567",
  subscriptionPlan: "Pro",
  clientLimit: 30,
  subTrainerLimit: 3,
  status: "active",
  source: "פנייה קרה",
  videoLibraryAccess: false,
  dietPlanVersion: 2,
  traineeCount: 4,
  subTrainerCount: 1,
};

export const trainersScenarios = {
  "trainers.paginated.success": [
    apiRoute({
      method: "GET",
      pathname: TRAINERS_PAGINATED_ENDPOINT,
      data: {
        results: [trainer],
        totalResults: 1,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      message: "Trainers loaded",
    }),
  ],
  "trainers.create.success": [
    apiRoute({
      method: "POST",
      pathname: TRAINERS_ENDPOINT,
      data: trainer,
      message: "Trainer created",
      status: 201,
    }),
  ],
  "trainers.one.v2-success": [
    apiRoute({
      method: "GET",
      pathname: TRAINERS_ONE_ENDPOINT,
      data: {
        trainer,
        overview: {
          trainees: { current: 4 },
          subTrainers: { current: 1 },
        },
      },
      message: "Trainer loaded",
    }),
  ],
  "trainers.update.success": [
    apiRoute({
      method: "PUT",
      pathname: TRAINERS_ONE_ENDPOINT,
      data: trainer,
      message: "Trainer updated",
    }),
  ],
  "trainers.subtrainers.empty": [
    apiRoute({
      method: "GET",
      pathname: SUB_TRAINERS_PAGINATED_ENDPOINT,
      data: {
        results: [],
        totalResults: 0,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      message: "Sub-trainers loaded",
    }),
  ],
} satisfies MockScenarioMap;
