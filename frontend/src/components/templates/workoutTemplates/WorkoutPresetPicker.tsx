/**
 * WorkoutPresetPicker — rich modal picker for selecting a workout
 * preset (when assigning a plan to a client or copying a preset into
 * the current editor).
 *
 * Replaces the bare-bones name-only ComboBox so the trainer can scan
 * presets professionally — by workouts-per-week, duration, level, and
 * goal (focus). All filters work on the trainer-tagged meta fields.
 *
 * Data contract: read-only — selecting a preset returns the original
 * IWorkoutPlanPreset object verbatim to the caller.
 */
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  IWorkoutPlanPreset,
  WorkoutEquipment,
  WorkoutGoal,
  WorkoutLevel,
} from "@/interfaces/IWorkoutPlan";
import { fullWorkoutPlanSchema, WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import { defaultSimpleCardioOption } from "@/constants/cardioOptions";
import WorkoutPlans from "@/components/workout plan/WorkoutPlans";
import PresetMetaPanel from "./PresetMetaPanel";
import {
  GOAL_OPTIONS,
  LEVEL_OPTIONS,
  MUSCLE_FOCUS_OPTIONS,
  EQUIPMENT_OPTIONS,
  goalTone,
  levelTone,
  goalLabel,
  levelLabel,
  muscleFocusLabel,
} from "@/lib/workoutMeta";
import {
  FaMagnifyingGlass,
  FaXmark,
  FaDumbbell,
  FaClock,
  FaCalendarWeek,
  FaSignal,
  FaBullseye,
  FaCheck,
  FaPersonRays,
  FaArrowRight,
  FaCircleExclamation,
  FaSliders,
  FaChevronDown,
  FaStar,
} from "react-icons/fa6";
import FavoriteStar from "./FavoriteStar";
import { useFavoriteWorkoutPresets } from "@/hooks/useFavoriteWorkoutPresets";

type Preset = IWorkoutPlanPreset & { _id?: string };

interface WorkoutPresetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: Preset[];
  onSelect: (preset: Preset) => void;
}

type WeekFilter = "all" | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type DurationFilter = "all" | "≤30" | "30-45" | "45-60" | "60-75" | "75-90" | "90+";

