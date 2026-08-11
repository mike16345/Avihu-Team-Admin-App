import { FaTrashCan } from "react-icons/fa6";

import type { DietV2PlanItem } from "@/interfaces/IDietPlanV2";

interface OptionRowProps {
  item: DietV2PlanItem;
  onRemove: () => void;
}

const OptionRow: React.FC<OptionRowProps> = ({ item, onRemove }) => (
  <div className="group flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 transition-colors hover:border-blue-200 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-blue-900/60">
    <span className="min-w-0 flex-1 text-sm font-semibold leading-6 text-slate-800 dark:text-slate-100">
      {item.name}
    </span>
    <button
      type="button"
      onClick={onRemove}
      aria-label={`הסר ${item.name} מהארוחה`}
      title="הסר מהארוחה"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-300 opacity-60 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-950/40"
    >
      <FaTrashCan size={10} />
    </button>
  </div>
);

export default OptionRow;
