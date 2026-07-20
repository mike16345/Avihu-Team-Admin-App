import { useEffect, useRef, useState } from "react";
import { FaTrashCan } from "react-icons/fa6";

import type { DietV2MealMacroMode, DietV2Option, DietV2Unit } from "@/interfaces/IDietPlanV2";
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
  macroMode?: DietV2MealMacroMode;
  onChange: (option: DietV2Option) => void;
  onRemove: () => void;
}

const isCompoundEntry = (foodName: string): boolean =>
  /[+,]/.test(foodName) || / ו-?/.test(foodName);

const OptionRow: React.FC<OptionRowProps> = ({ option, categoryKind, macroMode = "auto", onChange, onRemove }) => {
  const showAiMeta = macroMode !== "manual";
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
      .catch(() => {
      });

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
      className={`group flex flex-col gap-1 rounded-md bg-slate-100 px-2 py-1.5 transition-all hover:bg-blue-100/80 dark:bg-slate-800/70 dark:hover:bg-blue-950/50 ${
        editingName ? "" : "cursor-pointer"
      }`}
    >
      {/* Row header: name + inline qty/unit editor + delete. The
          quantity control lives here (not duplicated in the expanded
          view) so the trainer edits in place. stopPropagation on the
          inputs so clicking them doesn't toggle the row. */}
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
            className="min-w-0 flex-1 rounded border border-blue-300 bg-white px-1.5 py-0.5 text-[13px] font-bold text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200/60 dark:border-blue-900/60 dark:bg-slate-900 dark:text-slate-100"
          />
        ) : (
          <span
            className={`min-w-0 text-[13px] font-bold text-slate-800 dark:text-slate-100 ${
              expanded ? "break-words" : "truncate"
            }`}
            title="לחץ לעריכת השם"
          >
            {option.foodName}
          </span>
        )}
        {/* Trailing controls — quantity editor (when applicable) and
            trash sit in a shared group so the quantity is ALWAYS
            adjacent to the trash. The whole group is pushed to the
            end via ms-auto, so there's never a stray gap between qty
            and trash regardless of the food name's length. */}
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
                className="w-10 border-0 bg-transparent px-0.5 text-center text-[11px] font-extrabold text-slate-800 focus:outline-none dark:text-slate-100"
              />
              <span className="my-1 w-px bg-blue-100 dark:bg-blue-900/40" aria-hidden />
              <select
                value={option.unit}
                onChange={(e) => onUnitChange(e.target.value as DietV2Unit)}
                aria-label="יחידת מדידה"
                className="appearance-none border-0 bg-transparent px-1 text-[10px] font-bold text-slate-600 focus:outline-none dark:text-slate-300"
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

      {/* Macros row — in AI (auto) mode we ALWAYS render the same
          template so trainers see one predictable layout across
          rows. Recognised foods show numbers; unrecognised rows
          leave the values blank with a "⚠ לבדוק" badge so the
          trainer knows to fill them in. */}
      {showAiMeta && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-blue-100 pt-2 text-[12px] text-slate-600 dark:border-blue-900/40 dark:text-slate-300">
          <MacroField label="חלבון" value={option.macros.protein} unit="גרם" empty={option.estimated} />
          <MacroField label="פחמימה" value={option.macros.carbs} unit="גרם" empty={option.estimated} />
          <MacroField label="שומן" value={option.macros.fat} unit="גרם" empty={option.estimated} />
          <MacroField
            label="קלוריות"
            value={option.macros.calories}
            unit="קל׳"
            tone="calories"
            empty={option.estimated}
          />
          <SourceBadge estimated={option.estimated} cloudSourced={option.cloudSourced} />
        </div>
      )}
    </div>
  );
};

interface SourceBadgeProps {
  estimated?: boolean;
  cloudSourced?: boolean;
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ estimated }) => {
  if (estimated) {
    return (
      <span
        title="המערכת לא זיהתה את המאכל במאגר — כדאי לבדוק את הערכים לפני שליחה"
        className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
      >
        ⚠ לבדוק
      </span>
    );
  }
  return null;
};

interface MacroFieldProps {
  label: string;
  value: number;
  unit: string;
  tone?: "default" | "calories";
  empty?: boolean;
}

const MacroField: React.FC<MacroFieldProps> = ({ label, value, unit, tone = "default", empty }) => (
  <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
    <span className="font-semibold text-slate-500 dark:text-slate-400">{label}:</span>
    {empty ? (
      <span className="text-[13px] font-bold text-slate-300 dark:text-slate-600">—</span>
    ) : (
      <strong
        className={
          tone === "calories"
            ? "text-[13px] font-extrabold text-rose-600 dark:text-rose-400"
            : "text-[13px] font-extrabold text-slate-800 dark:text-slate-100"
        }
      >
        {value}
      </strong>
    )}
    <span className="text-[10px] text-slate-400 dark:text-slate-500">{unit}</span>
  </span>
);

export default OptionRow;
