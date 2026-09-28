import { FC, useEffect, useState } from "react";
import { FaCheck, FaPlus, FaXmark } from "react-icons/fa6";

type CustomItemSelectionProps = {
  onItemToggle: (selectedItems: string[]) => void;
  selectedItems?: string[];
  items: any[];
  extraItems?: string[];
  onExtraItemsChange?: (items: string[]) => void;
};

export const CustomItemSelection: FC<CustomItemSelectionProps> = ({
  onItemToggle,
  selectedItems,
  items,
  extraItems,
  onExtraItemsChange,
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

  const removeExtra = (name: string) => {
    if (!onExtraItemsChange || !extraItems) return;
    onExtraItemsChange(extraItems.filter((i) => i !== name));
  };

  const hasAny = (items && items.length > 0) || (extraItems && extraItems.length > 0);

  return (
    <div
      dir="rtl"
      className="flex max-h-40 flex-wrap items-start content-start gap-1.5 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-2 font-heebo custom-scrollbar"
    >
      {!hasAny && (
        <div className="text-xs text-slate-400 dark:text-slate-500">אין פריטים</div>
      )}
      {extraItems?.map((name) => (
        <button
          key={`extra-${name}`}
          type="button"
          onClick={() => removeExtra(name)}
          className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-900/30 px-3.5 py-1.5 text-[13px] font-medium text-blue-500 dark:text-blue-300 shadow-sm transition-all"
        >
          <span>{name}</span>
          <FaCheck size={9} />
        </button>
      ))}
      {items?.map((item, index) => {
        const isSelected = selected.includes(item._id);
        return (
          <button
            key={item._id || index}
            type="button"
            onClick={() => toggleSelect(item._id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
              isSelected
                ? "border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-900/30 text-blue-500 dark:text-blue-300 shadow-sm"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-500 dark:hover:text-blue-300"
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
