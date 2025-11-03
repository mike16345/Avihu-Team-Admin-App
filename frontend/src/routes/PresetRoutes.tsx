import { Route, Routes } from "react-router-dom";
import { ViewDietPlanPresetPage } from "@/pages/ViewDietPlanPresetPage";
import DietPlanWrapper from "@/components/DietPlan/DietPlanWrapper";
import WorkoutPlans from "@/components/workout plan/WorkoutPlans";
import { CreateWorkoutPresetWrapper } from "@/components/templates/workoutTemplates/WorkoutPreset";
import BlogGroups from "@/components/Blog/BlogGroups";

const PresetRoutes = () => {
  return (
    <>
      <Routes>
        <Route
          path="/workoutPlans/"
          element={
            <CreateWorkoutPresetWrapper>
              <WorkoutPlans />
            </CreateWorkoutPresetWrapper>
          }
        />
        <Route
          path="/workoutPlans/:id"
          element={
            <CreateWorkoutPresetWrapper>
              <WorkoutPlans />
            </CreateWorkoutPresetWrapper>
          }
        />
        <Route
          path="/dietPlans/"
          element={
            <DietPlanWrapper>
              <ViewDietPlanPresetPage />
            </DietPlanWrapper>
          }
        />
        <Route
          path="/dietPlans/:id"
          element={
            <DietPlanWrapper>
              <ViewDietPlanPresetPage />
            </DietPlanWrapper>
          }
        />

        <Route path="/blogs/groups" element={<BlogGroups />} />
      </Routes>
    </>
  );
};

export default PresetRoutes;
