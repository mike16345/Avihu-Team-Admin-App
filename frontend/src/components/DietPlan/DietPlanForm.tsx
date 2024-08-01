import React, { useEffect, useState } from "react";
import { DietPlanDropDown } from "./DietPlanDropDown";
import DeleteModal from "../Alerts/DeleteModal";
import { IDietPlan, IMeal } from "@/interfaces/IDietPlan";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { defaultMeal } from "@/constants/DietPlanConsts";

interface DietPlanFormProps {
  handleSaveDietPlan: (dietPlan: IDietPlan) => void;
  existingDietPlan?: IDietPlan;
}

const DietPlanForm: React.FC<DietPlanFormProps> = ({ handleSaveDietPlan, existingDietPlan }) => {
  const [dietPlan, setDietPlan] = useState<IDietPlan | undefined>(existingDietPlan);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<number | null>(null);

  const handleAddMeal = () => {
    console.log(dietPlan);

    if (!dietPlan) return;

    setDietPlan({ ...dietPlan, meals: [...dietPlan.meals, defaultMeal] });
  };

  const handleDeleteMeal = () => {
    if (mealToDelete == null || !dietPlan) return;

    setDietPlan({ ...dietPlan, meals: dietPlan.meals.filter((_, i) => i !== mealToDelete) });
    setMealToDelete(null);
  };

  const handleSetMeal = (meal: IMeal, mealNumber: number) => {
    if (!dietPlan) return;

    const newMeals = [...dietPlan.meals];

    newMeals[mealNumber] = meal;
    setDietPlan({ ...dietPlan, meals: newMeals });
    toast.success("ארוחה נשמרה בהצלחה!");
  };

  useEffect(() => {
    if (existingDietPlan) {
      setDietPlan(existingDietPlan);
    }
  }, [existingDietPlan]);

  return (
    <div className=" flex flex-col gap-4 w-4/5 h-full hide-scrollbar overflow-y-auto">
      <div>
        <Button className="font-bold" onClick={handleAddMeal}>
          הוסף ארוחה
        </Button>
      </div>
      {dietPlan && (
        <div className="flex flex-col gap-4 ">
          {dietPlan.meals.map((meal, index) => {
            return (
              <div key={index} className={`${index !== dietPlan.meals.length - 1 && "border-b"}`}>
                <DietPlanDropDown
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
          {dietPlan.meals.length > 0 && (
            <div>
              <Button
                className="font-bold"
                variant="success"
                onClick={() => handleSaveDietPlan(dietPlan)}
              >
                שמור תפריט
              </Button>
            </div>
          )}
        </div>
      )}

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
