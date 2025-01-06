import React from "react";
import { Route, Routes } from "react-router-dom";
import { ViewDietPlanPresetPage } from "@/pages/ViewDietPlanPresetPage";
import WorkoutPreset from "@/components/templates/workoutTemplates/WorkoutPreset";

const PresetRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/workoutPlans/" element={<WorkoutPreset />} />
        <Route path="/workoutPlans/:id" element={<WorkoutPreset />} />
        <Route path="/dietPlans/" element={<ViewDietPlanPresetPage />} />
        <Route path="/dietPlans/:id" element={<ViewDietPlanPresetPage />} />
      </Routes>
    </>
  );
};

export default PresetRoutes;
