import type { DietV2OptionMacros } from "@/interfaces/IDietPlanV2";

import type { primaryMacroForCategory } from "./dietPlanV2Utils";

type PrimaryMacro = ReturnType<typeof primaryMacroForCategory>;

const MACRO_LABEL_HE: Record<keyof DietV2OptionMacros, string> = {
  protein: "חלבון",
  carbs: "פחמ׳",
  fat: "שומן",
  calories: "קל׳",
};

interface CategoryAverageBadgesProps {
  primaryMacro: PrimaryMacro;
  primaryAvg: number;
  calAvg: number;
  hasOptions: boolean;
  reliableCount: number;
  estimatedCount: number;
}

export const CategoryAverageBadges: React.FC<CategoryAverageBadgesProps> = ({
  primaryMacro,
  primaryAvg,
  calAvg,
  hasOptions,
  reliableCount,
  estimatedCount,
}) => {
  if (!hasOptions) {
    return (
      <span className="text-[10px] italic text-slate-400 dark:text-slate-500">
        הוסף אפשרות להחלפה כדי לראות ממוצע
      </span>
    );
  }

  if (reliableCount === 0) {
    return (
      <span
        className="text-[10px] italic text-amber-600 dark:text-amber-300"
        title="כל האפשרויות להחלפה בקטגוריה מסומנות כמוערכות ולא נכללות בממוצע"
      >
        כל האפשרויות להחלפה מוערכות — לא נכלל בממוצע
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
      {primaryMacro && (
        <span className="inline-flex items-baseline gap-1 rounded-md bg-blue-100 px-2 py-0.5 font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          <span>{MACRO_LABEL_HE[primaryMacro]}</span>
          <strong className="text-[12px]">{primaryAvg}</strong>
          <span className="text-[10px]">ג׳</span>
        </span>
      )}
      <span className="inline-flex items-baseline gap-1 rounded-md bg-rose-50 px-2 py-0.5 font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
        <span>≈</span>
        <strong className="text-[12px]">{Math.round(calAvg)}</strong>
        <span className="text-[10px]">קל׳</span>
      </span>
      {estimatedCount > 0 && (
        <span
          className="text-[10px] italic text-amber-600 dark:text-amber-300"
          title="אפשרויות להחלפה מוערכות לא נכללות בממוצע"
        >
          ({estimatedCount} לא נכללות)
        </span>
      )}
    </div>
  );
};

interface CategoryManualInputsProps {
  primaryMacro: PrimaryMacro;
  primaryGrams: number;
  calories: number;
  onChange: (field: "primary" | "calories", value: number) => void;
}

export const CategoryManualInputs: React.FC<CategoryManualInputsProps> = ({
  primaryMacro,
  primaryGrams,
  calories,
  onChange,
}) => (
  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
    {primaryMacro && (
      <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50/40 px-2 py-1 font-bold text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
        <span className="text-[10px]">{MACRO_LABEL_HE[primaryMacro]}</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={primaryGrams || ""}
          onChange={(e) => onChange("primary", Math.max(0, Number(e.target.value) || 0))}
          className="h-6 w-12 rounded border-0 bg-transparent px-1 text-center text-[13px] font-extrabold focus:bg-white focus:outline-none dark:focus:bg-slate-900"
        />
        <span className="text-[10px]">ג׳</span>
      </span>
    )}
    <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50/40 px-2 py-1 font-bold text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
      <span className="text-[10px]">קל׳</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={calories || ""}
        onChange={(e) => onChange("calories", Math.max(0, Number(e.target.value) || 0))}
        className="h-6 w-14 rounded border-0 bg-transparent px-1 text-center text-[13px] font-extrabold focus:bg-white focus:outline-none dark:focus:bg-slate-900"
      />
    </span>
  </div>
);
