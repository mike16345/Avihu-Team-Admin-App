import { FaPlus } from "react-icons/fa";
import { FC } from "react";

interface IAddWorkoutPlanProps {
  onClick: () => void;
}

export const AddWorkoutPlanCard: FC<IAddWorkoutPlanProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 px-6 py-10 text-slate-500 dark:text-slate-400 transition-all hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-sm transition-transform group-hover:scale-105 group-hover:bg-blue-100">
        <FaPlus size={18} />
      </span>
      <span className="text-sm font-semibold">הוסף תרגיל</span>
    </button>
  );
};
