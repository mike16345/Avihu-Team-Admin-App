import { useDietPlanApi } from "@/hooks/useDietPlanApi";
import { IDietPlan, } from "@/interfaces/IDietPlan";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "react-router";
import { defaultDietPlan, } from "@/constants/DietPlanConsts";
import DietPlanForm from "@/components/DietPlan/DietPlanForm";
import Loader from "@/components/ui/Loader";
import ErrorPage from "./ErrorPage";

export const ViewDietPlanPage = () => {
  const { id } = useParams();

  const { addDietPlan, updateDietPlanByUserId, getDietPlanByUserId } = useDietPlanApi();

   const [isNewPlan,setIsNewPlan] = useState<boolean>(false)

    const [dietPlan, setDietPlan] = useState<IDietPlan>();

    const [isLoading,setIsLoading]=useState<boolean>(false)

    const [error,setError]=useState<string>()


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
    setIsLoading(true)
    getDietPlanByUserId(id)
      .then((dietPlan) => {
        if (dietPlan) {
          setDietPlan(dietPlan);
          setIsNewPlan(false)
        } else {
          setDietPlan(defaultDietPlan);
          setIsNewPlan(true)
        }
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(()=>{
        setTimeout(()=>{
          setIsLoading(false)
        },1500)
      });
  }, []);

  if (isLoading) return <Loader size="large"/>
  if(error) return <ErrorPage message={error}/>

  return (
    <div className=" flex flex-col gap-4 w-4/5 h-full hide-scrollbar overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-4">עריכת תפריט תזונה</h1>
        <DietPlanForm 
          existingDietPlan={dietPlan} 
          handleSaveDietPlan={
            isNewPlan?
            (dietPlan)=>createDietPlan(dietPlan)
            :
            (dietPlan)=>editDietPlan(dietPlan)
          } 
        />
    </div>
  );
};
