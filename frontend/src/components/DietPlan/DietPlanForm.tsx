import React, { useEffect, useState } from "react";
import { DietPlanDropDown } from "./DietPlanDropDown";
import DeleteModal from "../Alerts/DeleteModal";
import { CustomItems, IDietPlan, IMeal } from "@/interfaces/IDietPlan";
import { Button } from "../ui/button";
import { defaultMeal } from "@/constants/DietPlanConsts";
import CustomInstructions from "./CustomInstructions";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";

interface DietPlanFormProps {
  updateDietPlan: (dietPlan: IDietPlan) => void;
  dietPlan: IDietPlan;
}

const DietPlanForm: React.FC<DietPlanFormProps> = ({ dietPlan, updateDietPlan }) => {
  const { getAllMenuItems } = useMenuItemApi();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<number | null>(null);
  const [customItems, setCustomItems] = useState<CustomItems>({
    protein: [],
    carbs: [],
    fats: [],
    vegetables: [],
  });

  const handleAddMeal = () => {
    if (!dietPlan) return;

    updateDietPlan({ ...dietPlan, meals: [...dietPlan.meals, defaultMeal] });
  };

  const handleDeleteMeal = () => {
    if (mealToDelete == null || !dietPlan) return;

    updateDietPlan({ ...dietPlan, meals: dietPlan.meals.filter((_, i) => i !== mealToDelete) });
    setMealToDelete(null);
  };

  const handleSetMeal = (meal: IMeal, mealNumber: number) => {
    if (!dietPlan) return;

    const newMeals = [...dietPlan.meals];

    newMeals[mealNumber] = meal;
    updateDietPlan({ ...dietPlan, meals: newMeals });
  };

  useEffect(() => {
    getAllMenuItems().then((items) => {
      setCustomItems(items);
    });
  }, []);

  return (
    <div className=" flex flex-col gap-4 w-full h-auto">
      <div>
        <Button className="font-bold" onClick={handleAddMeal}>
          הוסף ארוחה
        </Button>
      </div>
      <div className="w-full flex flex-col sm:flex-row gap-12 ">
        {dietPlan && (
          <div className="sm:w-3/4 w-full flex flex-col gap-8 ">
            {dietPlan.meals.map((meal, index) => {
              return (
                <div key={meal?._id || index} className={`border-b`}>
                  <DietPlanDropDown
                    customItems={customItems}
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
        )}
        <CustomInstructions
          instructions={dietPlan.customInstructions || ""}
          freeCalories={dietPlan.freeCalories || 0}
          onUpdate={(key, val) => updateDietPlan({ ...dietPlan, [key]: val })}
        />
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
