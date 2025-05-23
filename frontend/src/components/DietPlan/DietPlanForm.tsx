import React, { PropsWithChildren, useState } from "react";
import { MealDropDown } from "./MealDropDown";
import DeleteModal from "../Alerts/DeleteModal";
import { IDietPlan, IMeal } from "@/interfaces/IDietPlan";
import { defaultMeal } from "@/constants/DietPlanConsts";
import CustomInstructions from "./CustomInstructions";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { useDirtyFormContext } from "@/context/useFormContext";
import useMenuItemsQuery from "@/hooks/queries/menuItems/useMenuItemsQuery";
import AddButton from "../ui/buttons/AddButton";

interface DietPlanFormProps extends PropsWithChildren {
  updateDietPlan: (dietPlan: IDietPlan) => void;
  dietPlan: IDietPlan;
}

const DietPlanForm: React.FC<DietPlanFormProps> = ({ dietPlan, updateDietPlan, children }) => {
  const { isDirty, setIsDirty } = useDirtyFormContext();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<number | null>(null);
  const { data: customItems } = useMenuItemsQuery();

  const handleAddMeal = () => {
    if (!dietPlan) return;

    updateDietPlan({ ...dietPlan, meals: [...dietPlan.meals, defaultMeal] });
    setIsDirty(true);
  };

  const handleDeleteMeal = () => {
    if (mealToDelete == null || !dietPlan) return;

    updateDietPlan({ ...dietPlan, meals: dietPlan.meals.filter((_, i) => i !== mealToDelete) });
    setMealToDelete(null);
    setIsDirty(true);
  };

  const handleSetMeal = (meal: IMeal, mealNumber: number) => {
    if (!dietPlan) return;

    const newMeals = [...dietPlan.meals];

    newMeals[mealNumber] = meal;
    updateDietPlan({ ...dietPlan, meals: newMeals });
    setIsDirty(true);
  };

  useUnsavedChangesWarning(isDirty);

  return (
    <div className=" flex flex-col gap-4 w-full h-auto">
      <div className="w-full flex flex-col sm:flex-row gap-4">
        {dietPlan && (
          <div className="sm:w-3/4 w-full flex flex-col gap-2 ">
            <div className="space-y-4">
              {dietPlan.meals.map((meal, index) => {
                return (
                  <div key={meal?._id || index} className={`border-b`}>
                    <MealDropDown
                      customItems={customItems || { protein: [], carbs: [] }}
                      mealNumber={index + 1}
                      meal={meal}
                      setDietPlan={(meal: IMeal) => handleSetMeal(meal, index)}
                      onDelete={() => {
                        setMealToDelete(index);
                        setOpenDeleteModal(true);
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <AddButton tip="הוסף ארוחה" onClick={handleAddMeal} />
            {children}
          </div>
        )}
        <div className="sm:w-1/4">
          <CustomInstructions
            instructions={dietPlan.customInstructions}
            freeCalories={dietPlan.freeCalories || 0}
            fatsPerDay={dietPlan.fatsPerDay || 0}
            veggiesPerDay={dietPlan.veggiesPerDay || 0}
            onUpdate={(key, val) => {
              setIsDirty(true);
              updateDietPlan({ ...dietPlan, [key]: val });
            }}
          />
        </div>
      </div>
      <DeleteModal
        onConfirm={() => handleDeleteMeal()}
        onCancel={() => setMealToDelete(null)}
        isModalOpen={openDeleteModal}
        setIsModalOpen={setOpenDeleteModal}
      />
    </div>
  );
};

export default DietPlanForm;
