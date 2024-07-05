import { DietPlanDropDown } from "@/components/DietPlan/DietPlanDropDown";
import { Button } from "@/components/ui/button";
import { useDietPlanApi } from "@/hooks/useDietPlanApi";
import { IDietPlan, IMeal } from "@/interfaces/IDietPlan";
import { useState } from "react";
import { toast } from "sonner";
import { useParams } from "react-router";
import CustomAlertDialog from "@/components/Alerts/DialogAlert/CustomAlertDialog";

export const ViewDietPlanPage = () => {
  const { id } = useParams();
  const { addDietPlan, getDietPlanByUserId } = useDietPlanApi();

  const [totalMeals, setTotalMeals] = useState<number[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<number | null>(null);
  const [dietPlan, setDietPlan] = useState<IDietPlan>({ meals: [] });

  const handleSaveDietPlan = async () => {
    const dietPlanToAdd = {
      ...dietPlan,
      userId: id,
    };

    await addDietPlan(dietPlanToAdd)
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
    <div className=" flex flex-col gap-4 w-3/4 h-full hide-scrollbar overflow-y-auto">
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
        {dietPlan.meals.length > 0 && (
          <div>
            <Button className="font-bold" variant="success" onClick={handleSaveDietPlan}>
              שמור תפריט
            </Button>
          </div>
        )}
      </div>
      
      <CustomAlertDialog
        alertDialogProps={{ open: openDeleteModal, onOpenChange: setOpenDeleteModal }}
        alertDialogCancelProps={{
          onClick: () => {
            setMealToDelete(null);
            setOpenDeleteModal(false);
          },
          children: "בטל",
        }}
        alertDialogActionProps={{ onClick: handleDeleteMeal, children: "אשר" }}
        alertDialogTitleProps={{ children: "האם אתה בטוח?" }}
      />
    </div>
  );
};
