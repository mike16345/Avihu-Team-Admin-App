import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import UserFormResponses from "@/components/UserDashboard/FormResponses/UserFormResponses";
import MeasurementsProgression from "@/components/UserDashboard/MeasurementProgression/MeasurementsProgression";
import StepsProgression from "@/components/UserDashboard/StepsTracking/StepsProgression";
import { WeightProgression } from "@/components/UserDashboard/WeightProgression/WeightProgression";
import { WeightProgressionPhotos } from "@/components/UserDashboard/WeightProgression/WeightProgressionPhotos";
import { WorkoutProgression } from "@/components/UserDashboard/WorkoutProgression/WorkoutProgression";
import DietPlanV2UserEditor from "@/components/DietPlanV2/DietPlanV2UserEditor";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import useGetDietPlan from "@/hooks/queries/dietPlans/useGetDietPlan";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import { resolveDietPlanEditorVersion } from "@/lib/dietPlanVersion";
import { useUsersStore } from "@/store/userStore";
import SwapTemporaryPlanModal from "@/components/UserDashboard/WorkoutPlanHistory/SwapTemporaryPlanModal";
import WorkoutPlanHistorySection from "@/components/UserDashboard/WorkoutPlanHistory/WorkoutPlanHistorySection";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateWorkoutPlanWrapper, {
  type CreateWorkoutPlanHandle,
} from "@/components/Wrappers/CreateWorkoutPlanWrapper";
import DietPlanWrapper from "@/components/DietPlan/DietPlanWrapper";
import FormResponseBubbleWrapper from "@/components/formResponses/FormResponseBubbleWrapper";
import WorkoutPlans from "@/components/workout plan/WorkoutPlans";
import { DietPlanV1Page } from "@/pages/ViewDietPlanPage";
import { FaArrowsRotate, FaClockRotateLeft, FaFolderOpen } from "react-icons/fa6";
import useWorkoutPlanHistoryQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanHistoryQuery";
import SetInputStyleToggle from "./SetInputStyleToggle";
import { ProgressSubTabs } from "./UserDashboardTabs";
import type { ProgressSubTab } from "./userDashboardTypes";
import DietPlanVersionSwitch from "@/components/DietPlanV2/DietPlanVersionSwitch";

interface ProgressTabPanelProps {
  activeSubTab: ProgressSubTab;
  onSubTabChange: (subTab: ProgressSubTab) => void;
  userId?: string;
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

      <DashboardTabCard>
        {activeSubTab === "weight" && <WeightProgression />}
        {activeSubTab === "measurements" && <MeasurementsProgression />}
        {activeSubTab === "strength" && <WorkoutProgression />}
        {activeSubTab === "steps" && <StepsProgression />}
        {activeSubTab === "photos" && <WeightProgressionPhotos />}
      </DashboardTabCard>
    </div>
  );
}

