import { useEffect, useRef, useState } from "react";
import { FaCopy, FaPlus } from "react-icons/fa6";

export interface MealSibling {
  id: string;
  name: string;
  index: number;
}

interface CopyCategoryButtonProps {
  categoryLabel: string;
  siblingMeals: MealSibling[];
  onCopyToMeal: (targetMealId: string) => void;
  onCopyToNewMeal?: () => void;
  disabled?: boolean;
}

const FLASH_KEY_NEW_MEAL = "__new__";
const FLASH_DURATION_MS = 550;

const CopyCategoryButton: React.FC<CopyCategoryButtonProps> = ({
  categoryLabel,
  siblingMeals,
  onCopyToMeal,
  onCopyToNewMeal,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);

    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const flashAndClose = (key: string) => {
    setFlashKey(key);
    window.setTimeout(() => {
      setFlashKey((prev) => (prev === key ? null : prev));
      setOpen(false);
    }, FLASH_DURATION_MS);
  };

  const handleCopyToExisting = (targetId: string) => {
    onCopyToMeal(targetId);
    flashAndClose(targetId);
  };

  const handleCopyToNew = () => {
    if (!onCopyToNewMeal) return;
    onCopyToNewMeal();
    flashAndClose(FLASH_KEY_NEW_MEAL);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        title={`העתק את ${categoryLabel} לארוחה אחרת`}
        aria-label="העתק קטגוריה"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 dark:hover:bg-blue-950/40"
      >
        <FaCopy size={12} />
      </button>

      {open && (
        <div
          dir="rtl"
          className="absolute left-0 top-full z-30 mt-1 w-60 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-500/10 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
            העתק {categoryLabel} לארוחה:
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {siblingMeals.map((sibling) => (
              <SiblingRow
                key={sibling.id}
                sibling={sibling}
                isFlashing={flashKey === sibling.id}
                onSelect={() => handleCopyToExisting(sibling.id)}
              />
            ))}
            {onCopyToNewMeal && (
              <NewMealRow
                hasSiblings={siblingMeals.length > 0}
                isFlashing={flashKey === FLASH_KEY_NEW_MEAL}
                onSelect={handleCopyToNew}
              />
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

interface SiblingRowProps {
  sibling: MealSibling;
  isFlashing: boolean;
  onSelect: () => void;
}

const SiblingRow: React.FC<SiblingRowProps> = ({ sibling, isFlashing, onSelect }) => (
  <li>
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-right text-xs font-semibold transition-colors ${
        isFlashing
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
          : "text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-blue-950/40 dark:hover:text-blue-200"
      }`}
    >
      <span className="truncate">{sibling.name}</span>
      <span className="text-[10px] text-slate-400 dark:text-slate-500">
        {isFlashing ? "הועתק ✓" : `#${sibling.index}`}
      </span>
    </button>
  </li>
);

interface NewMealRowProps {
  hasSiblings: boolean;
  isFlashing: boolean;
  onSelect: () => void;
}

const NewMealRow: React.FC<NewMealRowProps> = ({ hasSiblings, isFlashing, onSelect }) => (
  <li className={hasSiblings ? "mt-1 border-t border-slate-100 pt-1 dark:border-slate-800" : ""}>
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-right text-xs font-bold transition-colors ${
        isFlashing
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
          : "text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        <FaPlus size={9} />
        ארוחה חדשה
      </span>
      <span className="text-[10px] text-slate-400 dark:text-slate-500">
        {isFlashing ? "נוצרה ✓" : "צור והעתק"}
      </span>
    </button>
  </li>
);

export default CopyCategoryButton;
