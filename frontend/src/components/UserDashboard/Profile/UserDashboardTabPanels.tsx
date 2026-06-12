import UserFormResponses from "@/components/UserDashboard/FormResponses/UserFormResponses";
import MeasurementsProgression from "@/components/UserDashboard/MeasurementProgression/MeasurementsProgression";
import { WeightProgression } from "@/components/UserDashboard/WeightProgression/WeightProgression";
import { WeightProgressionPhotos } from "@/components/UserDashboard/WeightProgression/WeightProgressionPhotos";
import { WorkoutProgression } from "@/components/UserDashboard/WorkoutProgression/WorkoutProgression";
import SwapTemporaryPlanModal from "@/components/UserDashboard/WorkoutPlanHistory/SwapTemporaryPlanModal";
import WorkoutPlanHistorySection from "@/components/UserDashboard/WorkoutPlanHistory/WorkoutPlanHistorySection";
import CreateWorkoutPlanWrapper from "@/components/Wrappers/CreateWorkoutPlanWrapper";
import DietPlanWrapper from "@/components/DietPlan/DietPlanWrapper";
import WorkoutPlans from "@/components/workout plan/WorkoutPlans";
import { ViewDietPlanPage } from "@/pages/ViewDietPlanPage";
import { FaArrowsRotate } from "react-icons/fa6";
import { ProgressSubTabs } from "./UserDashboardTabs";
import type { ProgressSubTab } from "./userDashboardTypes";

interface ProgressTabPanelProps {
  activeSubTab: ProgressSubTab;
  onSubTabChange: (subTab: ProgressSubTab) => void;
}

interface WorkoutTabPanelProps {
  userId?: string;
  swapModalOpen: boolean;
  onOpenSwapModal: () => void;
  onCloseSwapModal: () => void;
}

export function ProgressTabPanel({ activeSubTab, onSubTabChange }: ProgressTabPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <ProgressSubTabs activeSubTab={activeSubTab} onSubTabChange={onSubTabChange} />

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
        {activeSubTab === "weight" && <WeightProgression />}
        {activeSubTab === "measurements" && <MeasurementsProgression />}
        {activeSubTab === "strength" && <WorkoutProgression />}
        {activeSubTab === "photos" && <WeightProgressionPhotos />}
      </div>
    </div>
  );
}

export function WorkoutTabPanel({
  userId,
  swapModalOpen,
  onOpenSwapModal,
  onCloseSwapModal,
}: WorkoutTabPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onOpenSwapModal}
          title="להחליף את התוכנית הפעילה לתקופה מוגבלת. התוכנית הקודמת תישמר בהיסטוריה ותהיה ניתנת לשחזור."
          className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100/60 dark:border-blue-900/40 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow"
        >
          <FaArrowsRotate size={11} />
          <span>החלפה זמנית</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <CreateWorkoutPlanWrapper embedded>
          <WorkoutPlans />
        </CreateWorkoutPlanWrapper>
      </div>

      {userId && <WorkoutPlanHistorySection userId={userId} activePlan={undefined} hideWhenEmpty />}

      {userId && swapModalOpen && (
        <SwapTemporaryPlanModal
          open={swapModalOpen}
          onClose={onCloseSwapModal}
          userId={userId}
          currentPlanId={undefined}
        />
      )}
    </div>
  );
}

export function DietTabPanel() {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <DietPlanWrapper>
        <ViewDietPlanPage embedded />
      </DietPlanWrapper>
    </div>
  );
}

export function FormsTabPanel() {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <UserFormResponses />
    </div>
  );
}
