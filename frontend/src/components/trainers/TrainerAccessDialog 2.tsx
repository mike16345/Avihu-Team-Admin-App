import { AlertTriangle, Ban, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TrainerAccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainerName: string;
  isBlocked: boolean;
  isPending: boolean;
  onConfirm: () => void;
};

export const TrainerAccessDialog = ({
  open,
  onOpenChange,
  trainerName,
  isBlocked,
  isPending,
  onConfirm,
}: TrainerAccessDialogProps) => {
  const isGrantingAccess = isBlocked;
  const title = isGrantingAccess ? "הענקת גישה למאמן" : "חסימת גישת מאמן";
  const confirmLabel = isGrantingAccess ? "הענק גישה" : "חסום מאמן";
  const pendingLabel = isGrantingAccess ? "מעניק גישה..." : "חוסם...";

  const summary = isGrantingAccess
    ? `אתה עומד להחזיר את הגישה של ${trainerName}.`
    : `אתה עומד לחסום את הגישה של ${trainerName}.`;

  const warning = isGrantingAccess
    ? "הפעולה תחזיר את הגישה למאמן, לכל תתי-המאמנים שלו ולכל הלקוחות המשויכים אליו."
    : "הפעולה תחסום באופן מיידי את הגישה של המאמן, כל תתי-המאמנים שלו וכל הלקוחות המשויכים אליו.";

  const Icon = isGrantingAccess ? ShieldCheck : Ban;

  const headerClassName = isGrantingAccess
    ? "border-emerald-200 bg-emerald-50/80 text-emerald-700"
    : "border-destructive/30 bg-destructive/10 text-destructive";

  const warningClassName = isGrantingAccess
    ? "border-emerald-200/80 bg-emerald-50/70 text-emerald-900"
    : "border-destructive/30 bg-destructive/10 text-destructive";

  const confirmClassName = isGrantingAccess
    ? "bg-emerald-600 hover:bg-emerald-700"
    : "bg-destructive hover:bg-destructive/90";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="grid max-w-[460px] gap-0 overflow-hidden rounded-[18px] p-0 shadow-[0_30px_80px_rgba(15,23,42,0.28)] [&>button]:left-4 [&>button]:right-auto"
      >
        <DialogHeader className={`border-b px-5 py-4 text-right ${headerClassName}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-current/20 bg-white/80">
              <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-right text-lg font-semibold text-current">
                {title}
              </DialogTitle>
              <DialogDescription className="text-right text-sm text-current/80">
                {summary}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5 text-right">
          <div className={`rounded-2xl border px-4 py-3 ${warningClassName}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold">אזהרה</p>
                <p className="text-sm leading-6">{warning}</p>
              </div>
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            {isGrantingAccess
              ? "הגישה תחודש לכל הגורמים הקשורים למאמן מיד לאחר האישור."
              : "לאחר האישור, כל הגורמים הקשורים למאמן יאבדו גישה באופן מיידי עד להענקה מחדש."}
          </p>
        </div>

        <DialogFooter className="gap-3 border-t bg-background px-5 py-4 sm:justify-start sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            ביטול
          </Button>
          <Button
            type="button"
            className={`w-full rounded-xl text-white ${confirmClassName}`}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
