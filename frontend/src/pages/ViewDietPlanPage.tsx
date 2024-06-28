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
import { toast } from "sonner";

export const ViewDietPlanPage = () => {
  const { addDietPlan } = useDietPlanApi();

  const [totalMeals, setTotalMeals] = useState<number[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<number | null>(null);
  const [dietPlan, setDietPlan] = useState<IDietPlan>({ meals: [] });

  const handleSaveDietPlan = async () => {
    await addDietPlan("665f0b0b00b1a04e8f1c4478", dietPlan)
      .then(() => {
        toast.success("תפריט נשמר בהצלחה!");
      })
      .catch((err) => {
        toast.error("היה בעיה בשמירה");
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
    <div className=" flex flex-col gap-4 size-full hide-scrollbar overflow-y-auto">
      <h1 className="text-2xl font-semidbold mb-4">עריכת תפריט תזונה</h1>
      <div>
        <Button className="font-bold" onClick={handleAddMeal}>
          הוסף ארוחה
        </Button>
      </div>
      <div className="flex flex-col gap-4 ">
        {totalMeals.map((_, index) => {
          return (
            <div
              key={index}
              className={`
              ${index !== totalMeals.length - 1 && "border-b"}`}
            >
              <DietPlanDropDown
                mealNumber={index + 1}
                setDietPlan={(meal: IMeal) => handleSetMeal(meal, index)}
                onDelete={() => {
                  setMealToDelete(index);
                  setOpenDeleteModal(true);
                }}
              />
            </div>
          );
        })}
        {dietPlan.meals.length > 0 && <Button onClick={handleSaveDietPlan}>שמור תפריט</Button>}
      </div>
      <AlertDialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">האם אתה בטוח?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => {
                setMealToDelete(null);
                setOpenDeleteModal(false);
              }}
            >
              בטל
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteMeal()}>אשר</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
