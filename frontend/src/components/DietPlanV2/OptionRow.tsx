import { useEffect, useRef, useState } from "react";
import { FaTrashCan } from "react-icons/fa6";

import type { DietV2Option, DietV2Unit } from "@/interfaces/IDietPlanV2";
import { DIET_V2_UNIT_LABELS, DIET_V2_UNITS } from "@/interfaces/IDietPlanV2";

import {
  computeMacrosFromFood,
  estimateMacrosForUnknown,
  isConvertedUnit,
  MOCK_FOOD_LIBRARY,
} from "./dietPlanV2Utils";
import { searchOpenFoodFacts } from "./openFoodFactsAdapter";
import type { DietV2CategoryKind } from "@/interfaces/IDietPlanV2";

interface OptionRowProps {
  option: DietV2Option;
  categoryKind: DietV2CategoryKind;
  onChange: (option: DietV2Option) => void;
  onRemove: () => void;
}

const isCompoundEntry = (foodName: string): boolean =>
  /[+,]/.test(foodName) || / ו-?/.test(foodName);

const OptionRow: React.FC<OptionRowProps> = ({ option, categoryKind, onChange, onRemove }) => {
  const [expanded, setExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const isCompound = isCompoundEntry(option.foodName);
  const lastTriedNameRef = useRef<string | null>(null);
  const optionRef = useRef(option);
  optionRef.current = option;

  useEffect(() => {
    if (!option.estimated) return;
    if (lastTriedNameRef.current === option.foodName) return;
    lastTriedNameRef.current = option.foodName;

    let cancelled = false;
    searchOpenFoodFacts(option.foodName, 3)
      .then((results) => {
        if (cancelled) return;
        const best = results[0];
        if (!best) return;
        const latest = optionRef.current;
        const upgradedMacros = computeMacrosFromFood(best, latest.quantity, latest.unit);
        onChange({
          ...latest,
          foodName: best.name,
          macros: upgradedMacros,
          estimated: false,
          cloudSourced: true,
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [option.estimated, option.foodName, onChange]);

  const onQuantityChange = (raw: string) => {
    const quantity = Math.max(0, Number(raw) || 0);
    const food = MOCK_FOOD_LIBRARY.find((item) => item.name === option.foodName);
    const macros = food
      ? computeMacrosFromFood(food, quantity, option.unit)
      : estimateMacrosForUnknown(quantity, option.unit, categoryKind);
    const estimated = food ? isConvertedUnit(food, option.unit) : true;
    onChange({ ...option, quantity, macros, estimated });
  };

  const onUnitChange = (unit: DietV2Unit) => {
    const food = MOCK_FOOD_LIBRARY.find((item) => item.name === option.foodName);
    const macros = food
      ? computeMacrosFromFood(food, option.quantity, unit)
      : estimateMacrosForUnknown(option.quantity, unit, categoryKind);
    const estimated = food ? isConvertedUnit(food, unit) : true;
    onChange({ ...option, unit, macros, estimated });
  };

  return (
    <div
      dir="rtl"
      onClick={() => {
        if (!editingName) {
          setEditingName(true);
          setExpanded(true);
        }
      }}
      className={`group flex flex-col gap-1 rounded-md border border-slate-400/60 bg-slate-100 px-2 py-1.5 transition-all hover:bg-blue-100/80 dark:border-slate-500/50 dark:bg-slate-800/70 dark:hover:bg-blue-950/50 ${
        editingName ? "" : "cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {editingName ? (
          <input
            autoFocus
            value={option.foodName}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onChange({ ...option, foodName: e.target.value })}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                setEditingName(false);
              }
            }}
            aria-label="שם המאכל"
            className="min-w-0 flex-1 rounded border border-blue-300 bg-white px-1.5 py-0.5 text-[15px] font-bold text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200/60 dark:border-blue-900/60 dark:bg-slate-900 dark:text-slate-100"
          />
        ) : (
          <span
            className={`min-w-0 text-[15px] font-bold text-slate-800 dark:text-slate-100 ${
              expanded ? "break-words" : "truncate"
            }`}
            title="לחץ לעריכת השם"
          >
            {option.foodName}
          </span>
        )}
        <div className="ms-auto flex shrink-0 items-center gap-1.5">
          {!isCompound && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex h-6 shrink-0 items-stretch overflow-hidden rounded-md border border-blue-200 bg-white focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200/60 dark:border-blue-900/40 dark:bg-slate-900"
            >
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={option.quantity || ""}
                onChange={(e) => onQuantityChange(e.target.value)}
                aria-label="כמות"
                className="w-10 border-0 bg-transparent px-0.5 text-center text-[12px] font-medium text-slate-700 focus:outline-none dark:text-slate-200"
              />
              <span className="my-1 w-px bg-blue-100 dark:bg-blue-900/40" aria-hidden />
              <select
                value={option.unit}
                onChange={(e) => onUnitChange(e.target.value as DietV2Unit)}
                aria-label="יחידת מדידה"
                className="appearance-none border-0 bg-transparent px-1 text-[12px] font-medium text-slate-500 focus:outline-none dark:text-slate-400"
              >
                {DIET_V2_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {DIET_V2_UNIT_LABELS[unit]}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            aria-label="הסר אפשרות"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600 group-hover:text-slate-400 dark:hover:bg-rose-950/40"
          >
            <FaTrashCan size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionRow;
