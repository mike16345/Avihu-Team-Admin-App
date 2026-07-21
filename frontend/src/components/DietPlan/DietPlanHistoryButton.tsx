import { History } from "lucide-react";
import DietPlanHistoryDialog from "./DietPlanHistoryDialog";

interface Props {
  userId: string;
}

const DietPlanHistoryButton: React.FC<Props> = ({ userId }) => (
  <DietPlanHistoryDialog userId={userId}>
    <button
      type="button"
      title="היסטוריית שינויים"
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition-transform duration-150 hover:scale-105 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
    >
      <History size={13} strokeWidth={2} />
      היסטוריה
    </button>
  </DietPlanHistoryDialog>
);

export default DietPlanHistoryButton;