// Kept in lockstep with WorkoutPresetGrid + the editor (PresetMetaPanel)
// so anything the trainer can tag, they can later filter for.
const WEEK_OPTIONS: { value: WeekFilter; label: string }[] = [
  { value: "all", label: "הכל" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
];

const DURATION_OPTIONS: { value: DurationFilter; label: string; min: number; max: number }[] = [
  { value: "all", label: "הכל", min: 0, max: 9999 },
  { value: "≤30", label: "עד 30 דק׳", min: 0, max: 30 },
  { value: "30-45", label: "30–45 דק׳", min: 30, max: 45 },
  { value: "45-60", label: "45–60 דק׳", min: 45, max: 60 },
  { value: "60-75", label: "60–75 דק׳", min: 60, max: 75 },
  { value: "75-90", label: "75–90 דק׳", min: 75, max: 90 },
  { value: "90+", label: "90+ דק׳", min: 90, max: 9999 },
];

/**
 * Collect distinct muscle groups across all workout plans in this
 * preset, so trainers can filter by focus (e.g. "show all presets
 * that train shoulders").
 */
const muscleGroupsOf = (p: Preset): string[] => {
  const set = new Set<string>();
  p.workoutPlans?.forEach((plan) =>
    plan.muscleGroups?.forEach((mg) => mg.muscleGroup && set.add(mg.muscleGroup))
  );
  return Array.from(set);
};

const WorkoutPresetPicker: React.FC<WorkoutPresetPickerProps> = ({
  open,
  onOpenChange,
  presets,
  onSelect,
}) => {
  // Multi-select — empty array means "no filter" (הכל).
  const [search, setSearch] = useState("");
  const [weekFilter, setWeekFilter] = useState<Exclude<WeekFilter, "all">[]>([]);
  const [durationFilter, setDurationFilter] = useState<Exclude<DurationFilter, "all">[]>([]);
  const [levelFilter, setLevelFilter] = useState<WorkoutLevel[]>([]);
  const [goalFilter, setGoalFilter] = useState<WorkoutGoal[]>([]);
  const [equipmentFilter, setEquipmentFilter] = useState<WorkoutEquipment[]>([]);
  // muscleFilter operates on the trainer-tagged `muscleFocus` slugs
  const [muscleFilter, setMuscleFilter] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { isFavorite, count: favoritesCount } = useFavoriteWorkoutPresets();

  // The side filter panel — closed by default, opens on "סינון" click.
  // When closed the toolbar shows just search + selected-chips + the
  // "סינון" trigger; the deep filter UI lives inside the panel.
  // Filter panel is open by default — the trainer almost always wants
  // to narrow the result set before scanning. They can close it
  // explicitly via the X if they want the full grid.
  const [filtersOpen, setFiltersOpen] = useState(true);
  // Collapsible section state — keyed by section id. First three are
  // expanded by default since they're the most-used filters; the rest
  // are collapsed to keep the panel scannable.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    muscle: true,
    level: true,
    duration: true,
    equipment: false,
    goal: false,
    week: false,
  });
  const toggleSection = (id: string) => setOpenSections((s) => ({ ...s, [id]: !s[id] }));

  // Lookup helpers used by the active-filter chip row to render the
  // selected value's human label (e.g. "beginner" → "מתחיל").
  const levelLabelOf = (v: WorkoutLevel) => LEVEL_OPTIONS.find((o) => o.value === v)?.label ?? v;
  const goalLabelOf = (v: WorkoutGoal) => GOAL_OPTIONS.find((o) => o.value === v)?.label ?? v;
  const equipmentLabelOf = (v: WorkoutEquipment) =>
    EQUIPMENT_OPTIONS.find((o) => o.value === v)?.label ?? v;
  const muscleLabelOf = (v: string) => muscleFocusLabel(v);
  const durationLabelOf = (v: string) => DURATION_OPTIONS.find((o) => o.value === v)?.label ?? v;

  const toggleIn = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const durationMatches = (dur: number, bands: Exclude<DurationFilter, "all">[]): boolean => {
    if (bands.length === 0) return true;
    if (dur < 0) return false;
    return bands.some((band) => {
      const range = DURATION_OPTIONS.find((o) => o.value === band);
      if (!range) return false;
      if (band === "≤30") return dur <= 30;
      if (band === "90+") return dur >= 90;
      return dur > range.min && dur <= range.max;
    });
  };
  // Preview state — when set, the modal shows the full editor for
  // this preset. `null` means we're in grid mode.
  const [preview, setPreview] = useState<Preset | null>(null);

  /**
   * Local form for the in-modal editor. Edits here are sandboxed —
   * they never write back to the preset itself; on confirm we read
   * the modified values out and forward them to onSelect, which
   * loads them into the parent (user's plan) form.
   */
  const editorForm = useForm<WorkoutSchemaType>({
    resolver: zodResolver(fullWorkoutPlanSchema),
    defaultValues: {
      tips: [],
      cardio: { type: "simple", plan: defaultSimpleCardioOption },
      workoutPlans: [],
    },
  });

  // Reset filters + preview every time the picker opens fresh
  useEffect(() => {
    if (open) {
      setSearch("");
      setWeekFilter([]);
      setDurationFilter([]);
      setLevelFilter([]);
      setGoalFilter([]);
      setEquipmentFilter([]);
      setMuscleFilter([]);
      setPreview(null);
    }
  }, [open]);

  // Same rule as the grid: frequency only comes from the trainer-tagged value.
  const getWpw = (p: Preset) => (typeof p.workoutsPerWeek === "number" ? p.workoutsPerWeek : -1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = presets.filter((p) => {
      if (favoritesOnly && !isFavorite(p._id)) return false;
      if (q && !p.name?.toLowerCase().includes(q)) return false;
      // Week
      if (weekFilter.length > 0) {
        const wpw = getWpw(p);
        const ok = weekFilter.some((w) => wpw === w);
        if (!ok) return false;
      }
      // Duration
      if (!durationMatches(p.durationMinutes ?? -1, durationFilter)) return false;
      // Level / Goal / Equipment
      if (levelFilter.length > 0 && (!p.level || !levelFilter.includes(p.level))) return false;
      if (goalFilter.length > 0 && (!p.goal || !goalFilter.includes(p.goal))) return false;
      if (equipmentFilter.length > 0 && (!p.equipment || !equipmentFilter.includes(p.equipment)))
        return false;
      // Muscle focus — share at least one tag
      if (muscleFilter.length > 0) {
        const tags = p.muscleFocus ?? [];
        if (!tags.some((t) => muscleFilter.includes(t))) return false;
      }
      return true;
    });
    // Favourites float to top — same UX rule as the grid.
    return [...matches].sort((a, b) => {
      const af = isFavorite(a._id) ? 1 : 0;
      const bf = isFavorite(b._id) ? 1 : 0;
      return bf - af;
    });
  }, [
    presets,
    search,
    weekFilter,
    durationFilter,
    levelFilter,
    goalFilter,
    equipmentFilter,
    muscleFilter,
    favoritesOnly,
    isFavorite,
  ]);

  // Total selected chips across all filter categories — drives the
  // count badge on the "סינון" trigger.
  const activeChipCount =
    weekFilter.length +
    durationFilter.length +
    levelFilter.length +
    goalFilter.length +
    equipmentFilter.length +
    muscleFilter.length;

  const hasActiveFilters = !!search || activeChipCount > 0;

  const clearAll = () => {
    setSearch("");
    setWeekFilter([]);
    setDurationFilter([]);
    setLevelFilter([]);
    setGoalFilter([]);
    setEquipmentFilter([]);
    setMuscleFilter([]);
  };

  // Step 1: open the detail preview when a card is clicked → seeds
  //         the local editor form with the preset's data.
  // Step 2: confirm — read the (possibly edited) values out of the
  //         local form and hand them to the parent. The original
  //         preset object is NOT mutated.
  const handleOpenPreview = (preset: Preset) => {
    setPreview(preset);
    editorForm.reset({
      workoutPlans: preset.workoutPlans ?? [],
      cardio: preset.cardio || { type: "simple", plan: defaultSimpleCardioOption },
      tips: preset.tips ?? [],
      // Meta fields
      workoutsPerWeek: preset.workoutsPerWeek,
      durationMinutes: preset.durationMinutes,
      level: preset.level,
      goal: preset.goal,
      muscleFocus: preset.muscleFocus,
      note: preset.note,
      limitations: preset.limitations,
    });
  };
  const handleConfirmPick = () => {
    if (!preview) return;
    const edited = editorForm.getValues();
    // Forward the (possibly modified) plan to the parent. We keep the
    // preset's name on the result so callers can still identify which
    // template was the source, but anything else can have been edited.
    // (cast: Zod-inferred type is structurally compatible — the Preset
    //  cardio union is just slightly looser than the generated one.)
    onSelect({ ...preview, ...(edited as any) });
    onOpenChange(false);
  };
  const handleBack = () => {
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="!max-w-[1280px] w-[95vw] h-[92vh] max-h-[92vh] overflow-hidden p-0 gap-0 rounded-2xl flex flex-col"
        style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
      >
        {/* Header — adapts to preview mode */}
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            {preview && (
              <button
                type="button"
                onClick={handleBack}
                aria-label="חזור לרשימה"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40"
              >
                <FaArrowRight size={12} />
              </button>
            )}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200/60">
              <FaDumbbell size={15} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
                {preview ? preview.name || "תצוגת תבנית" : "בחירת תבנית אימון"}
              </h2>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {preview
                  ? "סקור את התוכנית ולחץ 'טען תבנית' כדי להחיל"
                  : "סנן לפי תדירות, רמה, דגש או קבוצת שריר ובחר את התבנית המתאימה"}
              </p>
            </div>
          </div>
        </header>

        {/* ===== GRID MODE ===== */}
        {!preview && (
          <div className="flex flex-1 overflow-hidden flex-row-reverse">
            {/* Main column — search, active chips, results grid.
            Slight off-white tint visually separates the "results" zone
            from the all-white filter panel on the right so the two
            stop fighting for the eye. */}
            <div className="flex flex-1 flex-col overflow-hidden bg-slate-50/60 dark:bg-slate-950/40">
              {/* Toolbar — pinned, with its own white surface so it reads
            as the controls bar rather than blending into the cards. */}
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
                    placeholder="חיפוש לפי שם תבנית…"
                    autoFocus
                    className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pr-8 pl-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>

                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {filtered.length} מתוך {presets.length}
                </span>

                {/* Favourites toggle — surfaces starred presets first. */}
                <button
                  type="button"
                  onClick={() => setFavoritesOnly((v) => !v)}
                  aria-pressed={favoritesOnly}
                  className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all ${
                    favoritesOnly
                      ? "border-amber-300 bg-amber-50 text-amber-700 shadow-sm dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  <FaStar size={11} />
                  מועדפים
                  {favoritesCount > 0 && (
                    <span
                      className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                        favoritesOnly
                          ? "bg-amber-500 text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {favoritesCount}
                    </span>
                  )}
                </button>

                {/* The single entry-point to the side filter panel. Always
              rendered in the "active" style (blue tint + blue border)
              so the trigger reads as a clearly-available action even
              before the user has touched any filter — and stays
              visually distinct from the search/count siblings. */}
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

              {/* Active filter chips — only when something is selected. Each
            chip removes its own value; "נקה הכל" wipes them in bulk. */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 px-6 py-2.5">
                  {weekFilter.map((w) => (
                    <ActiveChip
                      key={`w-${w}`}
                      label={`${w}× בשבוע`}
                      onRemove={() => setWeekFilter((p) => p.filter((x) => x !== w))}
                    />
                  ))}
                  {durationFilter.map((d) => (
                    <ActiveChip
                      key={`d-${d}`}
                      label={durationLabelOf(d)}
                      onRemove={() => setDurationFilter((p) => p.filter((x) => x !== d))}
                    />
                  ))}
                  {levelFilter.map((l) => (
                    <ActiveChip
                      key={`l-${l}`}
                      label={levelLabelOf(l)}
                      onRemove={() => setLevelFilter((p) => p.filter((x) => x !== l))}
                    />
                  ))}
                  {goalFilter.map((g) => (
                    <ActiveChip
                      key={`g-${g}`}
                      label={goalLabelOf(g)}
                      onRemove={() => setGoalFilter((p) => p.filter((x) => x !== g))}
                    />
                  ))}
                  {equipmentFilter.map((e) => (
                    <ActiveChip
                      key={`e-${e}`}
                      label={equipmentLabelOf(e)}
                      onRemove={() => setEquipmentFilter((p) => p.filter((x) => x !== e))}
                    />
                  ))}
                  {muscleFilter.map((m) => (
                    <ActiveChip
                      key={`m-${m}`}
                      label={muscleLabelOf(m)}
                      onRemove={() => setMuscleFilter((p) => p.filter((x) => x !== m))}
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

              {/* Filter rows replaced by the side panel — see <aside> below */}

              {/* Results grid */}
              <div className="flex-1 overflow-y-auto p-6">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                      <FaMagnifyingGlass size={20} />
                    </div>
                    <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                      לא נמצאו תבניות
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      נסה לנקות את הסינון או לחפש בשם אחר
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
                    {filtered.map((p) => {
                      const wpw = getWpw(p);
                      const lvlT = levelTone(p.level);
                      const goT = goalTone(p.goal);
                      const lvlL = levelLabel(p.level);
                      const goL = goalLabel(p.goal);
                      const muscles = muscleGroupsOf(p).slice(0, 5);
                      return (
                        <button
                          key={p._id || p.name}
                          type="button"
                          onClick={() => handleOpenPreview(p)}
                          className="group flex flex-col gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-right transition-all hover:-translate-y-0.5 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md"
                        >
                          {/* Title row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <FavoriteStar presetId={p._id} buttonSize="sm" />
                              <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                                {p.name || "ללא שם"}
                              </h3>
                            </div>
                            <span className="opacity-0 transition-opacity group-hover:opacity-100 inline-flex h-6 items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                              <FaCheck size={8} />
                              בחר
                            </span>
                          </div>

                          {/* Meta chips */}
                          <div className="flex flex-wrap gap-1">
                            {wpw > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                                <FaCalendarWeek size={8} />
                                {wpw}×
                              </span>
                            )}
                            {p.durationMinutes && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                                <FaClock size={8} />
                                {p.durationMinutes} דק׳
                              </span>
                            )}
                            {lvlL && lvlT && (
                              <span
                                className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${lvlT.bg} ${lvlT.text} ${lvlT.border}`}
                              >
                                <FaSignal size={8} />
                                {lvlL}
                              </span>
                            )}
                            {goL && goT && (
                              <span
                                className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${goT.bg} ${goT.text} ${goT.border}`}
                              >
                                <FaBullseye size={8} />
                                {goL}
                              </span>
                            )}
                          </div>

                          {/* Trainer-tagged muscle focus (prioritised over raw groups) */}
                          {p.muscleFocus && p.muscleFocus.length > 0 ? (
                            <div className="flex flex-wrap gap-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                              {p.muscleFocus.map((m) => (
                                <span
                                  key={m}
                                  className="rounded border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 dark:text-indigo-300"
                                >
                                  {muscleFocusLabel(m)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            muscles.length > 0 && (
                              <div className="flex flex-wrap gap-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                                {muscles.map((m) => (
                                  <span
                                    key={m}
                                    className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 dark:text-slate-300"
                                  >
                                    {m}
                                  </span>
                                ))}
                              </div>
                            )
                          )}

                          {/* Note preview */}
                          {p.note && (
                            <p className="line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                              {p.note}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            {/* end main column */}

            {/* Side filter panel — slides in when the user hits "סינון".
            Lives inside the dialog (not as a separate sheet) so the
            cards on the left stay visible and animate over to make
            room. Width is constrained so the grid stays scannable. */}
            {filtersOpen && (
              <aside className="relative flex w-[340px] shrink-0 flex-col overflow-hidden bg-gradient-to-b from-slate-200/70 via-slate-100/80 to-slate-200/50 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900 shadow-[-4px_0_12px_-6px_rgba(15,23,42,0.12)]">
                {/* Elegant gradient separator — softens the hard column edge */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-slate-300/70 dark:via-slate-700/60 to-transparent" />
                {/* Panel header — visual anchor with brand icon, so the
                panel reads as its own zone rather than another column. */}
                <div className="relative flex items-start justify-between gap-2 px-5 py-4">
                  <div className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300">
                      <FaSliders size={13} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        סינון תבניות
                      </h3>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        התאם את התבניות לצרכים שלך
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    aria-label="סגור סינון"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800"
                  >
                    <FaXmark size={12} />
                  </button>
                </div>

                {/* Sections — scrollable */}
                <div className="flex-1 overflow-y-auto px-5 py-2">
                  <FilterSection
                    id="muscle"
                    label="פוקוס שריר"
                    icon={<FaPersonRays size={11} />}
                    count={muscleFilter.length}
                    open={openSections.muscle}
                    onToggle={() => toggleSection("muscle")}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {MUSCLE_FOCUS_OPTIONS.map((opt) => {
                        const active = muscleFilter.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setMuscleFilter((p) => toggleIn(p, opt.value))}
                            className={`h-7 rounded-md border px-2.5 text-xs font-bold transition-all ${
                              active
                                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </FilterSection>

                  <FilterSection
                    id="level"
                    label="רמת קושי"
                    icon={<FaSignal size={11} />}
                    count={levelFilter.length}
                    open={openSections.level}
                    onToggle={() => toggleSection("level")}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {LEVEL_OPTIONS.map((opt) => {
                        const active = levelFilter.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setLevelFilter((p) => toggleIn(p, opt.value))}
                            className={`h-7 rounded-md border px-2.5 text-xs font-bold transition-all ${
                              active
                                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </FilterSection>

                  <FilterSection
                    id="duration"
                    label="משך אימון"
                    icon={<FaClock size={11} />}
                    count={durationFilter.length}
                    open={openSections.duration}
                    onToggle={() => toggleSection("duration")}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {DURATION_OPTIONS.filter((o) => o.value !== "all").map((opt) => {
                        const active = durationFilter.includes(opt.value as any);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setDurationFilter((p) => toggleIn(p, opt.value as any))}
                            className={`h-7 rounded-md border px-2.5 text-xs font-bold transition-all ${
                              active
                                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </FilterSection>

                  <FilterSection
                    id="equipment"
                    label="ציוד נדרש"
                    icon={<FaDumbbell size={11} />}
                    count={equipmentFilter.length}
                    open={openSections.equipment}
                    onToggle={() => toggleSection("equipment")}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {EQUIPMENT_OPTIONS.map((opt) => {
                        const active = equipmentFilter.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setEquipmentFilter((p) => toggleIn(p, opt.value))}
                            className={`h-7 rounded-md border px-2.5 text-xs font-bold transition-all ${
                              active
                                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </FilterSection>

                  <FilterSection
                    id="goal"
                    label="דגש אימון"
                    icon={<FaBullseye size={11} />}
                    count={goalFilter.length}
                    open={openSections.goal}
                    onToggle={() => toggleSection("goal")}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {GOAL_OPTIONS.map((opt) => {
                        const active = goalFilter.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setGoalFilter((p) => toggleIn(p, opt.value))}
                            className={`h-7 rounded-md border px-2.5 text-xs font-bold transition-all ${
                              active
                                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </FilterSection>

                  <FilterSection
                    id="week"
                    label="תדירות בשבוע"
                    icon={<FaCalendarWeek size={11} />}
                    count={weekFilter.length}
                    open={openSections.week}
                    onToggle={() => toggleSection("week")}
                    isLast
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {WEEK_OPTIONS.filter((o) => o.value !== "all").map((opt) => {
                        const active = weekFilter.includes(opt.value as any);
                        return (
                          <button
                            key={String(opt.value)}
                            type="button"
                            onClick={() => setWeekFilter((p) => toggleIn(p, opt.value as any))}
                            className={`h-7 min-w-[2.25rem] rounded-md border px-2 text-xs font-bold transition-all ${
                              active
                                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </FilterSection>
                </div>

                {/* Sticky footer — primary CTA + clear-all */}
                <div className="relative flex flex-col gap-1.5 px-5 py-4">
                  <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl brand-gradient brand-gradient-hover text-sm font-bold text-white shadow-md transition-all hover:shadow-lg"
                  >
                    הצג תוצאות ({filtered.length})
                  </button>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="inline-flex h-9 w-full items-center justify-center text-xs font-bold text-blue-600 transition-colors hover:text-blue-700"
                    >
                      נקה הכל
                    </button>
                  )}
                </div>
              </aside>
            )}
          </div>
        )}

        {/* ===== PREVIEW / EDITOR MODE =====
            FormProvider gives the in-modal editor its own form
            instance — edits here NEVER write back to the preset. */}
        {preview && (
          <FormProvider {...editorForm}>
            {/* Banner: explain the sandbox */}
            <div className="flex items-center gap-2 border-b border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 px-6 py-2">
              <FaCircleExclamation size={11} className="text-blue-500" />
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                שינויים כאן נשמרים רק לתוכנית של המתאמן — התבנית המקורית "
                <span className="font-bold">{preview.name}</span>" לא משתנה.
              </p>
            </div>

            {/* Body — full editor (meta panel + workouts + cardio + tips) */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <PresetMetaPanel />
              <WorkoutPlans />
            </div>

            {/* Sticky action bar */}
            <footer className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-6 py-3">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <FaArrowRight size={11} />
                חזור לרשימה
              </button>
              <button
                type="button"
                onClick={handleConfirmPick}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
              >
                <FaCheck size={11} />
                טען תבנית למתאמן
              </button>
            </footer>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* -------------------------------------------------------------------- */

/**
 * Single selected-value chip — used in the active-filters row above
 * the cards grid. The X button calls onRemove with no args; parent
 * is responsible for actually dropping the value from its state.
 */
const ActiveChip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
    {label}
    <button
      type="button"
      onClick={onRemove}
      aria-label={`הסר ${label}`}
      className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-blue-200 hover:text-blue-800 dark:hover:bg-blue-900"
    >
      <FaXmark size={8} />
    </button>
  </span>
);

/**
 * Collapsible section inside the side filter panel. Header shows
 * label + count badge + chevron; clicking the header toggles open.
 * Bottom border is omitted on the last section for visual cleanliness.
 */
const FilterSection: React.FC<{
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  open: boolean;
  onToggle: () => void;
  isLast?: boolean;
  children: React.ReactNode;
}> = ({ label, icon, count, open, onToggle, isLast, children }) => (
  <div className="relative">
    {!isLast && (
      // Soft gradient divider — fades at the edges so the dividers
      // feel like delicate threads, not boxed-in lines.
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-slate-200/80 dark:via-slate-700/60 to-transparent" />
    )}
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between gap-2 py-4 text-right transition-colors hover:text-blue-700"
    >
      <span className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
          {icon}
        </span>
        {label}
        {count > 0 && (
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </span>
      <FaChevronDown
        size={11}
        className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
    {open && <div className="pb-4 pt-1">{children}</div>}
  </div>
);

export default WorkoutPresetPicker;
