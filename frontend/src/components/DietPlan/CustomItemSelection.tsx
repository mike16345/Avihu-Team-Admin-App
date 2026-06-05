/**
 * CustomItemSelection — chip grid for picking food items inside a meal.
 *
 * Visual refresh: outlined pills with a soft slate look by default, that
 * fill in emerald when selected (matching the diet-plan accent set).
 * Hover lifts the chip slightly. Replaces the old blue/green Badge.
 */
import { FC, useEffect, useState } from "react";
import { FaCheck, FaPlus } from "react-icons/fa6";

type CustomItemSelectionProps = {
  onItemToggle: (selectedItems: string[]) => void;
  selectedItems?: string[];
  items: any[];
};

export const CustomItemSelection: FC<CustomItemSelectionProps> = ({
  onItemToggle,
  selectedItems,
  items,
}) => {
  const [selected, setSelectedItems] = useState<string[]>(selectedItems || []);

  useEffect(() => {
    setSelectedItems(selectedItems || []);
  }, [selectedItems]);

  const toggleSelect = (item: string) => {
    setSelectedItems((prev) => {
      const next = prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item];
      onItemToggle(next);
      return next;
    });
  };

  return (
    <div
      dir="rtl"
      className="flex max-h-48 flex-wrap items-center gap-1.5 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-2 custom-scrollbar"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {(!items || items.length === 0) && (
        <div className="text-xs text-slate-400 dark:text-slate-500">אין פריטים</div>
      )}
      {items?.map((item, index) => {
        const isSelected = selected.includes(item._id);
        return (
          <button
            key={item._id || index}
            type="button"
            onClick={() => toggleSelect(item._id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
              isSelected
                ? "border-emerald-300 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 shadow-sm"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300"
            }`}
          >
            <span>{item.name}</span>
            {isSelected ? <FaCheck size={9} /> : <FaPlus size={9} />}
          </button>
        );
      })}
    </div>
  );
};
