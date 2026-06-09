/**
 * SwapTemporaryPlanModal — assigns a NEW workout plan to the trainee
 * for a defined window (e.g., "Full-Body, one month") while archiving
 * the current plan so it can be restored later.
 *
 * Flow:
 *   1. Trainer picks a preset (WorkoutPresetPicker) → the preset is
 *      cloned as the new active plan body.
 *   2. Trainer optionally sets a `temporaryUntil` date (default
 *      +30 days). When the date approaches, the orange banner on
 *      WorkoutPlanHistorySection surfaces a one-click restore.
 *   3. Trainer optionally labels it ("חודש פול־בודי") for the
 *      history list.
 *   4. On submit → useSwapWorkoutPlan → server atomically archives
 *      the current doc + inserts the new one.
 *
 * Council decision: end-date is OPTIONAL (not required). Many real
 * swaps stretch — life happens. The banner does the nudging.
 */
import { FC, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FaArrowsRotate, FaCalendarDays, FaTag } from "react-icons/fa6";
import WorkoutPresetPicker from "@/components/templates/workoutTemplates/WorkoutPresetPicker";
import { IWorkoutPlanPreset, ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import useSwapWorkoutPlan from "@/hooks/mutations/workouts/useSwapWorkoutPlan";
import useWorkoutPlanPresetsQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanPresetsQuery";
import { toast } from "sonner";
import { useUsersStore } from "@/store/userStore";

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  /** Currently-active plan id (becomes restoreToPlanId on the new doc). */
  currentPlanId?: string;
}

const addDays = (days: number): string => {
  // Avoid Date.now() entanglement — base on current date string.
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const SwapTemporaryPlanModal: FC<Props> = ({ open, onClose, userId, currentPlanId }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<IWorkoutPlanPreset | null>(null);
  const [endDate, setEndDate] = useState<string>(addDays(30));
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
    setEndDate(addDays(30));
    setLabel("");
    setShowPicker(false);
  };

  const handleConfirm = () => {
    if (!selectedPreset) {
      toast.error("בחר תבנית קודם");
      return;
    }
    // Clone the preset body into a new plan doc. The server stamps
    // archivedAt/assignedAt/_id on its end.
    const newPlan: ICompleteWorkoutPlan & {
      temporaryUntil?: string;
      assignmentLabel?: string;
    } = {
      userId,
      workoutPlans: selectedPreset.workoutPlans,
      cardio: selectedPreset.cardio,
      tips: selectedPreset.tips,
      // Carry meta over so filters keep working on this active doc.
      workoutsPerWeek: selectedPreset.workoutsPerWeek,
      durationMinutes: selectedPreset.durationMinutes,
      level: selectedPreset.level,
      goal: selectedPreset.goal,
      equipment: selectedPreset.equipment,
      muscleFocus: selectedPreset.muscleFocus,
      note: selectedPreset.note,
      limitations: selectedPreset.limitations,
      builtByTrainerId: selectedPreset.builtByTrainerId,
      // History fields:
      assignedBy: trainerId,
      assignmentLabel: label.trim() || selectedPreset.name,
      ...(endDate ? { temporaryUntil: endDate } : {}),
      ...(currentPlanId ? { restoreToPlanId: currentPlanId } : {}),
    };

    swapMutation.mutate({ userId, plan: newPlan });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent
          dir="rtl"
          className="max-w-lg p-0 bg-white dark:bg-slate-900"
          style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
        >
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

          <div className="flex flex-col gap-4 px-6 pb-6">
            {/* Preset picker trigger */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                בחר תבנית חדשה
              </label>
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="flex items-center justify-between gap-2 rounded-xl border border-blue-100/60 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 px-4 py-3 text-sm text-blue-900 dark:text-blue-200 transition-all hover:border-blue-300 dark:hover:border-blue-800"
              >
                <span className="font-bold">
                  {selectedPreset?.name || "לחץ כדי לבחור תבנית…"}
                </span>
                <FaArrowsRotate size={11} className="text-blue-500" />
              </button>
            </div>

            {/* Label */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <FaTag size={9} />
                תווית להיסטוריה (אופציונלי)
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder='למשל: "חודש פול־בודי"'
                maxLength={120}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* End date — optional */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <FaCalendarDays size={9} />
                תאריך סיום (אופציונלי)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                ביום זה יוצג באנר תזכורת לשחזר את התוכנית הקודמת. השחזור ידני — שום שינוי אוטומטי.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedPreset || swapMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl brand-gradient brand-gradient-hover px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <FaArrowsRotate size={11} className={swapMutation.isPending ? "animate-spin" : ""} />
                <span>{swapMutation.isPending ? "מחליף…" : "אשר והחלף"}</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preset picker (separate dialog opened on demand). The picker
          already exists and is reused as-is — no duplication. */}
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
