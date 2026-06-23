import type { AccountStatus } from "@/interfaces/IUser";
import { cn } from "@/lib/utils";
import { FaDumbbell } from "react-icons/fa6";
import {
  getStatusModalBodyClassName,
  getStatusModalTitle,
  STATUS_DESCRIPTION,
  STATUS_LABEL,
} from "./userDashboardStatus";

interface PlanTypeConfirmationModalProps {
  fromPlanType: string;
  toPlanType: string;
  userName: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

interface StatusConfirmationModalProps {
  fromStatus: AccountStatus;
  toStatus: AccountStatus;
  userName: string;
  isPending: boolean;
  daysRemaining: number | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PlanTypeConfirmationModal({
  fromPlanType,
  toPlanType,
  userName,
  isPending,
  onConfirm,
  onCancel,
}: PlanTypeConfirmationModalProps) {
  return (
    <ModalShell isPending={isPending} onCancel={onCancel}>
      <div className="mb-2 flex items-center gap-2 text-blue-600">
        <FaDumbbell size={18} />
        <h3 className="text-lg font-bold">שינוי סוג תוכנית</h3>
      </div>

      <p className="mb-3 text-sm text-slate-700 dark:text-slate-200">
        אתה עומד לשנות את סוג התוכנית של{" "}
        <span className="font-bold text-slate-900 dark:text-slate-100">{userName}</span> מ-
        <span className="font-bold">"{fromPlanType || "—"}"</span> ל-
        <span className="font-bold">"{toPlanType}"</span>
      </p>

      <div className="mb-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 p-3 text-sm text-blue-900">
        <p className="font-semibold">📱 מה זה משנה באפליקציית המתאמן:</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
          <li>המאמרים שהמתאמן רואה — יוצגו מאמרים השייכים ל-{toPlanType} בלבד (+ מאמרים כלליים)</li>
          <li>פרופיל המתאמן באפליקציה יציג את סוג התוכנית החדש</li>
          <li>תוכנית האימון/תפריט הקיימים לא משתנים — תצטרך לעדכן אותם בנפרד</li>
        </ul>
      </div>

      <ModalActions
        isPending={isPending}
        confirmLabel="אישור השינוי"
        pendingLabel="שומר..."
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </ModalShell>
  );
}

export function StatusConfirmationModal({
  fromStatus,
  toStatus,
  userName,
  isPending,
  daysRemaining,
  onConfirm,
  onCancel,
}: StatusConfirmationModalProps) {
  const isDangerous = toStatus === "disabled";
  const isFreeze = toStatus === "frozen";
  const modalTitle = getStatusModalTitle(fromStatus, toStatus);
  const bodyClassName = getStatusModalBodyClassName(toStatus);

  return (
    <ModalShell isPending={isPending} onCancel={onCancel}>
      <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-slate-100">{modalTitle}</h3>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
        אתה עומד לשנות את הסטטוס של{" "}
        <span className="font-bold text-slate-900 dark:text-slate-100">{userName}</span> מ-
        <span className="font-bold">"{STATUS_LABEL[fromStatus]}"</span> ל-
        <span className="font-bold">"{STATUS_LABEL[toStatus]}"</span>
      </p>

      <div className={cn("mb-4 rounded-xl border p-3 text-sm", bodyClassName)}>
        <p className="font-semibold">{STATUS_DESCRIPTION[toStatus]}</p>
        {isDangerous && (
          <p className="mt-1 text-xs">
            💡 המתאמן יראה הודעת "ההרשאה פגה" בפתיחה הבאה של האפליקציה.
          </p>
        )}
        {isFreeze && <FreezeSummary daysRemaining={daysRemaining} />}
      </div>

      <ModalActions
        isPending={isPending}
        confirmLabel="אישור"
        pendingLabel="שומר..."
        confirmClassName={isDangerous ? "bg-red-600 hover:bg-red-700" : undefined}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </ModalShell>
  );
}

function FreezeSummary({ daysRemaining }: { daysRemaining: number | null }) {
  const daysLabel = daysRemaining !== null ? daysRemaining : "—";

  return (
    <div className="mt-3 rounded-lg bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-900/40 p-3">
      <p className="mb-1 text-[11px] font-bold text-cyan-700 dark:text-cyan-300">
        💎 ימי ליווי שנותרו במועד ההקפאה
      </p>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        {daysLabel}
        <span className="ms-1 text-sm font-bold text-slate-500">ימים</span>
      </p>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        המספר יישמר בפרופיל של המתאמן כדי שתוכל לכבד אותו בעת שחרור מהקפאה.
      </p>
    </div>
  );
}

function ModalShell({
  isPending,
  onCancel,
  children,
}: {
  isPending: boolean;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={() => !isPending && onCancel()}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  isPending,
  confirmLabel,
  pendingLabel,
  confirmClassName,
  onConfirm,
  onCancel,
}: {
  isPending: boolean;
  confirmLabel: string;
  pendingLabel: string;
  confirmClassName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={onCancel}
        disabled={isPending}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        ביטול
      </button>
      <button
        onClick={onConfirm}
        disabled={isPending}
        className={cn(
          "rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60",
          confirmClassName
        )}
      >
        {isPending ? pendingLabel : confirmLabel}
      </button>
    </div>
  );
}
