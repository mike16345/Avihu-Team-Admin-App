import { UsersTable } from "@/components/tables/UsersTable";
import { UserDashboard } from "@/pages/UserDashboard";
import { ViewDietPlanPage } from "@/pages/ViewDietPlanPage";
import { Route, Routes } from "react-router";
import DietPlanTemplatePage from "@/pages/DietPlanTemplatePage";
import WorkoutsTemplatePage from "@/pages/WorkoutsTemplatePage";
import { CreateWorkoutPlanWrapper } from "@/components/workout plan/CreateWorkoutPlanWrapper";
import PresetRoutes from "./PresetRoutes";
import UserFormPage from "@/pages/UserFormPage";

export const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<UsersTable />} />
        <Route path="/users/*" element={<UsersTable />} />
        <Route path="/users/add" element={< UserFormPage/>} />
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
