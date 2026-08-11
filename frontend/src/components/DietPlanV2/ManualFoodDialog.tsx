import { useEffect, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";

import type {
  DietV2CategoryKind,
  DietV2OptionMacros,
  DietV2Unit,
} from "@/interfaces/IDietPlanV2";
import { DIET_V2_UNIT_LABELS, DIET_V2_UNITS } from "@/interfaces/IDietPlanV2";

import { CATEGORY_LABELS } from "./dietPlanV2Utils";
import type { RecentFoodInput } from "./dietPlanV2RecentFoods";

interface ManualFoodDialogProps {
  open: boolean;
  categoryKind: DietV2CategoryKind;
  initialName: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (food: RecentFoodInput) => string | null;
}

const EMPTY_MACROS: DietV2OptionMacros = { protein: 0, carbs: 0, fat: 0, calories: 0 };

const ManualFoodDialog: React.FC<ManualFoodDialogProps> = ({
  open,
  categoryKind,
  initialName,
  onOpenChange,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState<DietV2Unit>("g");
  const [macros, setMacros] = useState<DietV2OptionMacros>(EMPTY_MACROS);
  const [error, setError] = useState("");
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initialName.trim());
    setQuantity(100);
    setUnit("g");
    setMacros(EMPTY_MACROS);
    setError("");
    requestAnimationFrame(() => nameInputRef.current?.focus());
  }, [initialName, open]);

  if (!open) return null;

  const updateMacro = (key: keyof DietV2OptionMacros, raw: string) => {
    setMacros((current) => ({ ...current, [key]: Math.max(0, Number(raw) || 0) }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("יש להזין שם מאכל");
      return;
    }
    if (quantity <= 0) {
      setError("הכמות חייבת להיות גדולה מאפס");
      return;
    }

    const submitError = onSubmit({
      displayName: name,
      categoryKind,
      referenceQuantity: quantity,
      unit,
      referenceMacros: macros,
    });
    if (submitError) {
      setError(submitError);
      return;
    }
    onOpenChange(false);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-20"
      onClick={() => onOpenChange(false)}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl shadow-blue-500/20 dark:border-blue-900/40 dark:bg-slate-900"
      >
        <header className="flex items-center gap-3 border-b border-blue-100 bg-blue-50/40 px-5 py-4 dark:border-blue-900/40 dark:bg-blue-950/20">
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">הוספת מאכל ידנית</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              הערכים מתייחסים לכמות שנבחרה ויישמרו לשימוש מהיר בקטגוריית {CATEGORY_LABELS[categoryKind]}
            </p>
          </div>
          <button
            type="button"
            aria-label="סגור"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <FaXmark size={13} />
          </button>
        </header>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">שם המאכל</span>
            <input
              ref={nameInputRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <NumberField label="כמות" value={quantity} onChange={setQuantity} />
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">יחידת מדידה</span>
            <select
              value={unit}
              onChange={(event) => setUnit(event.target.value as DietV2Unit)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
            >
              {DIET_V2_UNITS.map((value) => (
                <option key={value} value={value}>
                  {DIET_V2_UNIT_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <NumberField label="חלבון (גרם)" value={macros.protein} onChange={(value) => updateMacro("protein", String(value))} />
          <NumberField label="פחמימות (גרם)" value={macros.carbs} onChange={(value) => updateMacro("carbs", String(value))} />
          <NumberField label="שומן (גרם)" value={macros.fat} onChange={(value) => updateMacro("fat", String(value))} />
          <NumberField label="קלוריות" value={macros.calories} onChange={(value) => updateMacro("calories", String(value))} />
          {error && <p className="text-xs font-bold text-rose-600 sm:col-span-2">{error}</p>}
        </div>

        <footer className="flex justify-start gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
          <button
            type="submit"
            className="rounded-lg brand-gradient brand-gradient-hover px-5 py-2 text-xs font-bold text-white"
          >
            הוסף ושמור לשימוש מהיר
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-slate-200 px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ביטול
          </button>
        </footer>
      </form>
    </div>
  );
};

const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
}> = ({ label, value, onChange }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</span>
    <input
      type="number"
      min={0}
      step="any"
      value={value}
      onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
    />
  </label>
);

export default ManualFoodDialog;
