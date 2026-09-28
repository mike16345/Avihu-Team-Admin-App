import { FC, useEffect, useState } from "react";
import { FaBullseye, FaTrash } from "react-icons/fa6";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useUpsertMonthlyExerciseGoal,
  useDeleteMonthlyExerciseGoal,
} from "@/hooks/queries/useMonthlyExerciseGoals";
import { IMonthlyExerciseGoal } from "@/interfaces/IMonthlyExerciseGoal";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  exercise: string;
  existing?: IMonthlyExerciseGoal;
};

export const MonthlyGoalModal: FC<Props> = ({ open, onOpenChange, userId, exercise, existing }) => {
  const upsert = useUpsertMonthlyExerciseGoal(userId);
  const remove = useDeleteMonthlyExerciseGoal(userId);
  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setWeight(existing?.targetWeight?.toString() ?? "");
      setReps(existing?.targetReps?.toString() ?? "");
      setNote(existing?.note ?? "");
      setErr(null);
    }
  }, [open, existing]);

  const save = async () => {
    setErr(null);
    const w = Number(weight);
    const r = Number(reps);
    if (!Number.isFinite(w) || w < 0 || w > 999) return setErr("משקל בין 0 ל־999");
    if (!Number.isInteger(r) || r < 1 || r > 150) return setErr("חזרות בין 1 ל־150");
    try {
      await upsert.mutateAsync({ userId, exercise, targetWeight: w, targetReps: r, note });
      onOpenChange(false);
    } catch (e: any) {
      setErr(e?.message || "שגיאה בשמירה");
    }
  };

  const del = async () => {
    if (!existing) return onOpenChange(false);
    try {
      await remove.mutateAsync({ exercise });
      onOpenChange(false);
    } catch (e: any) {
      setErr(e?.message || "שגיאה במחיקה");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            <FaBullseye className="text-blue-600" />
            יעד לתרגיל
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-right">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{exercise}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                משקל (ק"ג)
              </label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min={0}
                max={999}
                step={0.5}
                placeholder="80"
                dir="rtl"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                חזרות
              </label>
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                min={1}
                max={150}
                step={1}
                placeholder="4"
                dir="rtl"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              הערה (אופציונלי)
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              placeholder="עד סוף החודש..."
              dir="rtl"
            />
          </div>
          {err && (
            <p className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {err}
            </p>
          )}
        </div>
        <DialogFooter className="flex-row-reverse gap-2 sm:justify-start">
          <Button onClick={save} disabled={upsert.isPending}>
            {existing ? "עדכן יעד" : "הגדר יעד"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          {existing && (
            <Button
              variant="ghost"
              onClick={del}
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              disabled={remove.isPending}
            >
              <FaTrash className="me-1.5" />
              מחק יעד
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
