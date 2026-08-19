import { Route, Routes } from "react-router-dom";
import { ViewDietPlanPresetPage } from "@/pages/ViewDietPlanPresetPage";
import DietPlanWrapper from "@/components/DietPlan/DietPlanWrapper";
import WorkoutPlans from "@/components/workout plan/WorkoutPlans";
import { CreateWorkoutPresetWrapper } from "@/components/templates/workoutTemplates/WorkoutPreset";
import BlogGroups from "@/components/Blog/BlogGroups";
import FoodCatalogWrapper from "@/components/Wrappers/FoodCatalogWrapper";
import FoodCatalogItemPageWrapper from "@/components/Wrappers/FoodCatalogItemWrapper";

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
        <Route path="/admin/food-catalog" element={<FoodCatalogWrapper />} />
        <Route path="/admin/food-catalog/new" element={<FoodCatalogItemPageWrapper />} />
        <Route
          path="/admin/food-catalog/:catalogItemId/edit"
          element={<FoodCatalogItemPageWrapper />}
        />
        <Route path="/blogs/groups" element={<BlogGroups />} />
      </Routes>
    </>
  );
};

export default PresetRoutes;
