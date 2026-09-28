import React from "react";
import { FaPlus, FaTrash, FaStar, FaCopy, FaGripVertical } from "react-icons/fa6";
import type { IWorkoutBlock, WorkoutBlockStatus } from "@/interfaces/IWorkoutPlan";
import { DragDropWrapper } from "../Wrappers/DragDropWrapper";
import { SortableItem } from "../DragAndDrop/SortableItem";

interface WorkoutBlocksBarProps {
  blocks: IWorkoutBlock[];
  currentBlockIndex: number;
  activeBlockIndex: number;
  onSelectBlock: (index: number) => void;
  onAddBlock: () => void;
  onDeleteBlock: (index: number) => void;
  onDuplicateBlock: (index: number) => void;
  onSetActive: (index: number) => void;
  onSetStatus: (index: number, status: WorkoutBlockStatus | undefined) => void;
  onReorderBlocks: (fromIndex: number, toIndex: number) => void;
}

const MAX_BLOCKS = 8;

const STATUS_OPTIONS: {
  id: WorkoutBlockStatus;
  label: string;
  chip: string;
}[] = [
  {
    id: "normal",
    label: "אימון רגיל",
    chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  {
    id: "low-intensity",
    label: "עצימות נמוכה",
    chip: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  {
    id: "moderate-intensity",
    label: "עצימות בינונית",
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    id: "high-intensity",
    label: "עצימות גבוהה",
    chip: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  },
  {
    id: "peak",
    label: "שיא (Peak)",
    chip: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  },
  {
    id: "deload",
    label: "דילואוד",
    chip: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  },
];

const getStatusMeta = (status?: WorkoutBlockStatus) => {
  if (!status) return undefined;
  return STATUS_OPTIONS.find((s) => s.id === status);
};

const WorkoutBlocksBar: React.FC<WorkoutBlocksBarProps> = ({
  blocks,
  currentBlockIndex,
  activeBlockIndex,
  onSelectBlock,
  onAddBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onSetActive,
  onSetStatus,
  onReorderBlocks,
}) => {
  const renderBlock = (block: IWorkoutBlock, index: number) => {
    const isCurrent = index === currentBlockIndex;
    const isActive = index === activeBlockIndex;
    const statusMeta = getStatusMeta(block.status);
    return (
      <div
        className={`group relative inline-flex items-center gap-2 rounded-xl border px-3 py-2 shadow-sm transition-colors ${
          isCurrent
            ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
            : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        }`}
      >
        <span
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400"
          title="גרור כדי לשנות סדר"
        >
          <FaGripVertical size={10} />
        </span>
                <button
                  type="button"
                  onClick={() => onSelectBlock(index)}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`text-sm font-bold ${
                      isCurrent
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    בלוק {index + 1}
                  </span>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      <FaStar size={8} />
                      פעיל
                    </span>
                  )}
                </button>

                <div className="relative">
                  <select
                    value={block.status || ""}
                    onChange={(e) =>
                      onSetStatus(
                        index,
                        (e.target.value || undefined) as WorkoutBlockStatus | undefined
                      )
                    }
                    className={`appearance-none rounded-full px-2.5 py-1 text-[11px] font-semibold outline-none cursor-pointer transition-colors ${
                      statusMeta
                        ? statusMeta.chip
                        : "bg-slate-50 text-slate-500 border border-dashed border-slate-300 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700"
                    }`}
                    title="סטטוס הבלוק"
                  >
                    <option value="">בחר סטטוס…</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {!isActive && (
                  <button
                    type="button"
                    onClick={() => onSetActive(index)}
                    title="סמן כבלוק הפעיל"
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400"
                  >
                    <FaStar size={10} />
                  </button>
                )}
                {blocks.length < MAX_BLOCKS && (
                  <button
                    type="button"
                    onClick={() => onDuplicateBlock(index)}
                    title="שכפל בלוק"
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400"
                  >
                    <FaCopy size={10} />
                  </button>
                )}
        {blocks.length > 1 && (
          <button
            type="button"
            onClick={() => onDeleteBlock(index)}
            title="מחק בלוק"
            className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400"
          >
            <FaTrash size={10} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div dir="rtl" className="flex flex-col gap-3 font-heebo">
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <DragDropWrapper items={blocks} strategy="horizontal" idKey="id" onMove={onReorderBlocks}>
            {({ item, index }) => (
              <SortableItem className="inline-flex" idKey="id" item={item}>
                {() => renderBlock(item as IWorkoutBlock, index)}
              </SortableItem>
            )}
          </DragDropWrapper>

          {blocks.length < MAX_BLOCKS && (
            <button
              type="button"
              onClick={onAddBlock}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-500 transition-all hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
            >
              <FaPlus size={10} />
              <span>הוסף בלוק</span>
            </button>
          )}

        {blocks.length === MAX_BLOCKS && (
          <span className="text-[11px] text-slate-400">מקסימום {MAX_BLOCKS} בלוקים</span>
        )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutBlocksBar;
