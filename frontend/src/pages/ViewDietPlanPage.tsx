import { DietPlanDropDown } from "@/components/DietPlan/DietPlanDropDown";
import { Button } from "@/components/ui/button";
import { useDietPlanApi } from "@/hooks/useDietPlanApi";
import { IDietPlan, IMeal } from "@/interfaces/IDietPlan";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "react-router";
import CustomAlertDialog from "@/components/Alerts/DialogAlert/CustomAlertDialog";
import { defaultDietPlan, defaultMeal } from "@/constants/DietPlanConsts";

export const ViewDietPlanPage = () => {
  const { id } = useParams();

  const { addDietPlan, updateDietPlanByUserId, getDietPlanByUserId } = useDietPlanApi();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isNewPlan, setIsNewPlan] = useState(true);
  const [mealToDelete, setMealToDelete] = useState<number | null>(null);

  const [dietPlan, setDietPlan] = useState<IDietPlan>(defaultDietPlan);

  console.log("diet plan", dietPlan);
  const handleSaveDietPlan = async () => {
    const dietPlanToAdd = {
      ...dietPlan,
      userId: id,
    };

    if (id && !isNewPlan) {
      await updateDietPlanByUserId(id, dietPlanToAdd)
        .then(() => {
          toast.success("תפריט עודכנה בהצלחה!");
          setOpenDeleteModal(false);
          setMealToDelete(null);
        })
        .catch((err) => {
          toast.error("הייתה בעיה בעדכון!");
          console.error("error", err);
        });
    } else {
      await addDietPlan(dietPlanToAdd)
        .then((res) => {
          toast.success("תפריט נשמר בהצלחה!");
          setDietPlan(res);
          setIsNewPlan(false);
        })
        .catch((err) => {
          toast.error("הייתה בעיה בשמירה");
          console.error("error", err);
        });
    }
  };

  const handleAddMeal = () => {
    setDietPlan({ ...dietPlan, meals: [...dietPlan.meals, defaultMeal] });
  };

  const handleDeleteMeal = () => {
    if (mealToDelete == null) return;

    setDietPlan({ ...dietPlan, meals: dietPlan.meals.filter((_, i) => i !== mealToDelete) });
    setMealToDelete(null);
  };

  const handleSetMeal = (meal: IMeal, mealNumber: number) => {
    const newMeals = [...dietPlan.meals];

    newMeals[mealNumber] = meal;
    setDietPlan({ ...dietPlan, meals: newMeals });
  };

  useEffect(() => {
    if (!id) return;

    getDietPlanByUserId(id)
      .then((dietPlan) => {
        if (dietPlan) {
          console.log("found plan");
          setIsNewPlan(false);
          setDietPlan(dietPlan);
        } else {
          console.log("setting default plan");
          setIsNewPlan(true);
          setDietPlan(defaultDietPlan);
        }
      })
      .catch((err: Error) => {
        console.error(err);
      });
  }, []);

  return (
    <div className=" flex flex-col gap-4 w-3/4 h-full hide-scrollbar overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-4">עריכת תפריט תזונה</h1>
      <div>
        <Button className="font-bold" onClick={handleAddMeal}>
          הוסף ארוחה
        </Button>
      </div>
      <div className="flex flex-col gap-4 ">
        {dietPlan.meals.map((meal, index) => {
          console.log("meal num", index);

          return (
            <div
              key={index}
              className={`
              ${index !== dietPlan.meals.length - 1 && "border-b"}`}
            >
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
      />
    </div>
  );
};
