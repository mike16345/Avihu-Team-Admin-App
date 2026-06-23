import type React from "react";
import { useMemo, useRef, useState } from "react";
import UserFormResponses from "@/components/UserDashboard/FormResponses/UserFormResponses";
import MeasurementsProgression from "@/components/UserDashboard/MeasurementProgression/MeasurementsProgression";
import { WeightProgression } from "@/components/UserDashboard/WeightProgression/WeightProgression";
import { WeightProgressionPhotos } from "@/components/UserDashboard/WeightProgression/WeightProgressionPhotos";
import { WorkoutProgression } from "@/components/UserDashboard/WorkoutProgression/WorkoutProgression";
import SwapTemporaryPlanModal from "@/components/UserDashboard/WorkoutPlanHistory/SwapTemporaryPlanModal";
import WorkoutPlanHistorySection from "@/components/UserDashboard/WorkoutPlanHistory/WorkoutPlanHistorySection";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateWorkoutPlanWrapper, {
  type CreateWorkoutPlanHandle,
} from "@/components/Wrappers/CreateWorkoutPlanWrapper";
import DietPlanWrapper from "@/components/DietPlan/DietPlanWrapper";
import FormResponseBubbleWrapper from "@/components/formResponses/FormResponseBubbleWrapper";
import WorkoutPlans from "@/components/workout plan/WorkoutPlans";
import { ViewDietPlanPage } from "@/pages/ViewDietPlanPage";
import { FaArrowsRotate, FaClockRotateLeft, FaFolderOpen } from "react-icons/fa6";
import useWorkoutPlanHistoryQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanHistoryQuery";
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

      <DashboardTabCard>
        {activeSubTab === "weight" && <WeightProgression />}
        {activeSubTab === "measurements" && <MeasurementsProgression />}
        {activeSubTab === "strength" && <WorkoutProgression />}
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
  // History list lives in a Sheet/Dialog so it stops pushing the
  // editor down. Opened from the header button; closes when done.
  const [historyOpen, setHistoryOpen] = useState(false);

  // Count drives the badge on the header button. Same query the
  // history section uses — react-query dedupes, no extra request.
  const { data: historyData } = useWorkoutPlanHistoryQuery(userId || "");
  const historyCount = useMemo(
    () => (Array.isArray(historyData?.data) ? historyData.data.length : 0),
    [historyData]
  );

  // Imperative handle to trigger the preset picker that lives
  // inside CreateWorkoutPlanWrapper, so the "בחר תבנית" button
  // can sit in the page header (minimal, no separate card).
  const wrapperRef = useRef<CreateWorkoutPlanHandle>(null);

  return (
    <div className="flex flex-col gap-4">
      {userId && <FormResponseBubbleWrapper userId={userId} />}

      {/* Action cluster — three peers, same chrome (white card,
          slate border, blue hover). The title/subtitle that used
          to sit on the right was redundant (the active tab name
          already says "תוכנית אימונים"), so it was removed —
          buttons explain themselves. RTL flex: first child is
          rightmost on screen. */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
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

      {/* History list — opens in a Dialog so it doesn't crowd the
          editor. The temp-plan banner inside the section still
          renders when there's an active temporary plan. */}
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
            {/* Body has a generous fixed height for a symmetrical
                dialog regardless of item count — feels substantial
                whether the trainer has 2 or 20 archived plans.
                Scroller is LTR so the scrollbar sits on the right;
                inner wrapper flips back to RTL for the content. */}
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
  return (
    <div className="flex flex-col gap-4">
      {userId && <FormResponseBubbleWrapper userId={userId} />}

      <DashboardTabCard>
        <DietPlanWrapper>
          <ViewDietPlanPage embedded />
        </DietPlanWrapper>
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
