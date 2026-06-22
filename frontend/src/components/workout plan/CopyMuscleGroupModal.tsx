import { useEffect, useMemo, useState } from "react";
import { FaCopy, FaTriangleExclamation } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { cn } from "@/lib/utils";

import WorkoutMuscleGroupPills from "./WorkoutMuscleGroupPills";
import {
  findMuscleGroupIndex,
  getWorkoutDisplayName,
  getWorkoutExerciseCount,
} from "./workoutPlanCopyUtils";

interface CopyMuscleGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workouts: IWorkoutPlan[];
  sourceWorkoutIndex: number;
  sourceMuscleGroupName: string;
  onConfirm: (targetWorkoutIndex: number) => void;
}

const CopyMuscleGroupModal: React.FC<CopyMuscleGroupModalProps> = ({
  open,
  onOpenChange,
  workouts,
  sourceWorkoutIndex,
  sourceMuscleGroupName,
  onConfirm,
}) => {
  const [selectedTargetIndex, setSelectedTargetIndex] = useState<number | null>(null);

  const targetOptions = useMemo(
    () =>
      workouts
        .map((workout, index) => ({
          originalIndex: index,
          workout,
        }))
        .filter((option) => option.originalIndex !== sourceWorkoutIndex),
    [workouts, sourceWorkoutIndex]
  );

  const selectedTarget = useMemo(
    () => targetOptions.find((option) => option.originalIndex === selectedTargetIndex) ?? null,
    [selectedTargetIndex, targetOptions]
  );

  const willReplaceExistingGroup =
    !!selectedTarget && findMuscleGroupIndex(selectedTarget.workout, sourceMuscleGroupName) !== -1;

  useEffect(() => {
    if (!open) {
      setSelectedTargetIndex(null);
      return;
    }

    setSelectedTargetIndex((currentSelection) => {
      if (currentSelection === null) return null;

      const selectionStillExists = targetOptions.some(
        (option) => option.originalIndex === currentSelection
      );

      if (selectionStillExists) return currentSelection;

      return null;
    });
  }, [open, targetOptions]);

  const handleConfirm = () => {
    if (selectedTargetIndex === null) return;

    onConfirm(selectedTargetIndex);
    onOpenChange(false);
  };

  const warningText = `באימון הזה כבר קיימת קבוצת השריר "${sourceMuscleGroupName}". ההעתקה תחליף את הקבוצה הקיימת יחד עם כל התרגילים שלה.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-w-3xl overflow-hidden rounded-2xl border border-blue-100/60 bg-white p-0 font-heebo dark:border-slate-800 dark:bg-slate-900"
      >
        <DialogHeader className="border-b border-slate-100 px-6 py-5 text-right dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient text-white shadow-sm">
              <FaCopy size={14} />
            </div>
            <div>
              <DialogTitle className="text-right text-lg font-bold text-slate-900 dark:text-slate-100">
                העתקת קבוצת שריר לאימון אחר
              </DialogTitle>
              <DialogDescription className="mt-1 text-right text-xs text-slate-500 dark:text-slate-400">
                בחר אימון יעד עבור קבוצת השריר {sourceMuscleGroupName || "הנבחרת"} והתרגילים שלה.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {targetOptions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
              צריך לפחות אימון נוסף כדי להעתיק אליו את קבוצת השריר הזו.
            </div>
          )}

          <div className="flex flex-col gap-3">
            {targetOptions.map(({ workout, originalIndex }) => {
              const isSelected = selectedTargetIndex === originalIndex;
              const willReplace = findMuscleGroupIndex(workout, sourceMuscleGroupName) !== -1;

              return (
                <button
                  key={workout._id || originalIndex}
                  type="button"
                  onClick={() => setSelectedTargetIndex(originalIndex)}
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-right transition-all",
                    "bg-white hover:border-blue-300 hover:bg-blue-50/50 dark:bg-slate-900 dark:hover:border-blue-700 dark:hover:bg-blue-900/20",
                    isSelected
                      ? "border-blue-400 shadow-md ring-2 ring-blue-200 dark:border-blue-700 dark:ring-blue-900/50"
                      : "border-slate-200 dark:border-slate-800"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {getWorkoutDisplayName(workout, originalIndex)}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <span>{workout.muscleGroups.length} קבוצות שריר</span>
                        <span className="opacity-60">•</span>
                        <span>{getWorkoutExerciseCount(workout)} תרגילים</span>
                      </div>
                    </div>

                    {willReplace && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                        <FaTriangleExclamation size={10} />
                        יוחלף
                      </span>
                    )}
                  </div>

                  <WorkoutMuscleGroupPills
                    muscleGroups={workout.muscleGroups}
                    emptyLabel="אין עדיין קבוצות שריר באימון הזה"
                    className="mt-3"
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          {willReplaceExistingGroup && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              <FaTriangleExclamation size={14} className="mt-0.5 shrink-0" />
              <p>{warningText}</p>
            </div>
          )}

          <DialogFooter className="flex-row gap-3 sm:justify-start sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-slate-200 px-4 text-xs font-bold dark:border-slate-700"
              onClick={() => onOpenChange(false)}
            >
              ביטול
            </Button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedTargetIndex === null}
              className="inline-flex items-center gap-1.5 rounded-xl brand-gradient px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <FaCopy size={11} />
              <span>העתק לאימון</span>
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CopyMuscleGroupModal;
