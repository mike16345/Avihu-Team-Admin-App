/**
 * DietPlanPresetPicker — modal picker for choosing a diet-plan preset
 * to load into a trainee's menu.
 *
 * Visual parity with WorkoutPresetPicker (per Avihu): brand-blue
 * palette (not emerald), 1280px-wide layout, side filter panel on
 * the right, large cards with rich meta chips. Same filter language
 * as DietPlanPresetGrid so the trainer scans the same way whether
 * managing the library or picking for a client.
 *
 * Layout overview:
 *
 *   ┌─────────────────────────────── header ───────────────────────────────┐
 *   ├──────────────────────────────────────────┬──────────── side panel ──┤
 *   │  toolbar (search · count · filter btn)    │  סינון תפריטים           │
 *   ├──────────────────────────────────────────│  ▸ סוג תפריט              │
 *   │  active chips row (when filters applied)  │  ▸ קלוריות                │
 *   ├──────────────────────────────────────────│  ▸ מאקרו (חלבון/פחמ/שומן) │
 *   │                                           │  ▸ קלוריות חופשיות        │
 *   │   GRID — 3 columns of rich preset cards   │  ▸ הגבלות תזונה           │
 *   │                                           │  ▸ מספר ארוחות            │
 *   │                                           │  ▸ מאמן שבנה              │
 *   └──────────────────────────────────────────┴──────────────────────────┘
 */
import React, { useEffect, useMemo, useState } from "react";
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
  FaSliders,
  FaXmark,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa6";

type Preset = IDietPlanPreset & { _id?: string };

interface DietPlanPresetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: Preset[];
  onSelect: (preset: Preset) => void;
}

