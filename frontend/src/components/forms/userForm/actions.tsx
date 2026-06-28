import { FaTrash, FaTriangleExclamation } from "react-icons/fa6";

const getSubmitLabel = (isPending: boolean, isEdit: boolean) => {
  if (isPending) return "שומר...";

  return isEdit ? "שמירת שינויים" : "הוספת מתאמן";
};

const getDeleteConfirmLabel = (isPending: boolean) => (isPending ? "מוחק..." : "כן, מחק לצמיתות");

export const ActionBar = ({
  isDeletePending,
  isEdit,
  isPending,
  onCancel,
  onShowDeleteConfirm,
}: {
  isDeletePending: boolean;
  isEdit: boolean;
  isPending: boolean;
  onCancel: () => void;
  onShowDeleteConfirm: () => void;
}) => (
  <div className="flex items-center justify-between gap-2 rounded-b-[15px] border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-4 py-3.5">
    {isEdit ? (
      <button
        type="button"
        onClick={onShowDeleteConfirm}
        disabled={isDeletePending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FaTrash size={12} />
        <span>מחיקת מתאמן</span>
      </button>
    ) : (
      <div />
    )}

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        ביטול
      </button>
      <button
        data-testid="user-form-submit"
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-lg brand-gradient brand-gradient-hover px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {getSubmitLabel(isPending, isEdit)}
      </button>
    </div>
  </div>
);

export const DeleteConfirmDialog = ({
  firstName,
  isPending,
  lastName,
  onClose,
  onDelete,
}: {
  firstName: string;
  isPending: boolean;
  lastName: string;
  onClose: () => void;
  onDelete: () => void;
}) => (
  <div
    dir="rtl"
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    onClick={() => !isPending && onClose()}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-md rounded-2xl border border-red-200 bg-white dark:bg-slate-900 p-5 shadow-2xl"
    >
      <div className="mb-3 flex items-center gap-2 text-red-600">
        <FaTriangleExclamation size={20} />
        <h3 className="text-lg font-bold">מחיקת מתאמן</h3>
      </div>
      <p className="mb-3 text-sm text-slate-700 dark:text-slate-200">
        אתה עומד למחוק את{" "}
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {firstName} {lastName}
        </span>
        .
      </p>
      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
        <p className="font-semibold">⚠️ פעולה זו אינה הפיכה:</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          <li>כל הנתונים של המתאמן יימחקו</li>
          <li>שקילות, מדידות, תוכניות אימון ותפריט יימחקו</li>
          <li>תמונות התקדמות יימחקו</li>
          <li>המתאמן לא יוכל יותר להתחבר לאפליקציה</li>
        </ul>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          ביטול
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaTrash size={11} />
          {getDeleteConfirmLabel(isPending)}
        </button>
      </div>
    </div>
  </div>
);
