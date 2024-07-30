import { useDietPlanApi } from "@/hooks/useDietPlanApi";
import { IDietPlan, } from "@/interfaces/IDietPlan";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "react-router";
import { defaultDietPlan, } from "@/constants/DietPlanConsts";
import DietPlanForm from "@/components/DietPlan/DietPlanForm";

export const ViewDietPlanPage = () => {
  const { id } = useParams();

  const { addDietPlan, updateDietPlanByUserId, getDietPlanByUserId } = useDietPlanApi();

   const [selectedSaveFunc,setSelectedSaveFunc] = useState<((dietPlan: IDietPlan) => void)|null>(null)

    const [dietPlan, setDietPlan] = useState<IDietPlan>();


 const createDietPlan = (dietPlan:IDietPlan)=>{
  if (!dietPlan) return;

    const dietPlanToAdd = {
      ...dietPlan,
      userId: id,
    };

    addDietPlan(dietPlanToAdd)
        .then(() => {
          toast.success("תפריט נשמר בהצלחה!");
        })
        .catch((err) => {
          toast.error("אופס, נתקלנו בבעיה!", { description: err.message });
          console.error("error", err);
        });

 }

 const editDietPlan = (dietPlan:IDietPlan)=>{
  if (!dietPlan) return;
  if (!id) return;

    const dietPlanToAdd = {
      ...dietPlan,
      userId: id,
    };

    updateDietPlanByUserId(id, dietPlanToAdd)
        .then(() => {
          toast.success("תפריט עודכן בהצלחה!");
        })
        .catch((err) => {
          toast.error("אופס, נתקלנו בבעיה!", { description: err.message });
          console.error("error", err);
        });
 }


  useEffect(() => {
    if (!id) return;

    getDietPlanByUserId(id)
      .then((dietPlan) => {
        if (dietPlan) {
          setDietPlan(dietPlan);
          setSelectedSaveFunc(()=>editDietPlan)
        } else {
          console.log(`womp womp`);
          setDietPlan(defaultDietPlan);
          setSelectedSaveFunc(()=>createDietPlan)
        }
      })
      .catch((err: Error) => {
        console.error(err);
      });
  }, []);

  return (
    <div className=" flex flex-col gap-4 w-4/5 h-full hide-scrollbar overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-4">עריכת תפריט תזונה</h1>
      { selectedSaveFunc && 
        <DietPlanForm existingDietPlan={dietPlan} handleSaveDietPlan={(dietPlan)=>selectedSaveFunc(dietPlan)} />
      }
    </div>
  );
};