const toggleIn = <T,>(arr: T[], val: T): T[] =>
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
  const [mealCounts, setMealCounts] = useState<string[]>([]);

  // Side panel — open by default (most trainers narrow before scan).
  const [filtersOpen, setFiltersOpen] = useState(true);
  // Per-section collapse — mealCount + goal + calories expanded by
  // default (the high-traffic ones); macro + restrictions + builder
  // collapsed to keep the panel scannable.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    mealCount: true,
    goal: true,
    calories: true,
    macros: false,
    freeCal: false,
    restrictions: false,
    builder: false,
  });
  const toggleSection = (id: string) => setOpenSections((s) => ({ ...s, [id]: !s[id] }));

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

  // Reset on each open
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
      if (!matchesFreeCal((p as { freeCalories?: number }).freeCalories, freeCalB)) return false;
      if (restrictions.length) {
        const r = p.dietaryRestrictions || [];
        if (!restrictions.every((x) => r.includes(x))) return false;
      }
      if (builders.length && !(p.builtByTrainerId && builders.includes(p.builtByTrainerId)))
        return false;
      if (mealCounts.length) {
        const n = (p as { meals?: unknown[] }).meals?.length ?? 0;
        if (!mealCounts.includes(String(n))) return false;
      }
      return true;
    });
  }, [
    presets,
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

  const activeChipCount =
    goals.length +
    buckets.length +
    proteinB.length +
    carbB.length +
    fatB.length +
    freeCalB.length +
    restrictions.length +
    builders.length +
    mealCounts.length;

  const hasActiveFilters = !!search || activeChipCount > 0;

  const clearAll = () => {
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
  };

  // Quick lookups for the active-chip row
  const goalLabelOf = (v: DietGoal) => dietGoalOptions.find((o) => o.value === v)?.label ?? v;
  const bucketLabelOf = (v: CalorieBucket) =>
    CALORIE_BUCKETS.find((b) => b.value === v)?.label ?? v;
  const proteinLabelOf = (v: string) => PROTEIN_OPTIONS.find((o) => o.value === v)?.label ?? v;
  const carbLabelOf = (v: string) => CARB_OPTIONS.find((o) => o.value === v)?.label ?? v;
  const fatLabelOf = (v: string) => FAT_OPTIONS.find((o) => o.value === v)?.label ?? v;
  const freeCalLabelOf = (v: string) => FREE_CAL_OPTIONS.find((o) => o.value === v)?.label ?? v;
  const restrictionLabelOf = (v: DietaryRestriction) => dietaryRestrictionLabel(v);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="!max-w-[1280px] w-[95vw] h-[92vh] max-h-[92vh] overflow-hidden p-0 gap-0 rounded-2xl flex flex-col"
        style={{ fontFamily: "Assistant, Heebo, system-ui, sans-serif" }}
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200/60">
              <FaUtensils size={15} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
                בחירת תפריט תזונה
              </h2>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                סנן לפי מטרה, קלוריות, מאקרו או הגבלות תזונה ובחר את התפריט המתאים
              </p>
            </div>
          </div>
        </header>

        {/* Body — plain flex-row in RTL puts the first child (the
            aside) on the RIGHT side of the dialog. Per Avihu's
            preference: filters where the eye starts reading. */}
        <div className="flex flex-1 overflow-hidden">
          {/* ===== SIDE FILTER PANEL ===== */}
          {filtersOpen && (
            <aside className="w-[320px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-200/70 via-slate-100/80 to-slate-200/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex flex-col">
              <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200/60">
                    <FaSliders size={12} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      סינון תפריטים
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      התאם את התפריטים לצרכים שלך
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="סגור פאנל סינון"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                >
                  <FaXmark size={11} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                <FilterSection
                  id="mealCount"
                  title="מספר ארוחות"
                  expanded={openSections.mealCount}
                  onToggle={toggleSection}
                  count={mealCounts.length}
                >
                  <ChipGrid
                    options={[1, 2, 3, 4, 5, 6, 7].map((n) => ({
                      value: String(n),
                      label: String(n),
                    }))}
                    selected={mealCounts}
                    onToggle={(v) => setMealCounts(toggleIn(mealCounts, v))}
                  />
                </FilterSection>

                <FilterSection
                  id="goal"
                  title="סוג תפריט"
                  expanded={openSections.goal}
                  onToggle={toggleSection}
                  count={goals.length}
                >
                  <ChipGrid
                    options={dietGoalOptions}
                    selected={goals}
                    onToggle={(v) => setGoals(toggleIn(goals, v as DietGoal))}
                  />
                </FilterSection>

                <FilterSection
                  id="calories"
                  title="קלוריות"
                  expanded={openSections.calories}
                  onToggle={toggleSection}
                  count={buckets.length}
                >
                  <ChipGrid
                    options={CALORIE_BUCKETS.map((b) => ({ value: b.value, label: b.label }))}
                    selected={buckets}
                    onToggle={(v) => setBuckets(toggleIn(buckets, v as CalorieBucket))}
                  />
                </FilterSection>

                <FilterSection
                  id="macros"
                  title="מאקרו"
                  expanded={openSections.macros}
                  onToggle={toggleSection}
                  count={proteinB.length + carbB.length + fatB.length}
                >
                  <div className="space-y-3">
                    <div>
                      <p className="mb-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        חלבון
                      </p>
                      <ChipGrid
                        options={PROTEIN_OPTIONS}
                        selected={proteinB}
                        onToggle={(v) => setProteinB(toggleIn(proteinB, v))}
                      />
                    </div>
                    <div>
                      <p className="mb-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        פחמ׳
                      </p>
                      <ChipGrid
                        options={CARB_OPTIONS}
                        selected={carbB}
                        onToggle={(v) => setCarbB(toggleIn(carbB, v))}
                      />
                    </div>
                    <div>
                      <p className="mb-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        שומן
                      </p>
                      <ChipGrid
                        options={FAT_OPTIONS}
                        selected={fatB}
                        onToggle={(v) => setFatB(toggleIn(fatB, v))}
                      />
                    </div>
                  </div>
                </FilterSection>

                <FilterSection
                  id="freeCal"
                  title="קלוריות חופשיות"
                  expanded={openSections.freeCal}
                  onToggle={toggleSection}
                  count={freeCalB.length}
                >
                  <ChipGrid
                    options={FREE_CAL_OPTIONS}
                    selected={freeCalB}
                    onToggle={(v) => setFreeCalB(toggleIn(freeCalB, v))}
                  />
                </FilterSection>

                <FilterSection
                  id="restrictions"
                  title="הגבלות תזונה"
                  expanded={openSections.restrictions}
                  onToggle={toggleSection}
                  count={restrictions.length}
                >
                  <ChipGrid
                    options={dietaryRestrictionOptions}
                    selected={restrictions}
                    onToggle={(v) =>
                      setRestrictions(toggleIn(restrictions, v as DietaryRestriction))
                    }
                  />
                </FilterSection>

                {builderOptions.length > 0 && (
                  <FilterSection
                    id="builder"
                    title="מאמן שבנה"
                    expanded={openSections.builder}
                    onToggle={toggleSection}
                    count={builders.length}
                  >
                    <ChipGrid
                      options={builderOptions}
                      selected={builders}
                      onToggle={(v) => setBuilders(toggleIn(builders, v))}
                    />
                  </FilterSection>
                )}
              </div>

              {/* Footer with totals + clear */}
              <div className="border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 px-5 py-3 backdrop-blur">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {filtered.length} תוצאות
                  </span>
                  {activeChipCount > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <FaXmark size={9} />
                      נקה הכל
                    </button>
                  )}
                </div>
              </div>
            </aside>
          )}

          {/* ===== MAIN COLUMN ===== */}
          <div className="flex flex-1 flex-col overflow-hidden bg-slate-50/60 dark:bg-slate-950/40">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3">
              <div className="relative flex-1 min-w-[200px] max-w-[420px]">
                <FaMagnifyingGlass
                  size={11}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="חיפוש לפי שם תפריט…"
                  autoFocus
                  className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pr-8 pl-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-400">
                {filtered.length} מתוך {presets.length}
              </span>

              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
                className="ms-auto inline-flex h-9 items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-3.5 text-sm font-bold text-blue-700 transition-all hover:bg-blue-100 hover:border-blue-400 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/40"
              >
                <FaSliders size={12} />
                סינון
                {activeChipCount > 0 && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                    {activeChipCount}
                  </span>
                )}
              </button>
            </div>

            {/* Active-filter chips strip */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 px-6 py-2.5">
                {mealCounts.map((m) => (
                  <ActiveChip
                    key={`m-${m}`}
                    label={`${m} ארוחות`}
                    onRemove={() => setMealCounts((arr) => arr.filter((x) => x !== m))}
                  />
                ))}
                {goals.map((g) => (
                  <ActiveChip
                    key={`g-${g}`}
                    label={goalLabelOf(g)}
                    onRemove={() => setGoals((arr) => arr.filter((x) => x !== g))}
                  />
                ))}
                {buckets.map((b) => (
                  <ActiveChip
                    key={`b-${b}`}
                    label={bucketLabelOf(b)}
                    onRemove={() => setBuckets((arr) => arr.filter((x) => x !== b))}
                  />
                ))}
                {proteinB.map((p) => (
                  <ActiveChip
                    key={`p-${p}`}
                    label={`חלבון ${proteinLabelOf(p)}`}
                    onRemove={() => setProteinB((arr) => arr.filter((x) => x !== p))}
                  />
                ))}
                {carbB.map((c) => (
                  <ActiveChip
                    key={`c-${c}`}
                    label={`פחמ׳ ${carbLabelOf(c)}`}
                    onRemove={() => setCarbB((arr) => arr.filter((x) => x !== c))}
                  />
                ))}
                {fatB.map((f) => (
                  <ActiveChip
                    key={`f-${f}`}
                    label={`שומן ${fatLabelOf(f)}`}
                    onRemove={() => setFatB((arr) => arr.filter((x) => x !== f))}
                  />
                ))}
                {freeCalB.map((fc) => (
                  <ActiveChip
                    key={`fc-${fc}`}
                    label={freeCalLabelOf(fc)}
                    onRemove={() => setFreeCalB((arr) => arr.filter((x) => x !== fc))}
                  />
                ))}
                {restrictions.map((r) => (
                  <ActiveChip
                    key={`r-${r}`}
                    label={restrictionLabelOf(r)}
                    onRemove={() => setRestrictions((arr) => arr.filter((x) => x !== r))}
                  />
                ))}
                {builders.map((bid) => (
                  <ActiveChip
                    key={`bu-${bid}`}
                    label={`מאמן: ${builderLabel(bid) || bid}`}
                    onRemove={() => setBuilders((arr) => arr.filter((x) => x !== bid))}
                  />
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="ms-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  <FaXmark size={10} />
                  נקה הכל
                </button>
              </div>
            )}

            {/* Results grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <FaUtensils size={20} />
                  </div>
                  <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                    {presets.length === 0 ? "עדיין אין תפריטים שמורים" : "לא נמצא תפריט מתאים"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    נסה לנקות חלק מהסינונים כדי לראות עוד תוצאות
                  </p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="mt-1 inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                    >
                      נקה סינון
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((preset) => {
                    const goalT = dietGoalTone(preset.goal);
                    const goalL = dietGoalLabel(preset.goal);
                    const restr = preset.dietaryRestrictions ?? [];
                    const mealCount = (preset as { meals?: unknown[] }).meals?.length ?? 0;
                    return (
                      <button
                        key={preset._id || preset.name}
                        type="button"
                        onClick={() => {
                          onSelect(preset);
                          onOpenChange(false);
                        }}
                        className="group flex flex-col gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-right transition-all hover:-translate-y-0.5 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md"
                      >
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200/60">
                              <FaUtensils size={12} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                                {preset.name || "ללא שם"}
                              </h3>
                              {(goalL || preset.calories) && (
                                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                  {[goalL, preset.calories ? `${preset.calories} קל׳` : null]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="opacity-0 transition-opacity group-hover:opacity-100 inline-flex h-6 items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                            <FaCheck size={8} />
                            בחר
                          </span>
                        </div>

                        {/* Tags row */}
                        <div className="flex flex-wrap gap-1">
                          {mealCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                              {mealCount} ארוחות
                            </span>
                          )}
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
                          <div className="mt-auto flex items-center gap-1 pt-1 text-[10px] text-slate-400">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* -------------------------------------------------------------------- */
/* Internal helpers                                                      */
/* -------------------------------------------------------------------- */

/** A collapsible section in the side filter panel. */
const FilterSection: React.FC<{
  id: string;
  title: string;
  count: number;
  expanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}> = ({ id, title, count, expanded, onToggle, children }) => (
  <div className="rounded-xl">
    <button
      type="button"
      onClick={() => onToggle(id)}
      className="flex w-full items-center justify-between gap-2 px-2 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/40 rounded-lg transition-colors"
    >
      <span className="flex items-center gap-2">
        {title}
        {count > 0 && (
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </span>
      {expanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
    </button>
    {expanded && <div className="px-2 pb-3 pt-1">{children}</div>}
  </div>
);

/**
 * A wrapped row of toggleable chips. Style matches the workout
 * picker — solid blue fill + white text when selected (instead of a
 * subtle tint). The contrast makes selection state instantly
 * readable in dense filter panels.
 */
const ChipGrid = <T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (v: T) => void;
}) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((o) => {
      const isSel = selected.includes(o.value);
      return (
        <button
          key={o.value}
          type="button"
          onClick={() => onToggle(o.value)}
          className={`h-7 rounded-md border px-2.5 text-xs font-bold transition-all ${
            isSel
              ? "border-blue-600 bg-blue-600 text-white shadow-sm"
              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
          }`}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

/** A removable chip shown in the active-filter strip above the grid. */
const ActiveChip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <button
    type="button"
    onClick={onRemove}
    className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 transition-colors hover:bg-blue-100 hover:border-blue-300"
  >
    <span>{label}</span>
    <FaXmark size={9} />
  </button>
);

export default DietPlanPresetPicker;
