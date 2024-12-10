import { UsersTable } from "@/components/tables/UsersTable";
import { UserDashboard } from "@/pages/UserDashboard";
import { ViewDietPlanPage } from "@/pages/ViewDietPlanPage";
import { Route, Routes } from "react-router";
import DietPlanTemplatePage from "@/pages/DietPlanTemplatePage";
import WorkoutsTemplatePage from "@/pages/WorkoutsTemplatePage";
import { CreateWorkoutPlanWrapper } from "@/components/Wrappers/CreateWorkoutPlanWrapper";
import PresetRoutes from "./PresetRoutes";
import UserFormPage from "@/pages/UserFormPage";
import AdminDashboard from "@/pages/AdminDashboard";
import BlogPage from "@/pages/BlogPage";
import BlogEditor from "@/components/Blog/BlogEditor";

export const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/users/*" element={<UsersTable />} />
        <Route path="/blogs/" element={<BlogPage />} />
        <Route path="/blogs/create/:id" element={<BlogEditor />} />
        <Route path="/users/add" element={<UserFormPage />} />
        <Route path="/users/edit/:id" element={<UserFormPage />} />
        <Route path="/users/:id" element={<UserDashboard />} />
        <Route path="/diet-plans/:id" element={<ViewDietPlanPage />} />
        <Route path="/workout-plans/:id" element={<CreateWorkoutPlanWrapper />} />
        <Route path="/workoutPlans" element={<WorkoutsTemplatePage />} />
        <Route path="/dietPlans/" element={<DietPlanTemplatePage />} />
        <Route path="/presets/*" element={<PresetRoutes />} />
      </Routes>
    </>
  );
};
