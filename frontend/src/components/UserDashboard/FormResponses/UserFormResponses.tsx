import { useState } from "react";
import { useParams } from "react-router-dom";
import { FaRotateLeft } from "react-icons/fa6";

import ConfirmationDialog from "@/components/Alerts/ConfirmationDialog";
import FormResponsesTable from "@/components/tables/FormResponsesTable";
import useResetOnboarding from "@/hooks/mutations/User/useResetOnboarding";

const UserFormResponses = () => {
  const { id } = useParams();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const resetOnboarding = useResetOnboarding();

  if (!id) {
    return null;
  }

  const handleConfirm = () => {
    resetOnboarding.mutate(id);
  };

  return (
    <div className="p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">שאלונים</h3>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={resetOnboarding.isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <FaRotateLeft size={11} />
          {resetOnboarding.isPending ? "מאפס…" : "שלח שאלון מהתחלה"}
        </button>
      </div>

      <FormResponsesTable userId={id} />

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirm}
        title="שלח שאלון מהתחלה?"
        description="המתאמן יופנה מחדש לשאלון ההיכרות בפתיחה הבאה של האפליקציה. השאלונים הקיימים יישארו בהיסטוריה כאן."
        confirmLabel="שלח שאלון"
        cancelLabel="ביטול"
      />
    </div>
  );
};

export default UserFormResponses;
