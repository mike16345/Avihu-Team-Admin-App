import { ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import DateUtils from "@/lib/dateUtils";

export const daysUntil = (date?: Date | string | null) => {
  if (!date) return null;

  const targetTime = new Date(date).getTime();
  if (Number.isNaN(targetTime)) return null;

  return Math.floor((targetTime - Date.now()) / (1000 * 60 * 60 * 24));
};

export const sortWorkoutPlanHistory = (plans: ICompleteWorkoutPlan[]) =>
  [...plans].sort((firstPlan, secondPlan) => {
    let firstAssignedAt = 0;
    let secondAssignedAt = 0;

    if (firstPlan.assignedAt) {
      firstAssignedAt = new Date(firstPlan.assignedAt).getTime();
    }

    if (secondPlan.assignedAt) {
      secondAssignedAt = new Date(secondPlan.assignedAt).getTime();
    }

    return secondAssignedAt - firstAssignedAt;
  });

export const shouldShowTemporaryPlanBanner = (
  activePlan: ICompleteWorkoutPlan | null | undefined,
  temporaryDaysRemaining: number | null
) => {
  if (!activePlan?.temporaryUntil) return false;
  if (temporaryDaysRemaining === null) return false;
  return temporaryDaysRemaining > -14;
};

export const isTemporaryPlanExpired = (temporaryDaysRemaining: number | null) =>
  temporaryDaysRemaining !== null && temporaryDaysRemaining < 0;

export const getWorkoutPlanHistoryLabel = (plan: ICompleteWorkoutPlan) => {
  const assignmentLabel = plan.assignmentLabel?.trim();
  if (assignmentLabel) return assignmentLabel;

  const firstPlanName = plan.workoutPlans?.[0]?.planName;
  if (firstPlanName) {
    const additionalPlansCount = Math.max(0, (plan.workoutPlans.length || 1) - 1);
    return `${firstPlanName} +${additionalPlansCount}`;
  }

  return "תוכנית ללא שם";
};

export const getWorkoutPlanDateRange = (plan: ICompleteWorkoutPlan) => {
  if (!plan.assignedAt) return "—";

  const assignedDate = DateUtils.formatDate(new Date(plan.assignedAt), "DD/MM/YYYY");
  if (!plan.archivedAt) return assignedDate;

  const archivedDate = DateUtils.formatDate(new Date(plan.archivedAt), "DD/MM/YYYY");
  return `${assignedDate} – ${archivedDate}`;
};

export const getTemporaryPlanDateText = (activePlan: ICompleteWorkoutPlan, isExpired: boolean) => {
  if (!activePlan.temporaryUntil) return "";

  const dateLabel = DateUtils.formatDate(new Date(activePlan.temporaryUntil), "DD/MM/YYYY");
  if (isExpired) return ` · פגה ב־${dateLabel}`;

  return ` · מסתיימת ב־${dateLabel}`;
};

export const getTemporaryPlanRemainingDaysText = (temporaryDaysRemaining: number | null) => {
  if (temporaryDaysRemaining === null || temporaryDaysRemaining < 0) return "";
  return ` · נשארו ${temporaryDaysRemaining} ימים`;
};
