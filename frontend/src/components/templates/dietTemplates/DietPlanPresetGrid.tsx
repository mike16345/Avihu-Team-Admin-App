/**
 * DietPlanPresetGrid — card grid for diet-plan presets.
 *
 * Same design language as WorkoutPresetGrid: search, multi-select
 * filter pills (goal / calorie bucket / dietary restrictions / builder),
 * and per-preset cards that surface the trainer-tagged meta. Falls
 * back gracefully when a preset has no meta yet.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import {
  FaMagnifyingGlass,
  FaPenToSquare,
  FaTrash,
  FaUtensils,
  FaFire,
  FaDrumstickBite,
  FaBreadSlice,
  FaDroplet,
  FaUser,
  FaPlus,
  FaArrowLeft,
  FaChevronDown,
  FaCircleExclamation,
  FaBullseye,
  FaSeedling,
} from "react-icons/fa6";
import { useUsersStore } from "@/store/userStore";
import { useSubTrainersQuery } from "@/hooks/queries/subTrainers/useSubTrainersQuery";

interface DietPlanPresetGridProps {
  data: (IDietPlanPreset & { _id?: string })[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew?: () => void;
  addLabel?: string;
}

const toggle = <T,>(arr: T[], val: T): T[] =>
  arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

const DietPlanPresetGrid: React.FC<DietPlanPresetGridProps> = ({
  data,
  onOpen,
  onDelete,
  onAddNew,
  addLabel = "הוסף תפריט",
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
  // Meal-count filter — derived from preset.meals.length. Stored as
  // string so it composes with the rest of the dropdown options.
  const [mealCounts, setMealCounts] = useState<string[]>([]);

  const currentUser = useUsersStore((s) => s.currentUser);
  const { data: subTrainers = [] } = useSubTrainersQuery();

  // "Builder" picker — main trainer (current user) + their sub-trainers
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((p) => {
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
        const presetR = p.dietaryRestrictions || [];
        if (!restrictions.every((r) => presetR.includes(r))) return false;
      }
      if (builders.length && !(p.builtByTrainerId && builders.includes(p.builtByTrainerId)))
        return false;
      if (mealCounts.length) {
        const n = (p as any).meals?.length ?? 0;
        if (!mealCounts.includes(String(n))) return false;
      }
      return true;
    });
  }, [
    data,
    search,
    goals,
    buckets,
    proteinB,
    carbB,
    fatB,
    freeCalB,
    restrictions,
    builders,
    mealCounts,
  ]);

  const anyFilterActive =
    goals.length +
      buckets.length +
      proteinB.length +
      carbB.length +
      fatB.length +
      freeCalB.length +
      restrictions.length +
      builders.length +
      mealCounts.length >
    0;

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-4"
      style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
    >
      {/* Toolbar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 max-w-[360px]">
            <FaMagnifyingGlass
              size={11}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש לפי שם תפריט…"
              className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pr-8 pl-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          {/* Per-category filter dropdowns — order is DOM order, so in
              RTL the first ones render on the right. "Number of meals"
              + dietary restrictions are surfaced first since they're
              the most common questions when matching a menu to a client. */}
          <FilterDropdown
            label="מספר ארוחות"
            icon={<FaUtensils size={11} />}
            tone="indigo"
            options={[1, 2, 3, 4, 5, 6, 7].map((n) => ({ value: String(n), label: String(n) }))}
            selected={mealCounts}
            onToggle={(v) => setMealCounts(toggle(mealCounts, v))}
          />
          <FilterDropdown
            label="הגבלות"
            icon={<FaCircleExclamation size={11} />}
            tone="rose"
            options={dietaryRestrictionOptions}
            selected={restrictions}
            onToggle={(v) => setRestrictions(toggle(restrictions, v as DietaryRestriction))}
          />
          <FilterDropdown
            label="סוג תפריט"
            icon={<FaBullseye size={11} />}
            tone="violet"
            options={dietGoalOptions}
            selected={goals}
            onToggle={(v) => setGoals(toggle(goals, v))}
          />
          <FilterDropdown
            label="קלוריות"
            icon={<FaFire size={11} />}
            tone="amber"
            options={CALORIE_BUCKETS.map((b) => ({ value: b.value, label: b.label }))}
            selected={buckets}
            onToggle={(v) => setBuckets(toggle(buckets, v as CalorieBucket))}
          />
          <FilterDropdown
            label="חלבון"
            icon={<FaDrumstickBite size={11} />}
            tone="pink"
            options={PROTEIN_OPTIONS}
            selected={proteinB}
            onToggle={(v) => setProteinB(toggle(proteinB, v))}
          />
          <FilterDropdown
            label="פחמ׳"
            icon={<FaBreadSlice size={11} />}
            tone="orange"
            options={CARB_OPTIONS}
            selected={carbB}
            onToggle={(v) => setCarbB(toggle(carbB, v))}
          />
          <FilterDropdown
            label="שומן"
            icon={<FaDroplet size={11} />}
            tone="sky"
            options={FAT_OPTIONS}
            selected={fatB}
            onToggle={(v) => setFatB(toggle(fatB, v))}
          />
          <FilterDropdown
            label="חופשיות"
            icon={<FaSeedling size={11} />}
            tone="emerald"
            options={FREE_CAL_OPTIONS}
            selected={freeCalB}
            onToggle={(v) => setFreeCalB(toggle(freeCalB, v))}
          />

          {anyFilterActive && (
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

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filtered.length} {filtered.length === 1 ? "תפריט" : "תפריטים"}
            {filtered.length !== data.length && ` מתוך ${data.length}`}
          </span>

          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="ms-auto inline-flex items-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-4 py-2 text-sm font-bold text-white shadow-sm"
            >
              <FaPlus size={11} />
              {addLabel}
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-400 shadow-sm">
            <FaUtensils size={18} />
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">
            {data.length === 0 ? "עדיין לא נוצרו תפריטים" : "לא נמצאו תוצאות"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((preset) => {
            const goalT = dietGoalTone(preset.goal);
            const goalL = dietGoalLabel(preset.goal);
            const restr = preset.dietaryRestrictions ?? [];

            return (
              <article
                key={preset._id}
                onClick={() => preset._id && onOpen(preset._id)}
                className="group relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-200/60 dark:ring-emerald-900/40">
                      <FaUtensils size={14} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
                        {preset.name || "ללא שם"}
                      </h3>
                      {(goalL || preset.calories) && (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {[goalL, preset.calories ? `${preset.calories} קל׳` : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        preset._id && onOpen(preset._id);
                      }}
                      aria-label="עריכה"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40"
                    >
                      <FaPenToSquare size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (preset._id && confirm(`למחוק את "${preset.name}"?`))
                          onDelete(preset._id);
                      }}
                      aria-label="מחיקה"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap gap-1.5">
                  {goalL && goalT && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${goalT.bg} ${goalT.text} ${goalT.border}`}
                    >
                      {goalL}
                    </span>
                  )}
                  {typeof preset.calories === "number" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                      <FaFire size={9} />
                      {preset.calories} קל׳
                    </span>
                  )}
                </div>

                {/* Macros grid */}
                {(preset.proteinServings || preset.carbServings || preset.fatServings) && (
                  <div className="grid grid-cols-3 gap-2">
                    <MacroStat
                      icon={<FaDrumstickBite size={9} />}
                      label="חלבון"
                      value={preset.proteinServings}
                      tone="rose"
                    />
                    <MacroStat
                      icon={<FaBreadSlice size={9} />}
                      label="פחמ׳"
                      value={preset.carbServings}
                      tone="amber"
                    />
                    <MacroStat
                      icon={<FaDroplet size={9} />}
                      label="שומן"
                      value={preset.fatServings}
                      tone="sky"
                    />
                  </div>
                )}

                {/* Dietary restrictions */}
                {restr.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {restr.map((r) => (
                      <span
                        key={r}
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${dietaryRestrictionTone.bg} ${dietaryRestrictionTone.text} ${dietaryRestrictionTone.border}`}
                      >
                        {dietaryRestrictionLabel(r)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Empty-meta hint */}
                {!goalL &&
                  typeof preset.calories !== "number" &&
                  !preset.proteinServings &&
                  !preset.carbServings &&
                  !preset.fatServings &&
                  restr.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">
                      לא הוגדרו תיוגים — פתח לעריכה והוסף מטרה, קלוריות והגבלות
                    </p>
                  )}

                {/* Footer — builder + open hint */}
                <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-[10px] text-slate-400 dark:text-slate-500">
                  {builderLabel(preset.builtByTrainerId) ? (
                    <span className="inline-flex items-center gap-1">
                      <FaUser size={8} />
                      בנה: {builderLabel(preset.builtByTrainerId)}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="inline-flex items-center gap-1 font-semibold transition-colors group-hover:text-blue-500">
                    פתח לעריכה
                    <FaArrowLeft size={8} />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------- */

/**
 * Per-category tone palette. Each filter gets a soft tint when idle
 * (icon + accent edge), deepens on hover, and switches to the brand
 * gradient when there's an active selection.
 */
type FilterTone =
  | "blue"
  | "amber"
  | "violet"
  | "rose"
  | "emerald"
  | "sky"
  | "indigo"
  | "pink"
  | "orange";

const TONE_STYLES: Record<
  FilterTone,
  { iconText: string; idleBg: string; idleBorder: string; hover: string }
> = {
  blue: {
    iconText: "text-blue-600 dark:text-blue-300",
    idleBg: "bg-blue-50/60 dark:bg-blue-950/30",
    idleBorder: "border-blue-100 dark:border-blue-900/60",
    hover: "hover:bg-blue-100/60 hover:border-blue-300",
  },
  amber: {
    iconText: "text-amber-600 dark:text-amber-300",
    idleBg: "bg-amber-50/60 dark:bg-amber-950/30",
    idleBorder: "border-amber-100 dark:border-amber-900/60",
    hover: "hover:bg-amber-100/60 hover:border-amber-300",
  },
  violet: {
    iconText: "text-violet-600 dark:text-violet-300",
    idleBg: "bg-violet-50/60 dark:bg-violet-950/30",
    idleBorder: "border-violet-100 dark:border-violet-900/60",
    hover: "hover:bg-violet-100/60 hover:border-violet-300",
  },
  rose: {
    iconText: "text-rose-600 dark:text-rose-300",
    idleBg: "bg-rose-50/60 dark:bg-rose-950/30",
    idleBorder: "border-rose-100 dark:border-rose-900/60",
    hover: "hover:bg-rose-100/60 hover:border-rose-300",
  },
  emerald: {
    iconText: "text-emerald-600 dark:text-emerald-300",
    idleBg: "bg-emerald-50/60 dark:bg-emerald-950/30",
    idleBorder: "border-emerald-100 dark:border-emerald-900/60",
    hover: "hover:bg-emerald-100/60 hover:border-emerald-300",
  },
  sky: {
    iconText: "text-sky-600 dark:text-sky-300",
    idleBg: "bg-sky-50/60 dark:bg-sky-950/30",
    idleBorder: "border-sky-100 dark:border-sky-900/60",
    hover: "hover:bg-sky-100/60 hover:border-sky-300",
  },
  indigo: {
    iconText: "text-indigo-600 dark:text-indigo-300",
    idleBg: "bg-indigo-50/60 dark:bg-indigo-950/30",
    idleBorder: "border-indigo-100 dark:border-indigo-900/60",
    hover: "hover:bg-indigo-100/60 hover:border-indigo-300",
  },
  pink: {
    iconText: "text-pink-600 dark:text-pink-300",
    idleBg: "bg-pink-50/60 dark:bg-pink-950/30",
    idleBorder: "border-pink-100 dark:border-pink-900/60",
    hover: "hover:bg-pink-100/60 hover:border-pink-300",
  },
  orange: {
    iconText: "text-orange-600 dark:text-orange-300",
    idleBg: "bg-orange-50/60 dark:bg-orange-950/30",
    idleBorder: "border-orange-100 dark:border-orange-900/60",
    hover: "hover:bg-orange-100/60 hover:border-orange-300",
  },
};

/**
 * FilterDropdown — per-category pill button that opens a checkable
 * multi-select list below it. Selected count badge on the trigger,
 * click-outside / Escape to close.
 */
const FilterDropdown = <T extends string>({
  label,
  icon,
  tone = "blue",
  options,
  selected,
  onToggle,
}: {
  label: string;
  icon?: React.ReactNode;
  tone?: FilterTone;
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
  const t = TONE_STYLES[tone];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`group inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all duration-200 ${
          active
            ? "border-transparent brand-gradient text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
            : open
              ? `${t.idleBorder} ${t.idleBg} text-slate-700 dark:text-slate-100 shadow-sm`
              : `${t.idleBorder} ${t.idleBg} ${t.hover} text-slate-700 dark:text-slate-100 hover:shadow-sm hover:-translate-y-0.5`
        }`}
      >
        {icon && (
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-md transition-transform group-hover:scale-110 ${
              active ? "text-white/90" : t.iconText
            }`}
          >
            {icon}
          </span>
        )}
        {label}
        {selected.length > 0 && (
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/25 backdrop-blur px-1.5 text-[10px] font-bold text-white ring-1 ring-white/40">
            {selected.length}
          </span>
        )}
        <FaChevronDown
          size={9}
          className={`transition-transform ${open ? "rotate-180" : ""} ${
            active ? "text-white/80" : "text-slate-400"
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-30 mt-2 min-w-[200px] flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl"
        >
          {selected.length > 0 && (
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 px-2 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
              </span>
              <button
                type="button"
                onClick={() => selected.forEach(onToggle)}
                className="text-[10px] font-bold text-slate-500 hover:text-rose-600"
              >
                נקה
              </button>
            </div>
          )}
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
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
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

const MACRO_TONE: Record<"rose" | "amber" | "sky", { bg: string; text: string }> = {
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-700 dark:text-sky-300",
  },
};

const MacroStat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: number;
  tone: "rose" | "amber" | "sky";
}> = ({ icon, label, value, tone }) => {
  const t = MACRO_TONE[tone];
  return (
    <div className={`flex flex-col items-center gap-0.5 rounded-lg ${t.bg} p-2`}>
      <div
        className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider ${t.text}`}
      >
        {icon}
        {label}
      </div>
      <div className={`text-lg font-bold leading-none ${t.text}`}>
        {typeof value === "number" ? value : "—"}
      </div>
    </div>
  );
};

export default DietPlanPresetGrid;
