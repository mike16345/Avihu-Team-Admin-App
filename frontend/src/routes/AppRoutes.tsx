import { UsersTable } from "@/components/tables/UsersTable";
import AddSheet from "@/components/templates/workout templates/AddSheet";
import WorkoutPreset from "@/components/templates/workout templates/WorkoutPreset";
import WorkoutTemplatesHome from "@/components/templates/workout templates/WorkoutTemplatesHome";
import CreateWorkoutPlan from "@/components/workout plan/CreateWorkoutPlan";
import { UserDashboard } from "@/pages/UserDashboard";
import { ViewDietPlanPage } from "@/pages/ViewDietPlanPage";
import { Route, Routes } from "react-router";

export const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<UsersTable />} />
        <Route path="/users/*" element={<UsersTable />} />
        <Route path="/users/:id" element={<UserDashboard />} />
        <Route path="/diet-plans/:id" element={<ViewDietPlanPage />} />
        <Route path="/workout-plans/:id" element={<CreateWorkoutPlan />} />
        <Route path="/workoutPlans" element={<WorkoutTemplatesHome />} />
        <Route path="/workoutPlans/presets/:type" element={<AddSheet />} />
        <Route path="/workoutPlans/presets/workout-template" element={<WorkoutPreset />} />
      </Routes>
    </>
  );
};
