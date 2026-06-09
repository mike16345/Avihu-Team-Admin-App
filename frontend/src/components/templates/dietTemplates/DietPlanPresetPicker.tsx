/**
 * DietPlanPresetPicker — modal picker for choosing a diet-plan preset
 * to load into a trainee's menu.
 *
 * Same filter language as DietPlanPresetGrid (search + per-category
 * dropdowns) so the trainer scans the same way whether they're
 * managing the library or picking one for a client. Selecting a card
 * fires `onSelect(preset)` and closes the dialog.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { IDietPlanPreset, DietaryRestriction, DietGoal } from "@/interfaces/IDietPlan";
import {
  dietGoalLabel,
  dietGoalOptions,
  dietGoalTone,
  dietaryRestrictionLabel,
  dietaryRestrictionOptions,
  dietaryRestrictionTone,
  CALORIE_BUCKETS,
  calorieBucketFor,
  CalorieBucket,
  PROTEIN_OPTIONS,
  CARB_OPTIONS,
  FAT_OPTIONS,
  FREE_CAL_OPTIONS,
  matchesServings,
  matchesFreeCal,
} from "@/lib/dietMeta";
import { useUsersStore } from "@/store/userStore";
import { useSubTrainersQuery } from "@/hooks/queries/subTrainers/useSubTrainersQuery";
import {
  FaMagnifyingGlass,
  FaUtensils,
  FaFire,
  FaDrumstickBite,
  FaBreadSlice,
  FaDroplet,
  FaUser,
  FaCheck,
  FaChevronDown,
} from "react-icons/fa6";

type Preset = IDietPlanPreset & { _id?: string };

interface DietPlanPresetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: Preset[];
  onSelect: (preset: Preset) => void;
}

const toggle = <T,>(arr: T[], val: T): T[] =>
  arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

const DietPlanPresetPicker: React.FC<DietPlanPresetPickerProps> = ({
  open,
  onOpenChange,
  presets,
  onSelect,
}) => {
  const [search, setSearch] = useState("");
  const [goals, setGoals] = useState<DietGoal[]>([]);
  const [buckets, setBuckets] = useState<CalorieBucket[]>([]);
  const [proteinB, setProteinB] = useState<string[]>([]);
  const [carbB, setCarbB] = useState<string[]>([]);
  const [fatB, setFatB] = useState<string[]>([]);
  const [freeCalB, setFreeCalB] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([]);
  const [builders, setBuilders] = useState<string[]>([]);
  // Meal-count filter — derived from preset.meals.length.
  const [mealCounts, setMealCounts] = useState<string[]>([]);

  const currentUser = useUsersStore((s) => s.currentUser);
  const { data: subTrainers = [] } = useSubTrainersQuery();

  const builderOptions = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    if (currentUser?._id) {
      list.push({
        value: currentUser._id,
        label: `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || "אני",
      });
    }
    subTrainers.forEach((t) => {
      if (t._id) list.push({ value: t._id, label: t.fullName || "ללא שם" });
    });
    return list;
  }, [currentUser, subTrainers]);

  const builderLabel = (id?: string) => builderOptions.find((b) => b.value === id)?.label;

  // Reset filters when the dialog opens fresh
  useEffect(() => {
    if (open) {
      setSearch("");
      setGoals([]);
      setBuckets([]);
      setProteinB([]);
      setCarbB([]);
      setFatB([]);
      setFreeCalB([]);
      setRestrictions([]);
      setBuilders([]);
      setMealCounts([]);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return presets.filter((p) => {
      if (q && !(p.name || "").toLowerCase().includes(q)) return false;
      if (goals.length && !(p.goal && goals.includes(p.goal))) return false;
      if (buckets.length) {
        const bucket = calorieBucketFor(p.calories);
        if (!bucket || !buckets.includes(bucket)) return false;
      }
      if (!matchesServings(p.proteinServings, proteinB)) return false;
      if (!matchesServings(p.carbServings, carbB)) return false;
      if (!matchesServings(p.fatServings, fatB)) return false;
      if (!matchesFreeCal((p as any).freeCalories, freeCalB)) return false;
      if (restrictions.length) {
        const r = p.dietaryRestrictions || [];
        if (!restrictions.every((x) => r.includes(x))) return false;
      }
      if (builders.length && !(p.builtByTrainerId && builders.includes(p.builtByTrainerId)))
        return false;
      if (mealCounts.length) {
        const n = (p as any).meals?.length ?? 0;
        if (!mealCounts.includes(String(n))) return false;
      }
      return true;
    });
  }, [presets, search, goals, buckets, proteinB, carbB, fatB, freeCalB, restrictions, builders, mealCounts]);

  const activeCount =
    goals.length +
    buckets.length +
    proteinB.length +
    carbB.length +
    fatB.length +
    freeCalB.length +
    restrictions.length +
    builders.length +
    mealCounts.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="flex h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0"
        style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
      >
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-200/60">
              <FaUtensils size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                בחירת תפריט תזונה
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                סנן לפי המאפיינים של המתאמן ובחר תפריט מתאים
              </p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 max-w-[320px]">
              <FaMagnifyingGlass
                size={11}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש לפי שם…"
                className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pr-8 pl-3 text-sm focus:border-blue-400 focus:outline-none focus:bg-white"
              />
            </div>

            <FilterDropdown
              label="סוג תפריט"
              options={dietGoalOptions}
              selected={goals}
              onToggle={(v) => setGoals(toggle(goals, v))}
            />
            <FilterDropdown
              label="קלוריות"
              options={CALORIE_BUCKETS.map((b) => ({ value: b.value, label: b.label }))}
              selected={buckets}
              onToggle={(v) => setBuckets(toggle(buckets, v as CalorieBucket))}
            />
            <FilterDropdown
              label="חלבון"
              options={PROTEIN_OPTIONS}
              selected={proteinB}
              onToggle={(v) => setProteinB(toggle(proteinB, v))}
            />
            <FilterDropdown
              label="פחמ׳"
              options={CARB_OPTIONS}
              selected={carbB}
              onToggle={(v) => setCarbB(toggle(carbB, v))}
            />
            <FilterDropdown
              label="שומן"
              options={FAT_OPTIONS}
              selected={fatB}
              onToggle={(v) => setFatB(toggle(fatB, v))}
            />
            <FilterDropdown
              label="חופשיות"
              options={FREE_CAL_OPTIONS}
              selected={freeCalB}
              onToggle={(v) => setFreeCalB(toggle(freeCalB, v))}
            />
            <FilterDropdown
              label="הגבלות"
              options={dietaryRestrictionOptions}
              selected={restrictions}
              onToggle={(v) => setRestrictions(toggle(restrictions, v as DietaryRestriction))}
            />
            <FilterDropdown
              label="מספר ארוחות"
              options={[1, 2, 3, 4, 5, 6, 7].map((n) => ({ value: String(n), label: String(n) }))}
              selected={mealCounts}
              onToggle={(v) => setMealCounts(toggle(mealCounts, v))}
            />

            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setGoals([]);
                  setBuckets([]);
                  setProteinB([]);
                  setCarbB([]);
                  setFatB([]);
                  setFreeCalB([]);
                  setRestrictions([]);
                  setBuilders([]);
                  setMealCounts([]);
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-rose-600"
              >
                נקה סינון
              </button>
            )}

            <span className="ms-auto text-xs text-slate-500">
              {filtered.length} {filtered.length === 1 ? "תפריט" : "תפריטים"}
              {filtered.length !== presets.length && ` מתוך ${presets.length}`}
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto bg-slate-50/40 dark:bg-slate-950/30 p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-400 shadow-sm">
                <FaUtensils size={18} />
              </div>
              <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                {presets.length === 0 ? "עדיין אין תפריטים שמורים" : "לא נמצא תפריט מתאים"}
              </p>
              <p className="max-w-sm text-xs text-slate-500">
                נסה לנקות חלק מהסינונים כדי לראות עוד תוצאות
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filtered.map((preset) => {
                const goalT = dietGoalTone(preset.goal);
                const goalL = dietGoalLabel(preset.goal);
                const restr = preset.dietaryRestrictions ?? [];
                return (
                  <button
                    type="button"
                    key={preset._id || preset.name}
                    onClick={() => {
                      onSelect(preset);
                      onOpenChange(false);
                    }}
                    className="group flex flex-col gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                          <FaUtensils size={12} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                            {preset.name || "ללא שם"}
                          </h3>
                          {(goalL || preset.calories) && (
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {[goalL, preset.calories ? `${preset.calories} קל׳` : null]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-0 transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:opacity-100">
                        <FaCheck size={10} />
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {goalL && goalT && (
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${goalT.bg} ${goalT.text} ${goalT.border}`}
                        >
                          {goalL}
                        </span>
                      )}
                      {typeof preset.calories === "number" && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                          <FaFire size={8} />
                          {preset.calories} קל׳
                        </span>
                      )}
                      {restr.map((r) => (
                        <span
                          key={r}
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${dietaryRestrictionTone.bg} ${dietaryRestrictionTone.text} ${dietaryRestrictionTone.border}`}
                        >
                          {dietaryRestrictionLabel(r)}
                        </span>
                      ))}
                    </div>

                    {/* Macros mini-row */}
                    {(preset.proteinServings || preset.carbServings || preset.fatServings) && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                        {typeof preset.proteinServings === "number" && (
                          <span className="inline-flex items-center gap-1">
                            <FaDrumstickBite size={9} className="text-rose-500" />
                            <span className="font-bold">{preset.proteinServings}</span>
                            חלבון
                          </span>
                        )}
                        {typeof preset.carbServings === "number" && (
                          <span className="inline-flex items-center gap-1">
                            <FaBreadSlice size={9} className="text-amber-500" />
                            <span className="font-bold">{preset.carbServings}</span>
                            פחמ׳
                          </span>
                        )}
                        {typeof preset.fatServings === "number" && (
                          <span className="inline-flex items-center gap-1">
                            <FaDroplet size={9} className="text-sky-500" />
                            <span className="font-bold">{preset.fatServings}</span>
                            שומן
                          </span>
                        )}
                      </div>
                    )}

                    {builderLabel(preset.builtByTrainerId) && (
                      <div className="flex items-center gap-1 pt-1 text-[10px] text-slate-400">
                        <FaUser size={8} />
                        בנה: {builderLabel(preset.builtByTrainerId)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* -------------------------------------------------------------------- */

const FilterDropdown = <T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (v: T) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const active = selected.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition-all ${
          open || active
            ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-300"
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
            {selected.length}
          </span>
        )}
        <FaChevronDown size={9} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[200px] flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl">
          <ul className="max-h-72 overflow-y-auto">
            {options.map((o) => {
              const isSel = selected.includes(o.value);
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => onToggle(o.value)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-right text-xs transition-colors ${
                      isSel
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        isSel
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 dark:border-slate-600 bg-white"
                      }`}
                    >
                      {isSel && (
                        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                          <path
                            d="M2.5 6.5L5 9l4.5-5.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="flex-1">{o.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DietPlanPresetPicker;
