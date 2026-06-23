import { FaUtensils } from "react-icons/fa6";

const DietPlanPresetPickerHeader = () => (
  <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300">
        <FaUtensils size={15} />
      </div>
      <div className="min-w-0">
        <h2 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
          בחירת תפריט תזונה
        </h2>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          סנן לפי מטרה, קלוריות, מאקרו או הגבלות תזונה ובחר את התפריט המתאים
        </p>
      </div>
    </div>
  </header>
);

export default DietPlanPresetPickerHeader;
