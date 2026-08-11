import type { DietV2OptionMacros } from "@/interfaces/IDietPlanV2";

import type { primaryMacroForCategory } from "./dietPlanV2Utils";

type PrimaryMacro = ReturnType<typeof primaryMacroForCategory>;

const MACRO_LABEL_HE: Record<keyof DietV2OptionMacros, string> = {
  protein: "חלבון",
  carbs: "פחמ׳",
  fat: "שומן",
  calories: "קל׳",
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
          onChange={(event) =>
            onChange("primary", Math.max(0, Number(event.target.value) || 0))
          }
          className="h-6 w-12 rounded border-0 bg-transparent px-1 text-center text-[13px] font-extrabold focus:bg-white focus:outline-none dark:focus:bg-slate-900"
        />
        <span className="text-[10px]">ג׳</span>
      </span>
    )}
    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50/40 px-2 py-1 font-bold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
      <span className="text-[10px]">קל׳</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={calories || ""}
        onChange={(event) =>
          onChange("calories", Math.max(0, Number(event.target.value) || 0))
        }
        className="h-6 w-14 rounded border-0 bg-transparent px-1 text-center text-[13px] font-extrabold focus:bg-white focus:outline-none dark:focus:bg-slate-900"
      />
    </span>
  </div>
);
