import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookmarkCheck,
  Flame,
  History,
  Minus,
  PlusCircle,
  Save,
  Trash2,
  Utensils,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  clearDietPlanHistory,
  MACRO_LABELS,
  readDietPlanHistory,
  type DietPlanChangeSummary,
  type DietPlanHistoryEntry,
  type DietPlanHistoryType,
  type MacroKey,
} from "./dietPlanHistory";

interface Props {
  userId: string;
  children: React.ReactNode;
}

const TYPE_META: Record<
  DietPlanHistoryType,
  { icon: React.ReactNode; bg: string; text: string; label: string }
> = {
  save: {
    icon: <Save size={16} strokeWidth={2} />,
    bg: "bg-blue-200 dark:bg-blue-900/60",
    text: "text-blue-800 dark:text-blue-200",
    label: "עדכון",
  },
  "preset-loaded": {
    icon: <BookmarkCheck size={16} strokeWidth={2} />,
    bg: "bg-indigo-200 dark:bg-indigo-900/60",
    text: "text-indigo-800 dark:text-indigo-200",
    label: "טעינת תבנית",
  },
  created: {
    icon: <PlusCircle size={16} strokeWidth={2} />,
    bg: "bg-sky-200 dark:bg-sky-900/60",
    text: "text-sky-700 dark:text-sky-200",
    label: "יצירה",
  },
};

const formatRelative = (iso: string): string => {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((startOfToday.getTime() - d.getTime()) / 86400000);
  if (diffDays < 0) return `היום ${time}`;
  if (diffDays === 0) return `היום ${time}`;
  if (diffDays === 1) return `אתמול ${time}`;
  const shortDate = d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" });
  if (diffDays < 7) return `${shortDate} · ${time}`;

  return d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatAbsolute = (iso: string): string => {
  try {
    const d = new Date(iso);

    return d.toLocaleString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const DietPlanHistoryDialog: React.FC<Props> = ({ userId, children }) => {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<DietPlanHistoryEntry[]>([]);
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEntries(readDietPlanHistory(userId));
    setConfirmingClear(false);
  }, [open, userId]);

  const handleClear = () => {
    clearDietPlanHistory(userId);
    setEntries([]);
    setConfirmingClear(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        dir="rtl"
        align="end"
        sideOffset={8}
        collisionPadding={16}
        style={{
          maxHeight: "min(var(--radix-popover-content-available-height, 75vh), 75vh)",
        }}
        className="flex w-[520px] flex-col gap-4 border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-200 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
            <History size={16} strokeWidth={2} />
          </span>
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              היסטוריית שינויים
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              שמירות, טעינת תבניות ושינויים על תפריט התזונה
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pl-1">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center dark:border-slate-800 dark:bg-slate-950/30">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <History size={18} strokeWidth={2} />
              </span>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                אין עדיין היסטוריה
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                ברגע שתשמור תפריט או תטען תבנית — הפעולה תיכתב כאן.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {entries.map((entry) => {
                const meta = TYPE_META[entry.type];

                return (
                  <li
                    key={entry.id}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.text}`}
                    >
                      {meta.icon}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          {meta.label}
                        </span>
                        <span
                          className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                          title={formatAbsolute(entry.timestamp)}
                        >
                          {formatRelative(entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {entry.description}
                      </p>
                      {entry.details ? (
                        <ChangeDetails details={entry.details} />
                      ) : (
                        <p className="mt-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs italic text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
                          פרטי השינוי לא נשמרו לרשומה זו.
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {entries.length > 0 && (
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400">
              {entries.length} רשומות
            </span>
            {confirmingClear ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingClear(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  ביטול
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-rose-500/25 transition-all hover:-translate-y-0.5 hover:bg-rose-700"
                >
                  <Trash2 size={12} strokeWidth={2} />
                  כן, מחק את הכל
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingClear(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <Trash2 size={12} strokeWidth={2} />
                נקה היסטוריה
              </button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

const DiffRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  before: number;
  after: number;
  unit?: string;
}> = ({ icon, label, before, after, unit }) => {
  const delta = after - before;
  const up = delta > 0;
  const down = delta < 0;
  const toneClass = up
    ? "text-emerald-700 dark:text-emerald-300"
    : down
    ? "text-rose-700 dark:text-rose-300"
    : "text-slate-500 dark:text-slate-400";
  const DeltaIcon = up ? ArrowUpRight : down ? ArrowDownRight : Minus;
  const suffix = unit ? ` ${unit}` : "";

  return (
    <li className="flex items-center justify-between gap-3 text-xs">
      <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        {label}
      </span>
      <span className="inline-flex items-center gap-1.5 font-semibold">
        <span className="text-slate-500 dark:text-slate-400">
          {before}
          {suffix}
        </span>
        <span className="text-slate-300 dark:text-slate-600">←</span>
        <span className="text-slate-800 dark:text-slate-100">
          {after}
          {suffix}
        </span>
        <span className={`inline-flex items-center gap-0.5 ${toneClass}`}>
          <DeltaIcon size={11} strokeWidth={2.5} />
          {delta === 0 ? "" : Math.abs(delta)}
        </span>
      </span>
    </li>
  );
};

const MACRO_ICON: Record<MacroKey, string> = {
  protein: "🥩",
  carbs: "🍚",
  fats: "🥑",
  veggies: "🥦",
};

const ChangeDetails: React.FC<{ details: DietPlanChangeSummary }> = ({ details }) => {
  const { macros, freeCalories, mealCount } = details;
  const hasAnything = macros.length > 0 || !!freeCalories || !!mealCount;
  if (!hasAnything) {
    return (
      <p className="mt-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs italic text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
        לא נרשמו שינויים במאקרו או במספר הארוחות.
      </p>
    );
  }

  return (
    <ul className="mt-2 flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40">
      {mealCount && (
        <DiffRow
          icon={<Utensils size={11} strokeWidth={2} />}
          label="מספר ארוחות"
          before={mealCount.before}
          after={mealCount.after}
        />
      )}
      {macros.map((m) => (
        <DiffRow
          key={m.key}
          icon={<span className="text-[11px]">{MACRO_ICON[m.key]}</span>}
          label={`${MACRO_LABELS[m.key]} (מנות)`}
          before={m.before}
          after={m.after}
        />
      ))}
      {freeCalories && (
        <DiffRow
          icon={<Flame size={11} strokeWidth={2} />}
          label="קלוריות חופשיות"
          before={freeCalories.before}
          after={freeCalories.after}
          unit="קק״ל"
        />
      )}
    </ul>
  );
};

export default DietPlanHistoryDialog;
