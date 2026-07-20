import { useState } from "react";
import { FaPlus, FaTrashCan } from "react-icons/fa6";

import {
  splitNameAndDose,
  SUPP_UNIT_LABELS,
  type DietV2Supplement,
  type DietV2SupplementUnit,
} from "./dietPlanV2Supplements";

interface SupplementsPanelProps {
  items: DietV2Supplement[];
  onAdd: (name: string, doseAmount: number, doseUnit: DietV2SupplementUnit) => void;
  onUpdate: (id: string, patch: Partial<Omit<DietV2Supplement, "id">>) => void;
  onRemove: (id: string) => void;
}

const SupplementsPanel: React.FC<SupplementsPanelProps> = ({
  items,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [draft, setDraft] = useState("");

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const { name, amount, unit } = splitNameAndDose(trimmed);
    onAdd(name, amount, unit);
    setDraft("");
  };

  const isEmpty = items.length === 0;

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900/40 dark:bg-slate-900">
      <header className="mb-3 flex flex-wrap items-center gap-3">
        <h3 className="shrink-0 text-sm font-bold text-slate-900 dark:text-slate-100">תוספים</h3>
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/40 px-2 py-1 focus-within:border-blue-500 focus-within:bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            <FaPlus size={9} />
          </span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder='למשל: "קריאטין 5 גרם ביום"'
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim()}
            className="shrink-0 rounded-md brand-gradient brand-gradient-hover px-3 py-1 text-[11px] font-bold text-white shadow-sm shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            הוסף
          </button>
        </div>
      </header>

      {isEmpty ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-xs italic text-slate-400 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-500">
          אין תוספים עדיין. הוסף תוסף ראשון למעלה.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <SupplementRow
              key={item.id}
              item={item}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

interface SupplementRowProps {
  item: DietV2Supplement;
  onUpdate: (id: string, patch: Partial<Omit<DietV2Supplement, "id">>) => void;
  onRemove: (id: string) => void;
}

const SupplementRow: React.FC<SupplementRowProps> = ({ item, onUpdate, onRemove }) => (
  <li className="group flex items-center gap-2 rounded-lg border border-blue-100 bg-white px-2.5 py-1.5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 dark:border-blue-900/40 dark:bg-slate-900">
    <input
      value={item.name}
      onChange={(e) => onUpdate(item.id, { name: e.target.value })}
      placeholder="שם"
      className="min-w-0 flex-1 border-0 bg-transparent text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
    />
    <input
      type="number"
      inputMode="numeric"
      min={0}
      value={item.doseAmount || ""}
      onChange={(e) =>
        onUpdate(item.id, { doseAmount: Math.max(0, Number(e.target.value) || 0) })
      }
      placeholder="0"
      aria-label="כמות מינון"
      className="w-12 rounded-md border border-slate-200 bg-white px-1 text-center text-xs font-bold text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    />
    <SupplementUnitToggle
      value={item.doseUnit}
      onChange={(next) => onUpdate(item.id, { doseUnit: next })}
    />
    <button
      type="button"
      aria-label="הסר תוסף"
      onClick={() => onRemove(item.id)}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600 group-hover:text-slate-400 dark:hover:bg-rose-950/40"
    >
      <FaTrashCan size={10} />
    </button>
  </li>
);

const SupplementUnitToggle: React.FC<{
  value: DietV2SupplementUnit;
  onChange: (next: DietV2SupplementUnit) => void;
}> = ({ value, onChange }) => {
  const options: DietV2SupplementUnit[] = ["g", "ml", "pill"];

  return (
    <div
      role="radiogroup"
      aria-label="יחידת מינון"
      className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-950/40"
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt)}
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
              active
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300"
            }`}
          >
            {SUPP_UNIT_LABELS[opt]}
          </button>
        );
      })}
    </div>
  );
};

export default SupplementsPanel;
