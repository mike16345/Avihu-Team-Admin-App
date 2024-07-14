import { UsersTable } from "@/components/tables/UsersTable";
import CreateWorkoutPlan from "@/components/workout plan/CreateWorkoutPlan";
import { ViewDietPlanPage } from "@/pages/ViewDietPlanPage";
import { Route, Routes } from "react-router";

export const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<UsersTable />} />
        <Route path="/users" element={<UsersTable />} />
        <Route path="/diet-plans/:id" element={<ViewDietPlanPage />} />
        <Route path="/workoutPlans" element={<CreateWorkoutPlan />} />
      </Routes>
    </>
  );
};
