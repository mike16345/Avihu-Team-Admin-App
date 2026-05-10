import { Route, Routes, Navigate } from "react-router-dom";
import { useUsersStore } from "@/store/userStore";
import { UsersTable } from "@/components/tables/UsersTable";
import { UserDashboard } from "@/pages/UserDashboard";
import { ViewDietPlanPage } from "@/pages/ViewDietPlanPage";
import DietPlanTemplatePage from "@/pages/DietPlanTemplatePage";
import WorkoutsTemplatePage from "@/pages/WorkoutsTemplatePage";
import CreateWorkoutPlanWrapper from "@/components/Wrappers/CreateWorkoutPlanWrapper";
import PresetRoutes from "./PresetRoutes";
import UserFormPage from "@/pages/UserFormPage";
import AdminDashboard from "@/pages/AdminDashboard";
import BlogPage from "@/pages/BlogPage";
import BlogPreviewPage from "@/pages/BlogPreviewPage";
import BlogEditor from "@/components/Blog/BlogEditor";
import DietPlanWrapper from "@/components/DietPlan/DietPlanWrapper";
import WorkoutPlans from "@/components/workout plan/WorkoutPlans";
import LeadsTablePage from "@/features/leads/LeadsTablePage";
import FormBuilderPage from "@/pages/FormBuilderPage";
import FormPresetsPage from "@/pages/FormPresetsPage";
import FormResponseDetailsPage from "@/pages/FormResponseDetailsPage";
import CurrentAgreementPage from "@/pages/Agreements/CurrentAgreementPage";
import SubTrainersPage from "@/pages/SubTrainersPage";
import TrainerAnalyticsDashboardPage from "@/pages/TrainerAnalyticsDashboardPage";
import TrainerDetailsPage from "@/pages/TrainerDetailsPage";
import TrainersPage from "@/pages/TrainersPage";
import ErrorPage from "@/pages/ErrorPage";
import {
  type AppRouteAccessKey,
  canAccessRoute,
  getDefaultRouteForRole,
  normalizeAppRole,
} from "./routeAccess";

type AppRouteDefinition = {
  accessKey: AppRouteAccessKey;
  element: JSX.Element;
  path: string;
};

const appRouteDefinitions: AppRouteDefinition[] = [
  {
    accessKey: "home",
    path: "/",
    element: <AdminDashboard />,
  },
  {
    accessKey: "trainerAnalytics",
    path: "/trainer-analytics",
    element: <TrainerAnalyticsDashboardPage />,
  },
  {
    accessKey: "trainerDetails",
    path: "/trainers/:id",
    element: <TrainerDetailsPage />,
  },
  {
    accessKey: "trainers",
    path: "/trainers",
    element: <TrainersPage />,
  },
  {
    accessKey: "subTrainers",
    path: "/sub-trainers",
    element: <SubTrainersPage />,
  },
  {
    accessKey: "users",
    path: "/users/*",
    element: <UsersTable />,
  },
  {
    accessKey: "leads",
    path: "/leads",
    element: <LeadsTablePage />,
  },
  {
    accessKey: "blogs",
    path: "/blogs/",
    element: <BlogPage />,
  },
  {
    accessKey: "blogs",
    path: "/blogs/:id",
    element: <BlogPreviewPage />,
  },
  {
    accessKey: "blogCreate",
    path: "/blogs/create/",
    element: <BlogEditor />,
  },
  {
    accessKey: "blogCreate",
    path: "/blogs/create/:id",
    element: <BlogEditor />,
  },
  {
    accessKey: "users",
    path: "/users/add",
    element: <UserFormPage />,
  },
  {
    accessKey: "users",
    path: "/users/edit/:id",
    element: <UserFormPage />,
  },
  {
    accessKey: "users",
    path: "/users/:id",
    element: <UserDashboard />,
  },
  {
    accessKey: "dietPlanDetails",
    path: "/diet-plans/:id",
    element: (
      <DietPlanWrapper>
        <ViewDietPlanPage />
      </DietPlanWrapper>
    ),
  },
  {
    accessKey: "workoutPlanDetails",
    path: "/workout-plans/:id",
    element: (
      <CreateWorkoutPlanWrapper>
        <WorkoutPlans />
      </CreateWorkoutPlanWrapper>
    ),
  },
  {
    accessKey: "workoutPlans",
    path: "/workoutPlans",
    element: <WorkoutsTemplatePage />,
  },
  {
    accessKey: "dietPlans",
    path: "/dietPlans/",
    element: <DietPlanTemplatePage />,
  },
  {
    accessKey: "presets",
    path: "/presets/*",
    element: <PresetRoutes />,
  },
  {
    accessKey: "formBuilder",
    path: "/form-builder/:id",
    element: <FormBuilderPage />,
  },
  {
    accessKey: "formBuilder",
    path: "/form-builder",
    element: <FormPresetsPage />,
  },
  {
    accessKey: "formResponses",
    path: "/form-responses/:id",
    element: <FormResponseDetailsPage />,
  },
  {
    accessKey: "agreementsCurrent",
    path: "/agreements/current",
    element: <CurrentAgreementPage />,
  },
];

export const AppRoutes = () => {
  const currentUser = useUsersStore((state) => state.currentUser);
  const role = normalizeAppRole(currentUser?.role);
  const fallbackRoute = getDefaultRouteForRole(role);

  const getUnauthorizedElement = () => {
    if (fallbackRoute) {
      return <Navigate to={fallbackRoute} replace />;
    }

    return <ErrorPage message="אין לך הרשאה לצפות במערכת" />;
  };

  return (
    <Routes>
      {appRouteDefinitions.map((route) => (
        <Route
          key={`${route.accessKey}-${route.path}`}
          path={route.path}
          element={canAccessRoute(role, route.accessKey) ? route.element : getUnauthorizedElement()}
        />
      ))}

      <Route path="*" element={getUnauthorizedElement()} />
    </Routes>
  );
};
