import { useState } from "react";
import { FaChevronDown, FaTrashCan } from "react-icons/fa6";

import type { DietV2Option, DietV2OptionMacros, DietV2Unit } from "@/interfaces/IDietPlanV2";
import { DIET_V2_UNIT_LABELS, DIET_V2_UNITS } from "@/interfaces/IDietPlanV2";

import { scaleMacrosForQuantity } from "./dietPlanV2RecentFoods";

interface OptionRowProps {
  option: DietV2Option;
  onChange: (option: DietV2Option) => void;
  onRemove: () => void;
}

const OptionRow: React.FC<OptionRowProps> = ({ option, onChange, onRemove }) => {
  const [expanded, setExpanded] = useState(false);
  const [unitNeedsReview, setUnitNeedsReview] = useState(false);

  const onQuantityChange = (raw: string) => {
    const quantity = Math.max(0, Number(raw) || 0);
    onChange({
      ...option,
      quantity,
      macros: scaleMacrosForQuantity(option.macros, option.quantity, quantity),
    });
  };

  const onUnitChange = (unit: DietV2Unit) => {
    onChange({ ...option, unit });
    setUnitNeedsReview(true);
    setExpanded(true);
  };

  const onMacroChange = (key: keyof DietV2OptionMacros, raw: string) => {
    onChange({
      ...option,
      macros: { ...option.macros, [key]: Math.max(0, Number(raw) || 0) },
    });
    setUnitNeedsReview(false);
  };

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-2 rounded-md border border-slate-300/70 bg-slate-100 px-2.5 py-2 dark:border-slate-600/60 dark:bg-slate-800/70"
    >
      <div className="flex items-center gap-1.5">
        <input
          value={option.foodName}
          onChange={(event) => onChange({ ...option, foodName: event.target.value })}
          aria-label="שם המאכל"
          className="min-w-0 flex-1 bg-transparent text-[14px] font-bold text-slate-800 focus:outline-none dark:text-slate-100"
        />
        <div className="flex h-7 shrink-0 items-stretch overflow-hidden rounded-md border border-blue-200 bg-white dark:border-blue-900/40 dark:bg-slate-900">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={option.quantity || ""}
            onChange={(event) => onQuantityChange(event.target.value)}
            aria-label="כמות"
            className="w-14 border-0 bg-transparent px-1 text-center text-[12px] font-medium focus:outline-none"
          />
          <select
            value={option.unit}
            onChange={(event) => onUnitChange(event.target.value as DietV2Unit)}
            aria-label="יחידת מדידה"
            className="border-0 border-r border-blue-100 bg-transparent px-1 text-[12px] text-slate-500 focus:outline-none dark:border-blue-900/40"
          >
            {DIET_V2_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {DIET_V2_UNIT_LABELS[unit]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          aria-label={expanded ? "הסתר ערכים תזונתיים" : "ערוך ערכים תזונתיים"}
          onClick={() => setExpanded((current) => !current)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40"
        >
          <FaChevronDown size={10} className={expanded ? "rotate-180" : ""} />
        </button>
        <button
          type="button"
          aria-label="הסר אפשרות"
          onClick={onRemove}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
        >
          <FaTrashCan size={10} />
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-2 dark:border-slate-700 sm:grid-cols-4">
          <MacroField label="חלבון" value={option.macros.protein} onChange={(raw) => onMacroChange("protein", raw)} />
          <MacroField label="פחמימות" value={option.macros.carbs} onChange={(raw) => onMacroChange("carbs", raw)} />
          <MacroField label="שומן" value={option.macros.fat} onChange={(raw) => onMacroChange("fat", raw)} />
          <MacroField label="קלוריות" value={option.macros.calories} onChange={(raw) => onMacroChange("calories", raw)} />
          {unitNeedsReview && (
            <p className="col-span-2 text-[10px] font-bold text-amber-700 dark:text-amber-400 sm:col-span-4">
              יחידת המדידה השתנתה. הערכים לא הומרו אוטומטית — יש לבדוק ולעדכן אותם.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const MacroField: React.FC<{
  label: string;
  value: number;
  onChange: (raw: string) => void;
}> = ({ label, value, onChange }) => (
  <label className="flex flex-col gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
    {label}
    <input
      type="number"
      min={0}
      step="any"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 focus:border-blue-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    />
  </label>
);

export default OptionRow;
