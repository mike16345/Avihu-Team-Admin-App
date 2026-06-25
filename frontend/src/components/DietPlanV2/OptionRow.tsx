import { useEffect, useRef } from "react";
import { FaCloudArrowDown, FaRobot, FaTrashCan } from "react-icons/fa6";

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
  /** Category the row belongs to — needed to recompute estimated
   *  macros when quantity changes on an unknown food. */
  categoryKind: DietV2CategoryKind;
  /** Parent meal's macro mode. When "manual" we hide AI/cloud
   *  source badges and the per-option macro chips — the trainer is
   *  authoring values by hand and doesn't want auto-computed
   *  numbers cluttering the row. */
  macroMode?: DietV2MealMacroMode;
  onChange: (option: DietV2Option) => void;
  onRemove: () => void;
}

const OptionRow: React.FC<OptionRowProps> = ({ option, categoryKind, macroMode = "auto", onChange, onRemove }) => {
  const showAiMeta = macroMode !== "manual";
  // Background upgrade: when a row was added via Quick-Add and no
  // local food matched (estimated=true), try Open Food Facts once
  // for its name. On a hit we swap in the real macros and drop the
  // "estimated" flag. `lastTriedNameRef` prevents re-firing on
  // every quantity tweak — only re-runs when the foodName itself
  // changes (e.g. trainer edits the row to a different food).
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
        // Use the latest option state (in case quantity changed
        // between submit and the OFF response).
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
        // Network failure → leave the estimated row as-is.
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
      className="group flex flex-wrap items-center gap-3 rounded-2xl border border-blue-100 bg-white px-3.5 py-2.5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 dark:border-blue-900/40 dark:bg-slate-900 dark:hover:border-blue-800/60"
    >
      {/* Name + source badge */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
          {option.foodName}
        </span>
        {showAiMeta && <SourceBadge estimated={option.estimated} cloudSourced={option.cloudSourced} />}
      </div>

      {/* Macros chips — calorie hero + 3 micro pills. Hidden in
          manual mode (trainer authors meal-level macros, the
          options exist only as suggestions). */}
      {showAiMeta && (
        <div className="flex items-center gap-1.5">
          <MacroPill label="ח" value={option.macros.protein} tone="protein" />
          <MacroPill label="פ" value={option.macros.carbs} tone="carbs" />
          <MacroPill label="ש" value={option.macros.fat} tone="fat" />
          <span className="inline-flex items-baseline gap-1 rounded-lg bg-rose-50 px-2.5 py-1 font-extrabold text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
            <span className="text-[10px]">≈</span>
            <strong className="text-sm">{option.macros.calories}</strong>
            <span className="text-[10px]">קל׳</span>
          </span>
        </div>
      )}

      {/* Quantity + unit — segmented control for visual cohesion */}
      <div className="flex h-9 items-stretch overflow-hidden rounded-lg border border-blue-200 bg-white shadow-inner shadow-blue-50/40 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200/60 dark:border-blue-900/40 dark:bg-slate-900">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={option.quantity || ""}
          onChange={(e) => onQuantityChange(e.target.value)}
          className="w-16 border-0 bg-transparent px-2 text-center text-sm font-extrabold text-slate-800 focus:outline-none dark:text-slate-100"
        />
        <span className="my-1 w-px bg-blue-100 dark:bg-blue-900/40" aria-hidden />
        <select
          value={option.unit}
          onChange={(e) => onUnitChange(e.target.value as DietV2Unit)}
          className="appearance-none border-0 bg-transparent px-3 text-xs font-bold text-slate-700 focus:outline-none dark:text-slate-200"
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
        aria-label="הסר אופציה"
        onClick={onRemove}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600 group-hover:text-slate-400 dark:hover:bg-rose-950/40"
      >
        <FaTrashCan size={12} />
      </button>
    </div>
  );
};

interface SourceBadgeProps {
  estimated?: boolean;
  cloudSourced?: boolean;
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ estimated, cloudSourced }) => {
  if (estimated) {
    return (
      <span
        title="המאקרו מוערך לפי הקטגוריה — בודק במאגר הענן…"
        className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
      >
        <FaRobot size={8} />
        מוערך
      </span>
    );
  }
  if (cloudSourced) {
    return (
      <span
        title="המאקרו נמשך ממאגר Open Food Facts"
        className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
      >
        <FaCloudArrowDown size={8} />
        ענן
      </span>
    );
  }
  return (
    <span
      title="המאקרו חושב אוטומטית ממסד הנתונים"
      className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
    >
      <FaRobot size={8} />
      AI
    </span>
  );
};

type MacroTone = "protein" | "carbs" | "fat";
const MACRO_TONES: Record<MacroTone, string> = {
  protein: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  carbs: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  fat: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
};

const MacroPill: React.FC<{ label: string; value: number; tone: MacroTone }> = ({
  label,
  value,
  tone,
}) => (
  <span
    className={`inline-flex items-baseline gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${MACRO_TONES[tone]}`}
  >
    <span>{label}</span>
    <strong className="text-[12px]">{value}</strong>
  </span>
);

export default OptionRow;
