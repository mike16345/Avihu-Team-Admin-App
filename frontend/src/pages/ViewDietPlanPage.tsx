import { DietPlanDropDown } from "@/components/DietPlan/DietPlanDropDown";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDietPlanApi } from "@/hooks/useDietPlanApi";
import { IDietPlan, IMeal } from "@/interfaces/IDietPlan";
import { useState } from "react";

export const ViewDietPlanPage = () => {
  const { addDietPlan } = useDietPlanApi();

  const [totalMeals, setTotalMeals] = useState<number[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<number | null>(null);
  const [dietPlan, setDietPlan] = useState<IDietPlan>({ meals: [] });

  const handleSaveDietPlan = async () => {
    console.log("saving diet plan", dietPlan);
    await addDietPlan("665f0b0b00b1a04e8f1c4478", dietPlan)
      .then((res) => {
        console.log("res", res);
      })
      .catch((err) => {
        console.error("error", err);
      });
  };

  const handleAddMeal = () => {
    setTotalMeals([...totalMeals, totalMeals.length + 1]);
  };

  const handleDeleteMeal = () => {
    if (mealToDelete == null) return;
    setTotalMeals(totalMeals.filter((_, i) => i !== mealToDelete));
    setMealToDelete(null);
  };

  const handleSetMeal = (meal: IMeal, mealNumber: number) => {
    const newMeals = [...dietPlan.meals];
    newMeals[mealNumber] = meal;
    setDietPlan({ ...dietPlan, meals: newMeals });
  };

  return (
    <div className="w-full h-full hide-scrollbar overflow-y-auto">
      <Button onClick={handleAddMeal}>Add meal</Button>
      <div className="flex flex-col  gap-4 max-w-lg md:max-w-xl lg:max-w-2xl">
        {totalMeals.map((_, index) => {
          return (
            <DietPlanDropDown
              key={index}
              mealNumber={index + 1}
              setDietPlan={(meal: IMeal) => handleSetMeal(meal, index)}
              onDelete={() => {
                setMealToDelete(index);
                setOpenDeleteModal(true);
              }}
            />
          );
        })}
        {dietPlan.meals.length > 0 && <Button onClick={handleSaveDietPlan}>Save diet plan</Button>}
      </div>
      <AlertDialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setMealToDelete(null);
                setOpenDeleteModal(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteMeal()}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
