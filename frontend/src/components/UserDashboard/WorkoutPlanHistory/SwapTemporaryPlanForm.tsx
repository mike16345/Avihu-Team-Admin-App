import { FaArrowsRotate, FaCalendarDays, FaTag } from "react-icons/fa6";

type SwapTemporaryPlanFormProps = {
  selectedPresetName: string;
  label: string;
  endDate: string;
  canConfirm: boolean;
  isPending: boolean;
  onOpenPicker: () => void;
  onLabelChange: (label: string) => void;
  onEndDateChange: (endDate: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

const getPendingIconClassName = (isPending: boolean) => {
  if (isPending) return "animate-spin";
  return "";
};

const getConfirmButtonLabel = (isPending: boolean) => {
  if (isPending) return "מחליף…";
  return "אשר והחלף";
};

export function SwapTemporaryPlanForm({
  selectedPresetName,
  label,
  endDate,
  canConfirm,
  isPending,
  onOpenPicker,
  onLabelChange,
  onEndDateChange,
  onCancel,
  onConfirm,
}: SwapTemporaryPlanFormProps) {
  return (
    <div className="flex flex-col gap-4 px-6 pb-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
          בחר תבנית חדשה
        </label>
        <button
          type="button"
          onClick={onOpenPicker}
          className="flex items-center justify-between gap-2 rounded-xl border border-blue-100/60 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 px-4 py-3 text-sm text-blue-900 dark:text-blue-200 transition-all hover:border-blue-300 dark:hover:border-blue-800"
        >
          <span className="font-bold">{selectedPresetName}</span>
          <FaArrowsRotate size={11} className="text-blue-500" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <FaTag size={9} />
          תווית להיסטוריה (אופציונלי)
        </label>
        <input
          type="text"
          value={label}
          onChange={(event) => onLabelChange(event.target.value)}
          placeholder='למשל: "חודש פול־בודי"'
          maxLength={120}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <FaCalendarDays size={9} />
          תאריך סיום (אופציונלי)
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          ביום זה יוצג באנר תזכורת לשחזר את התוכנית הקודמת. השחזור ידני — שום שינוי אוטומטי.
        </p>
      </div>

      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          ביטול
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!canConfirm || isPending}
          className="inline-flex items-center gap-1.5 rounded-xl brand-gradient brand-gradient-hover px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <FaArrowsRotate size={11} className={getPendingIconClassName(isPending)} />
          <span>{getConfirmButtonLabel(isPending)}</span>
        </button>
      </div>
    </div>
  );
}
