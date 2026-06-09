import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";

const WORKOUT_PLAN_ENDPOINT = "workoutPlans";

export const useWorkoutPlanApi = () => {
  const addWorkoutPlan = (userId: string, workoutPlan: ICompleteWorkoutPlan) => {
    return sendData<ICompleteWorkoutPlan>(WORKOUT_PLAN_ENDPOINT, workoutPlan, null, { id: userId });
  };

  const updateWorkoutPlan = (userId: string, workoutPlan: ICompleteWorkoutPlan) =>
    updateItem(`${WORKOUT_PLAN_ENDPOINT}/one`, workoutPlan, null, { userId });

  const updateWorkoutPlanByUserId = (userId: string, workoutPlan: ICompleteWorkoutPlan) =>
    updateItem<ApiResponse<ICompleteWorkoutPlan>>(
      `${WORKOUT_PLAN_ENDPOINT}/one/user`,
      workoutPlan,
      null,
      { userId }
    );

  const deleteWorkoutPlan = (userId: string) =>
    deleteItem(`${WORKOUT_PLAN_ENDPOINT}/one`, { userId });

  const getWorkoutPlanByUserId = (userId: string) =>
    fetchData<ApiResponse<ICompleteWorkoutPlan>>(`${WORKOUT_PLAN_ENDPOINT}/user`, { userId });

  const getWorkoutPlan = (id: string) =>
    fetchData<ICompleteWorkoutPlan>(WORKOUT_PLAN_ENDPOINT + id);

  // ===========================================================
  // Plan history / temporary-swap endpoints
  // ===========================================================
  // SERVER ENDPOINTS TO IMPLEMENT (handed to Mike):
  //
  //   GET    /workoutPlans/history/:userId
  //     → returns all docs for userId where archivedAt != null,
  //       sorted by assignedAt desc. Used by the history list.
  //
  //   POST   /workoutPlans/swap/:userId
  //     body: ICompleteWorkoutPlan + optional temporaryUntil +
  //           assignmentLabel
  //     → atomically: sets archivedAt=now on the current active
  //       doc (matching {userId, archivedAt: null}) and inserts a
  //       new doc with archivedAt=null. Mobile keeps reading the
  //       active doc — no breaking change.
  //
  //   POST   /workoutPlans/restore/:userId/:archivedPlanId
  //     → clones the archived doc into a new active doc; archives
  //       the currently-active one. Both stay in history.
  //
  // Until Mike deploys these, the calls below 404 and the UI
  // surfaces an "in development" banner.
  // ===========================================================

  /** Returns archived (historical) plan docs for the user. */
  const getWorkoutPlanHistory = (userId: string) =>
    fetchData<ApiResponse<ICompleteWorkoutPlan[]>>(`${WORKOUT_PLAN_ENDPOINT}/history`, { userId });

  /** Archive current + insert new active plan in one atomic operation. */
  const swapWorkoutPlan = (
    userId: string,
    payload: ICompleteWorkoutPlan & { temporaryUntil?: Date | string; assignmentLabel?: string }
  ) => sendData<ICompleteWorkoutPlan>(`${WORKOUT_PLAN_ENDPOINT}/swap`, payload, null, { userId });

  /** Restore an archived plan: clones it as a new active doc. */
  const restoreWorkoutPlan = (userId: string, archivedPlanId: string) =>
    sendData<ICompleteWorkoutPlan>(
      `${WORKOUT_PLAN_ENDPOINT}/restore`,
      {},
      null,
      { userId, archivedPlanId }
    );

  return {
    getWorkoutPlan,
    getWorkoutPlanByUserId,
    deleteWorkoutPlan,
    updateWorkoutPlanByUserId,
    updateWorkoutPlan,
    addWorkoutPlan,
    getWorkoutPlanHistory,
    swapWorkoutPlan,
    restoreWorkoutPlan,
  };
};
