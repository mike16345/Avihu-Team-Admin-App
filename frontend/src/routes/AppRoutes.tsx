import { UsersTable } from "@/components/tables/UsersTable";
import CreateWorkoutPlan from "@/components/workout plan/CreateWorkoutPlan";
import { UserDashboard } from "@/pages/UserDashboard";
import { ViewDietPlanPage } from "@/pages/ViewDietPlanPage";
import { Route, Routes } from "react-router";
import DietPlanTemplatePage from "@/pages/DietPlanTemplatePage";
import WorkoutsTemplatePage from "@/pages/WorkoutsTemplatePage";
import DietPlanSheet from "@/components/templates/diet templates/DietPlanSheet";

export const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<UsersTable />} />
        <Route path="/users/*" element={<UsersTable />} />
        <Route path="/users/:id" element={<UserDashboard />} />
        <Route path="/diet-plans/:id" element={<ViewDietPlanPage />} />
        <Route path="/workout-plans/:id" element={<CreateWorkoutPlan />} />
        <Route path="/workoutPlans" element={<WorkoutsTemplatePage />} />
        <Route path="/dietPlans" element={<DietPlanTemplatePage />} />
        <Route path="/dietPlans/presets/:type" element={<DietPlanSheet />} />
        <Route path="/dietPlans/presets/:type/:id" element={<DietPlanSheet />} />
      </Routes>
    </>
  );
};
