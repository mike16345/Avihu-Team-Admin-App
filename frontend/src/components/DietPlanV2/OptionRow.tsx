import { useState } from "react";
import { FaCheck, FaPen, FaTrashCan, FaXmark } from "react-icons/fa6";

import type { DietV2PlanItem } from "@/interfaces/IDietPlanV2";

interface OptionRowProps {
  item: DietV2PlanItem;
  onRemove: () => void;
  onRename?: (name: string) => void;
}

const OptionRow: React.FC<OptionRowProps> = ({ item, onRemove, onRename }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onRename?.(trimmed);
    setEditing(false);
  };

  return (
    <div
      onDoubleClick={() => onRename && setEditing(true)}
      className="group flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 transition-colors hover:border-blue-200 hover:bg-blue-50/60 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-900/60"
      title={onRename ? "לחץ פעמיים לעריכה" : undefined}
    >
      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") save();
            if (event.key === "Escape") {
              setName(item.name);
              setEditing(false);
            }
          }}
          className="min-w-[240px] rounded-md border border-blue-300 bg-white px-2 py-1 text-sm font-semibold text-slate-800 outline-none ring-2 ring-blue-100 [field-sizing:content] dark:bg-slate-900 dark:text-slate-100"
        />
      ) : (
        <span className="min-w-0 text-[15px] font-semibold leading-6 text-slate-800 dark:text-slate-100">
          {item.name}
        </span>
      )}
      {editing ? (
        <>
          <button type="button" onClick={save} aria-label="שמור שם" className="text-emerald-600">
            <FaCheck size={11} />
          </button>
          <button
            type="button"
            onClick={() => {
              setName(item.name);
              setEditing(false);
            }}
            aria-label="בטל עריכה"
            className="text-slate-400"
          >
            <FaXmark size={11} />
          </button>
        </>
      ) : onRename ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`ערוך ${item.name}`}
          className="flex h-7 w-7 items-center justify-center text-slate-300 opacity-0 transition-all group-hover:opacity-100"
        >
          <FaPen size={9} />
        </button>
      ) : null}
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
};

export default OptionRow;
