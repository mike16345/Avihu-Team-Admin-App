import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";


const WORKOUT_PLAN_ENDPOINT = "http://localhost:3002/workoutPlans/";

export const useWorkoutPlanApi = () => {
    const addWorkoutPlan = (workoutPlan: ICompleteWorkoutPlan) => sendData<ICompleteWorkoutPlan>(WORKOUT_PLAN_ENDPOINT, workoutPlan);

    const updateWorkoutPlan = (userID: string, workoutPlan: ICompleteWorkoutPlan) =>
        updateItem(`${WORKOUT_PLAN_ENDPOINT}${userID}`, workoutPlan);

    const updateWorkoutPlanByUserId = (userID: string, workoutPlan: ICompleteWorkoutPlan) =>
        updateItem(`${WORKOUT_PLAN_ENDPOINT}${userID}`, workoutPlan);

    const deleteWorkoutPlan = (userID: string) => deleteItem(`${WORKOUT_PLAN_ENDPOINT}`, userID);

    const getWorkoutPlanByUserId = (userID: string) =>
        fetchData<ICompleteWorkoutPlan>(`${WORKOUT_PLAN_ENDPOINT}${userID}`);

    const getWorkoutPlan = (id: string) => fetchData<ICompleteWorkoutPlan>(WORKOUT_PLAN_ENDPOINT + id);

    return {
        getWorkoutPlan,
        getWorkoutPlanByUserId,
        deleteWorkoutPlan,
        updateWorkoutPlanByUserId,
        updateWorkoutPlan,
        addWorkoutPlan,
    };
};