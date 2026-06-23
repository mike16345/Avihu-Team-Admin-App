import { FC, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FaArrowsRotate } from "react-icons/fa6";
import WorkoutPresetPicker from "@/components/templates/workoutTemplates/WorkoutPresetPicker";
import { IWorkoutPlanPreset, ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import useSwapWorkoutPlan from "@/hooks/mutations/workouts/useSwapWorkoutPlan";
import useWorkoutPlanPresetsQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanPresetsQuery";
import { toast } from "sonner";
import { useUsersStore } from "@/store/userStore";

import { SwapTemporaryPlanForm } from "./SwapTemporaryPlanForm";

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  currentPlanId?: string;
}

const DEFAULT_TEMPORARY_PLAN_DAYS = 30;

const addDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const getSelectedPresetName = (selectedPreset: IWorkoutPlanPreset | null) => {
  if (selectedPreset) return selectedPreset.name;
  return "לחץ כדי לבחור תבנית…";
};

const buildTemporaryWorkoutPlan = ({
  userId,
  selectedPreset,
  endDate,
  label,
  trainerId,
  currentPlanId,
}: {
  userId: string;
  selectedPreset: IWorkoutPlanPreset;
  endDate: string;
  label: string;
  trainerId?: string;
  currentPlanId?: string;
}) => {
  const newPlan: ICompleteWorkoutPlan & {
    temporaryUntil?: string;
    assignmentLabel?: string;
  } = {
    userId,
    workoutPlans: selectedPreset.workoutPlans,
    cardio: selectedPreset.cardio,
    tips: selectedPreset.tips,
    workoutsPerWeek: selectedPreset.workoutsPerWeek,
    durationMinutes: selectedPreset.durationMinutes,
    level: selectedPreset.level,
    goal: selectedPreset.goal,
    equipment: selectedPreset.equipment,
    muscleFocus: selectedPreset.muscleFocus,
    note: selectedPreset.note,
    limitations: selectedPreset.limitations,
    builtByTrainerId: selectedPreset.builtByTrainerId,
    assignedBy: trainerId,
    assignmentLabel: label.trim() || selectedPreset.name,
  };

  if (endDate) {
    newPlan.temporaryUntil = endDate;
  }

  if (currentPlanId) {
    newPlan.restoreToPlanId = currentPlanId;
  }

  return newPlan;
};

const SwapTemporaryPlanModal: FC<Props> = ({ open, onClose, userId, currentPlanId }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<IWorkoutPlanPreset | null>(null);
  const [endDate, setEndDate] = useState<string>(addDays(DEFAULT_TEMPORARY_PLAN_DAYS));
  const [label, setLabel] = useState<string>("");

  const currentUser = useUsersStore((s) => s.currentUser);
  const trainerId = (currentUser as { _id?: string } | null)?._id;
  const { data: presetsResp } = useWorkoutPlanPresetsQuery(showPicker);
  const presets = (presetsResp?.data ?? []) as (IWorkoutPlanPreset & { _id?: string })[];

  const swapMutation = useSwapWorkoutPlan({
    onSuccess: () => {
      toast.success("התוכנית הוחלפה. הקודמת נשמרה בהיסטוריה.");
      reset();
      onClose();
    },
    onError: () => toast.error("ההחלפה נכשלה. נסה שוב."),
  });

  const reset = () => {
    setSelectedPreset(null);
    setEndDate(addDays(DEFAULT_TEMPORARY_PLAN_DAYS));
    setLabel("");
    setShowPicker(false);
  };

  const handleConfirm = () => {
    if (!selectedPreset) {
      toast.error("בחר תבנית קודם");
      return;
    }
    const newPlan = buildTemporaryWorkoutPlan({
      userId,
      selectedPreset,
      endDate,
      label,
      trainerId,
      currentPlanId,
    });

    swapMutation.mutate({ userId, plan: newPlan });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent dir="rtl" className="max-w-lg bg-white p-0 font-heebo dark:bg-slate-900">
          <DialogHeader className="p-6 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-sm">
                <FaArrowsRotate size={14} />
              </div>
              <div className="text-right">
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  החלפת תוכנית לזמן מוגבל
                </DialogTitle>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  התוכנית הנוכחית תישמר בהיסטוריה — תוכל לשחזר בכל רגע
                </p>
              </div>
            </div>
          </DialogHeader>

          <SwapTemporaryPlanForm
            selectedPresetName={getSelectedPresetName(selectedPreset)}
            label={label}
            endDate={endDate}
            canConfirm={Boolean(selectedPreset)}
            isPending={swapMutation.isPending}
            onOpenPicker={() => setShowPicker(true)}
            onLabelChange={setLabel}
            onEndDateChange={setEndDate}
            onCancel={onClose}
            onConfirm={handleConfirm}
          />
        </DialogContent>
      </Dialog>

      <WorkoutPresetPicker
        open={showPicker}
        onOpenChange={setShowPicker}
        presets={presets}
        onSelect={(preset) => {
          setSelectedPreset(preset);
          setShowPicker(false);
        }}
      />
    </>
  );
};

export default SwapTemporaryPlanModal;
