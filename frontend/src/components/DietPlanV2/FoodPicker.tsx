import { useEffect, useRef, useState } from "react";
import { FaCloudArrowDown, FaMagnifyingGlass, FaXmark } from "react-icons/fa6";

import { CATEGORY_LABELS, type FoodLibraryItem } from "./dietPlanV2Utils";
import { useFoodsSearch } from "./useFoodsSearchQuery";
import type { DietV2CategoryKind } from "@/interfaces/IDietPlanV2";

interface FoodPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, results are scoped to this category. */
  kind?: DietV2CategoryKind;
  onSelect: (food: FoodLibraryItem) => void;
}

const FoodPicker: React.FC<FoodPickerProps> = ({ open, onOpenChange, kind, onSelect }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const { items, isRemoteLoading, remoteError } = useFoodsSearch(query, kind, {
    enabled: open,
  });

  if (!open) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-24"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl shadow-blue-500/20 dark:border-blue-900/40 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-2 border-b border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 px-4 py-3">
          <FaMagnifyingGlass size={14} className="text-blue-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`חפש ${kind ? CATEGORY_LABELS[kind] : "מאכל"}…`}
            className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
          />
          {isRemoteLoading && (
            <span
              title="מחפש גם במאגר המורחב"
              className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
            >
              <FaCloudArrowDown size={9} />
              חיפוש בענן…
            </span>
          )}
          <button
            type="button"
            aria-label="סגור"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <FaXmark size={12} />
          </button>
        </header>

        <ul className="max-h-80 overflow-y-auto py-2">
          {items.length === 0 && !isRemoteLoading && (
            <li className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              {query.trim()
                ? `לא נמצאו תוצאות עבור "${query}"`
                : "התחל להקליד כדי לחפש מאכלים…"}
            </li>
          )}
          {items.map((food) => {
            const isCloud = food.id.startsWith("off-");
            return (
              <li key={food.id}>
                <button
                  type="button"
                  onClick={() => onSelect(food)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-right transition-colors hover:bg-blue-50/60 dark:hover:bg-blue-950/30"
                >
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                      {isCloud && (
                        <span
                          title="נמשך מ-Open Food Facts"
                          className="inline-flex items-center gap-0.5 rounded-md bg-sky-50 px-1.5 py-0.5 text-[9px] font-bold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                        >
                          <FaCloudArrowDown size={8} />
                          ענן
                        </span>
                      )}
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {food.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {CATEGORY_LABELS[food.kind]} · {food.per100.calories} קל׳
                      {food.defaultUnit === "g" ? " ל-100ג" : " ליחידה"}
                    </span>
                  </div>
                  <div className="flex flex-col items-start text-[11px] text-slate-500 dark:text-slate-400">
                    <span>חלבון {food.per100.protein}</span>
                    <span>פחמ׳ {food.per100.carbs}</span>
                    <span>שומן {food.per100.fat}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {remoteError && (
          <div className="border-t border-rose-100 bg-rose-50/40 px-4 py-2 text-[11px] text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
            הגישה למאגר המורחב לא הצליחה — מציג רק מאכלים מקומיים. נסה שוב בעוד רגע.
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodPicker;
