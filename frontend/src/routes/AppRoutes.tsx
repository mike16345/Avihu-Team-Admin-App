import { UsersTable } from "@/components/tables/UsersTable";
import { UserDashboard } from "@/pages/UserDashboard";
import { ViewDietPlanPage } from "@/pages/ViewDietPlanPage";
import { Route, Routes } from "react-router";
import DietPlanTemplatePage from "@/pages/DietPlanTemplatePage";
import WorkoutsTemplatePage from "@/pages/WorkoutsTemplatePage";
import CreateWorkoutPlanWrapper from "@/components/Wrappers/CreateWorkoutPlanWrapper";
import PresetRoutes from "./PresetRoutes";
import UserFormPage from "@/pages/UserFormPage";
import AdminDashboard from "@/pages/AdminDashboard";
import BlogPage from "@/pages/BlogPage";
import BlogEditor from "@/components/Blog/BlogEditor";
import DietPlanWrapper from "@/components/DietPlan/DietPlanWrapper";
import WorkoutPlans from "@/components/workout plan/WorkoutPlans";
import LeadsTablePage from "@/features/leads/LeadsTablePage";
import FormBuilderPage from "@/pages/FormBuilderPage";

export const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/users/*" element={<UsersTable />} />
        <Route path="/leads" element={<LeadsTablePage />} />
        <Route path="/blogs/" element={<BlogPage />} />
        <Route path="/blogs/create/" element={<BlogEditor />} />
        <Route path="/blogs/create/:id" element={<BlogEditor />} />
        <Route path="/users/add" element={<UserFormPage />} />
        <Route path="/users/edit/:id" element={<UserFormPage />} />
        <Route path="/users/:id" element={<UserDashboard />} />
        <Route
          path="/diet-plans/:id"
          element={
            <DietPlanWrapper>
              <ViewDietPlanPage />
            </DietPlanWrapper>
          }
        />
        <Route
          path="/workout-plans/:id"
          element={
            <CreateWorkoutPlanWrapper>
              <WorkoutPlans />
            </CreateWorkoutPlanWrapper>
          }
        />
        <Route path="/workoutPlans" element={<WorkoutsTemplatePage />} />
        <Route path="/dietPlans/" element={<DietPlanTemplatePage />} />
        <Route path="/presets/*" element={<PresetRoutes />} />
        <Route path="/form-builder" element={<FormBuilderPage />} />
      </Routes>
    </>
  );
};
