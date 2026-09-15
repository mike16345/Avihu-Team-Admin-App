import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IDietPlan } from "@/interfaces/IDietPlan";
import { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import type { AnyDietPlan } from "@/lib/dietPlanVersion";
import { ApiResponse } from "@/types/types";

const DIET_PLAN_ENDPOINT = "dietPlans";

export const useDietPlanApi = () => {
  const addDietPlan = (dietPlan: IDietPlan) =>
    sendData<ApiResponse<IDietPlan>>(DIET_PLAN_ENDPOINT, dietPlan).then((res) => res.data);

  const updateDietPlan = (planId: string, dietPlan: IDietPlan) =>
    updateItem<ApiResponse<IDietPlan>>(`${DIET_PLAN_ENDPOINT}/one?id=${planId}`, dietPlan).then(
      (res) => res.data
    );

  const updateDietPlanByUserId = (userID: string, dietPlan: IDietPlan) =>
    updateItem<ApiResponse<IDietPlan>>(
      `${DIET_PLAN_ENDPOINT}/one/user?id=${userID}`,
      dietPlan
    ).then((res) => res.data);

  const deleteDietPlan = (planId: string) =>
    deleteItem<ApiResponse<IDietPlan>>(`${DIET_PLAN_ENDPOINT}/one?id=${planId}`).then(
      (res) => res.data
    );

  const deleteDietPlanByUserId = (userID: string) =>
    deleteItem<ApiResponse<IDietPlan>>(`${DIET_PLAN_ENDPOINT}/one/user?id=${userID}`, {
      id: userID,
    }).then((res) => res.data);

  const getDietPlanByUserId = (userID: string) =>
    fetchData<ApiResponse<AnyDietPlan>>(`${DIET_PLAN_ENDPOINT}/user?userId=${userID}`).then(
      (res) => res.data
    );

  const getDietPlan = (id: string) =>
    fetchData<ApiResponse<AnyDietPlan>>(`${DIET_PLAN_ENDPOINT}/one?id=${id}`).then(
      (res) => res.data
    );

  const addDietPlanV2 = (userId: string, dietPlan: IDietPlanV2) =>
    sendData<ApiResponse<IDietPlanV2>>(DIET_PLAN_ENDPOINT, { ...dietPlan, userId }).then(
      (res) => res.data
    );

  const updateDietPlanV2ByUserId = (userId: string, dietPlan: IDietPlanV2) =>
    updateItem<ApiResponse<IDietPlanV2>>(
      `${DIET_PLAN_ENDPOINT}/one/user?id=${userId}`,
      dietPlan
    ).then((res) => res.data);

  return {
    addDietPlan,
    updateDietPlan,
    updateDietPlanByUserId,
    deleteDietPlan,
    deleteDietPlanByUserId,
    getDietPlanByUserId,
    getDietPlan,
    addDietPlanV2,
    updateDietPlanV2ByUserId,
  };
};
