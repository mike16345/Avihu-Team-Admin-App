import { DietPlanDropDown } from "@/components/DietPlan/DietPlanDropDown";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const ViewDietPlanPage = () => {
  const [totalMeals, setTotalMeals] = useState([1]);

  const handleAddMeal = () => {
    setTotalMeals([...totalMeals, totalMeals.length + 1]);
  };

  const handleDeleteMeal = (index: number) => {
    setTotalMeals(totalMeals.filter((item, i) => i !== index));
  };

  return (
    <div className="w-full h-full hide-scrollbar overflow-y-auto">
      <Button onClick={handleAddMeal}>Add meal</Button>
      <div className="flex flex-col gap-4">
        {totalMeals.map((_, index) => {
          return (
            <DietPlanDropDown
              key={index}
              mealNumber={index + 1}
              onDelete={() => handleDeleteMeal(index)}
            />
          );
        })}
      </div>
    </div>
  );
};
