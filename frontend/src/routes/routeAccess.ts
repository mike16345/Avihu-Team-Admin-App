import { MainRoutes } from "@/enums/Routes";

export const APP_ROLES = ["admin", "trainer", "subTrainer", "user"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type AppRouteAccessKey =
  | "home"
  | "trainerAnalytics"
  | "trainers"
  | "trainerDetails"
  | "subTrainers"
  | "users"
  | "leads"
  | "blogs"
  | "blogCreate"
  | "dietPlans"
  | "dietPlanDetails"
  | "workoutPlans"
  | "workoutPlanDetails"
  | "presets"
  | "formBuilder"
  | "formResponses"
  | "agreementsCurrent";

const nonUserRoles: AppRole[] = ["admin", "trainer", "subTrainer"];
const adminAndTrainerRoles: AppRole[] = ["admin", "trainer"];

export const ROUTE_ROLE_ACCESS: Record<AppRouteAccessKey, AppRole[]> = {
  home: ["admin"],
  trainerAnalytics: nonUserRoles,
  trainers: ["admin"],
  trainerDetails: ["admin"],
  subTrainers: adminAndTrainerRoles,
  users: nonUserRoles,
  leads: nonUserRoles,
  blogs: nonUserRoles,
  blogCreate: nonUserRoles,
  dietPlans: nonUserRoles,
  dietPlanDetails: nonUserRoles,
  workoutPlans: nonUserRoles,
  workoutPlanDetails: nonUserRoles,
  presets: nonUserRoles,
  formBuilder: nonUserRoles,
  formResponses: nonUserRoles,
  agreementsCurrent: nonUserRoles,
};

export const DEFAULT_ROUTE_BY_ROLE: Record<AppRole, string | null> = {
  admin: MainRoutes.HOME,
  trainer: MainRoutes.TRAINER_ANALYTICS,
  subTrainer: MainRoutes.TRAINER_ANALYTICS,
  user: "login",
};

export const normalizeAppRole = (role?: string): AppRole => {
  if (role === "admin" || role === "trainer" || role === "subTrainer") {
    return role;
  }

  return "user";
};

export const canAccessRoute = (role: AppRole, accessKey: AppRouteAccessKey) => {
  return ROUTE_ROLE_ACCESS[accessKey].includes(role);
};

export const getDefaultRouteForRole = (role: AppRole) => {
  return DEFAULT_ROUTE_BY_ROLE[role];
};

export const ROUTE_PATHS_BY_ACCESS_KEY: Record<AppRouteAccessKey, string | string[]> = {
  home: MainRoutes.HOME,
  trainerAnalytics: MainRoutes.TRAINER_ANALYTICS,
  trainers: MainRoutes.TRAINERS,
  trainerDetails: MainRoutes.TRAINER,
  subTrainers: MainRoutes.SUB_TRAINERS,
  users: `${MainRoutes.USERS}/*`,
  leads: "/leads",
  blogs: ["/blogs/", "/blogs/:id"],
  blogCreate: ["/blogs/create/", "/blogs/create/:id"],
  dietPlans: MainRoutes.DIET_PLANS,
  dietPlanDetails: MainRoutes.DIET_PLAN,
  workoutPlans: MainRoutes.WORKOUT_PLANS_PRESETS,
  workoutPlanDetails: `${MainRoutes.USER_WORKOUT_PLAN}/:id`,
  presets: "/presets/*",
  formBuilder: ["/form-builder", "/form-builder/:id"],
  formResponses: "/form-responses/:id",
  agreementsCurrent: "/agreements/current",
};
