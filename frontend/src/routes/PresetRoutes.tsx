import { Route, Routes } from "react-router-dom";
import { ViewDietPlanPresetPage } from "@/pages/ViewDietPlanPresetPage";
import WorkoutPreset from "@/components/templates/workoutTemplates/WorkoutPreset";
import DietPlanWrapper from "@/components/DietPlan/DietPlanWrapper";

const PresetRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/workoutPlans/" element={<WorkoutPreset />} />
        <Route path="/workoutPlans/:id" element={<WorkoutPreset />} />
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
      </Routes>
    </>
  );
};

export default PresetRoutes;