export function WorkoutTabPanel({
  userId,
  swapModalOpen,
  onOpenSwapModal,
  onCloseSwapModal,
}: WorkoutTabPanelProps) {
  const [historyOpen, setHistoryOpen] = useState(false);

  const { data: historyData } = useWorkoutPlanHistoryQuery(userId || "");
  const historyCount = useMemo(
    () => (Array.isArray(historyData?.data) ? historyData.data.length : 0),
    [historyData]
  );

  const wrapperRef = useRef<CreateWorkoutPlanHandle>(null);

  return (
    <div className="flex flex-col gap-4">
      {userId && <FormResponseBubbleWrapper userId={userId} />}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          {userId && <SetInputStyleToggle userId={userId} />}
          <ActionButton
            onClick={() => wrapperRef.current?.openPresetPicker()}
            title="טען תבנית קיימת לתוכנית האימונים"
          >
            <FaFolderOpen size={11} />
            <span>בחר תבנית</span>
          </ActionButton>
          <ActionButton
            onClick={onOpenSwapModal}
            title="להחליף את התוכנית הפעילה לתקופה מוגבלת. התוכנית הקודמת תישמר בהיסטוריה ותהיה ניתנת לשחזור."
          >
            <FaArrowsRotate size={11} />
            <span>החלפה זמנית</span>
          </ActionButton>
          <ActionButton
            onClick={() => setHistoryOpen(true)}
            title="היסטוריית תוכניות אימון של המתאמן"
          >
            <FaClockRotateLeft size={11} />
            <span>היסטוריה</span>
            {historyCount > 0 && (
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                {historyCount}
              </span>
            )}
          </ActionButton>
        </div>
      </div>

      <DashboardTabCard>
        <CreateWorkoutPlanWrapper embedded hideLoadBar ref={wrapperRef}>
          <WorkoutPlans />
        </CreateWorkoutPlanWrapper>
      </DashboardTabCard>
      {userId && (
        <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
          <DialogContent
            dir="rtl"
            className="max-w-3xl overflow-hidden bg-white p-0 font-heebo shadow-xl shadow-blue-500/10 dark:bg-slate-900"
          >
            <DialogHeader className="border-b border-slate-100 dark:border-slate-800 p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient text-white shadow-md shadow-blue-500/25">
                  <FaClockRotateLeft size={16} />
                </div>
                <div className="text-right">
                  <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    היסטוריית תוכניות אימון
                  </DialogTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {historyCount > 0
                      ? `${historyCount} תוכניות מארכבות — לצפייה ולשחזור`
                      : "אין עדיין תוכניות בארכיון"}
                  </p>
                </div>
              </div>
            </DialogHeader>
            <div
              className="h-[520px] overflow-y-auto bg-slate-50/40 dark:bg-slate-900/40 p-6"
              dir="ltr"
            >
              <div dir="rtl">
                <WorkoutPlanHistorySection userId={userId} activePlan={undefined} embedded />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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

interface DietTabPanelProps {
  userId?: string;
}

export function DietTabPanel({ userId }: DietTabPanelProps) {
  const currentTrainer = useUsersStore((state) => state.currentUser);
  const { data, isLoading, error } = useGetDietPlan(userId || "");
  const existingPlan = data && !data.failed ? data.dietplan : null;
  const resolvedVersion = resolveDietPlanEditorVersion(existingPlan, currentTrainer);
  const isAdmin = currentTrainer?.role === "admin";
  const [adminVersion, setAdminVersion] = useState<1 | 2 | null>(null);
  const editorVersion = isAdmin ? (adminVersion ?? resolvedVersion) : resolvedVersion;

  useEffect(() => {
    setAdminVersion(null);
  }, [userId, existingPlan?._id, existingPlan?.version]);

  if (!userId || isLoading) return <Loader size="large" />;
  if (error) return <ErrorPage message={error.message} />;

  return (
    <div className="flex flex-col gap-4">
      {userId && <FormResponseBubbleWrapper userId={userId} />}

      {isAdmin && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-2.5 dark:border-blue-900/40 dark:bg-blue-950/20">
          <div>
            <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
              גרסת תפריט פעילה
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              השינוי יחליף את התפריט הקיים רק לאחר שמירה
            </p>
          </div>
          <DietPlanVersionSwitch value={editorVersion} onChange={setAdminVersion} compact />
        </div>
      )}

      <DashboardTabCard>
        {editorVersion === 2 ? (
          <DietPlanV2UserEditor
            userId={userId}
            initialPlan={existingPlan?.version === 2 ? (existingPlan as IDietPlanV2) : undefined}
          />
        ) : (
          <DietPlanWrapper>
            <DietPlanV1Page embedded userId={userId} />
          </DietPlanWrapper>
        )}
      </DashboardTabCard>
    </div>
  );
}

export function FormsTabPanel() {
  return (
    <DashboardTabCard>
      <UserFormResponses />
    </DashboardTabCard>
  );
}

function DashboardTabCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
      {children}
    </div>
  );
}

/** Header action button — one chrome for all three actions in
 *  the workout-tab header (בחר תבנית / החלפה זמנית / היסטוריה).
 *  White card, slate border, blue accent on hover. */
function ActionButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700 dark:hover:bg-blue-950/30"
    >
      {children}
    </button>
  );
}
