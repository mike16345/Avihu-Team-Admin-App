import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IDietPlan } from "@/interfaces/IDietPlan";

const DIET_PLAN_ENDPOINT = "dietPlans/";

export const useDietPlanApi = () => {
  const addDietPlan = (userID: string, dietPlan: IDietPlan) =>
    sendData<IDietPlan>(`${DIET_PLAN_ENDPOINT}${userID}`, dietPlan);

  const updateDietPlan = (userID: string, dietPlan: IDietPlan) =>
    updateItem(`${DIET_PLAN_ENDPOINT}${userID}`, dietPlan);

  const deleteDietPlan = (userID: string) => deleteItem(`${DIET_PLAN_ENDPOINT}`, userID);

  const getDietPlan = (userID: string) => fetchData<IDietPlan>(`${DIET_PLAN_ENDPOINT}${userID}`);

  return {
    addDietPlan,
    updateDietPlan,
    deleteDietPlan,
    getDietPlan,
  };
};
