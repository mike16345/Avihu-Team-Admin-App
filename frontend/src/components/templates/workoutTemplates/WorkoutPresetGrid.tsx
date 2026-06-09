/**
 * WorkoutPresetGrid — filterable card grid for workout-plan presets.
 *
 * Matches the diet-templates layout: a single toolbar row with search,
 * a per-category dropdown for each filter dimension, a clear button,
 * and the "add new" CTA. Filters operate on the trainer-tagged meta
 * fields. Presets that haven't been tagged stay visible when no filter
 * is active so they remain accessible.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  IWorkoutPlanPreset,
  WorkoutEquipment,
  WorkoutGoal,
  WorkoutLevel,
} from "@/interfaces/IWorkoutPlan";
import {
  GOAL_OPTIONS,
  LEVEL_OPTIONS,
  MUSCLE_FOCUS_OPTIONS,
  EQUIPMENT_OPTIONS,
} from "@/lib/workoutMeta";
import WorkoutPresetCard from "./WorkoutPresetCard";
import {
  FaMagnifyingGlass,
  FaPlus,
  FaChevronDown,
  FaCalendarWeek,
  FaClock,
  FaSignal,
  FaBullseye,
  FaDumbbell,
  FaPersonRays,
  FaUser,
  FaStar,
} from "react-icons/fa6";
import { useUsersStore } from "@/store/userStore";
import { useSubTrainersQuery } from "@/hooks/queries/subTrainers/useSubTrainersQuery";
import { useFavoriteWorkoutPresets } from "@/hooks/useFavoriteWorkoutPresets";

type PresetItem = IWorkoutPlanPreset & { _id?: string };

interface WorkoutPresetGridProps {
  data: PresetItem[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  addLabel: string;
}

// Frequency / duration options are kept in lockstep with the editor
// (PresetMetaPanel) so what the trainer can *tag* is exactly what
// they can later *filter by*.
const WEEK_OPTIONS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
];

const DURATION_OPTIONS = [
  { value: "≤30", label: "עד 30 דק׳", min: 0, max: 30 },
  { value: "30-45", label: "30–45 דק׳", min: 30, max: 45 },
  { value: "45-60", label: "45–60 דק׳", min: 45, max: 60 },
  { value: "60-75", label: "60–75 דק׳", min: 60, max: 75 },
  { value: "75-90", label: "75–90 דק׳", min: 75, max: 90 },
  { value: "90+", label: "90+ דק׳", min: 90, max: 9999 },
];

const toggle = <T,>(arr: T[], val: T): T[] =>
  arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

const WorkoutPresetGrid: React.FC<WorkoutPresetGridProps> = ({
  data,
  onOpen,
  onDelete,
  onAddNew,
  addLabel,
}) => {
  const [search, setSearch] = useState("");
  const [weekFilter, setWeekFilter] = useState<string[]>([]);
  const [durationFilter, setDurationFilter] = useState<string[]>([]);
  const [levelFilter, setLevelFilter] = useState<WorkoutLevel[]>([]);
  const [goalFilter, setGoalFilter] = useState<WorkoutGoal[]>([]);
  const [equipmentFilter, setEquipmentFilter] = useState<WorkoutEquipment[]>([]);
  const [muscleFilter, setMuscleFilter] = useState<string[]>([]);
  const [builderFilter, setBuilderFilter] = useState<string[]>([]);
  // "Favorites only" toggle — narrows the grid to starred presets.
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { isFavorite, count: favoritesCount } = useFavoriteWorkoutPresets();

  // "Builder" options come from the trainer's full team: themselves
  // (current user) plus every sub-trainer with system access.
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

  /**
   * Frequency comes EXCLUSIVELY from the trainer-tagged
   * `workoutsPerWeek` field — no fallback to `workoutPlans.length`.
   */
  const getWpw = (p: PresetItem) =>
    typeof p.workoutsPerWeek === "number" ? p.workoutsPerWeek : -1;

  const durationMatches = (dur: number, bands: string[]): boolean => {
    if (bands.length === 0) return true;
    if (dur < 0) return false;
    return bands.some((band) => {
      const range = DURATION_OPTIONS.find((o) => o.value === band);
      if (!range) return false;
      if (band === "≤30") return dur <= 30;
      // "90+" is open-ended on the upper bound — inclusive on min.
      if (band === "90+") return dur >= 90;
      return dur > range.min && dur <= range.max;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = data.filter((p) => {
      if (favoritesOnly && !isFavorite(p._id)) return false;
      if (q && !p.name?.toLowerCase().includes(q)) return false;
      if (weekFilter.length > 0) {
        const wpw = getWpw(p);
        const ok = weekFilter.some((w) => wpw === Number(w));
        if (!ok) return false;
      }
      if (!durationMatches(p.durationMinutes ?? -1, durationFilter)) return false;
      if (levelFilter.length > 0 && (!p.level || !levelFilter.includes(p.level))) return false;
      if (goalFilter.length > 0 && (!p.goal || !goalFilter.includes(p.goal))) return false;
      if (equipmentFilter.length > 0 && (!p.equipment || !equipmentFilter.includes(p.equipment)))
        return false;
      if (muscleFilter.length > 0) {
        const tags = p.muscleFocus ?? [];
        if (!tags.some((t) => muscleFilter.includes(t))) return false;
      }
      if (
        builderFilter.length > 0 &&
        !(p.builtByTrainerId && builderFilter.includes(p.builtByTrainerId))
      )
        return false;
      return true;
    });
    // Council: favourited cards float to top automatically — gives
    // the trainer immediate value even before they touch the filter
    // chip. Stable sort preserves the original order within each band.
    return [...matches].sort((a, b) => {
      const af = isFavorite(a._id) ? 1 : 0;
      const bf = isFavorite(b._id) ? 1 : 0;
      return bf - af;
    });
  }, [
    data,
    search,
    weekFilter,
    durationFilter,
    levelFilter,
    goalFilter,
    equipmentFilter,
    muscleFilter,
    builderFilter,
    favoritesOnly,
    isFavorite,
  ]);

  const anyFilterActive =
    weekFilter.length +
      durationFilter.length +
      levelFilter.length +
      goalFilter.length +
      equipmentFilter.length +
      muscleFilter.length +
      builderFilter.length >
    0;

  const clearAll = () => {
    setWeekFilter([]);
    setDurationFilter([]);
    setLevelFilter([]);
    setGoalFilter([]);
    setEquipmentFilter([]);
    setMuscleFilter([]);
    setBuilderFilter([]);
  };

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-4"
      style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
    >
      {/* Toolbar — single row with search + per-category dropdowns */}
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
              placeholder="חיפוש לפי שם תבנית…"
              className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pr-8 pl-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          {/* "Favourites only" chip — chips with a star icon and a
              count badge. Always available; visually highlighted when
              active so the trainer never wonders whether the filter
              is on or off. */}
          <button
            type="button"
            onClick={() => setFavoritesOnly((v) => !v)}
            aria-pressed={favoritesOnly}
            className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all ${
              favoritesOnly
                ? "border-amber-300 bg-amber-50 text-amber-700 shadow-sm shadow-amber-200/50 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
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

          <FilterDropdown
            label="תדירות"
            icon={<FaCalendarWeek size={11} />}
            tone="blue"
            options={WEEK_OPTIONS}
            selected={weekFilter}
            onToggle={(v) => setWeekFilter(toggle(weekFilter, v))}
          />
          <FilterDropdown
            label="משך"
            icon={<FaClock size={11} />}
            tone="amber"
            options={DURATION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            selected={durationFilter}
            onToggle={(v) => setDurationFilter(toggle(durationFilter, v))}
          />
          <FilterDropdown
            label="רמה"
            icon={<FaSignal size={11} />}
            tone="violet"
            options={LEVEL_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            selected={levelFilter}
            onToggle={(v) => setLevelFilter(toggle(levelFilter, v as WorkoutLevel))}
          />
          <FilterDropdown
            label="דגש"
            icon={<FaBullseye size={11} />}
            tone="rose"
            options={GOAL_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            selected={goalFilter}
            onToggle={(v) => setGoalFilter(toggle(goalFilter, v as WorkoutGoal))}
          />
          <FilterDropdown
            label="ציוד"
            icon={<FaDumbbell size={11} />}
            tone="emerald"
            options={EQUIPMENT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            selected={equipmentFilter}
            onToggle={(v) => setEquipmentFilter(toggle(equipmentFilter, v as WorkoutEquipment))}
          />
          <FilterDropdown
            label="פוקוס שריר"
            icon={<FaPersonRays size={11} />}
            tone="sky"
            options={MUSCLE_FOCUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            selected={muscleFilter}
            onToggle={(v) => setMuscleFilter(toggle(muscleFilter, v))}
          />
          {builderOptions.length > 0 && (
            <FilterDropdown
              label="מאמן שבנה"
              icon={<FaUser size={11} />}
              tone="indigo"
              options={builderOptions}
              selected={builderFilter}
              onToggle={(v) => setBuilderFilter(toggle(builderFilter, v))}
            />
          )}

          {anyFilterActive && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-600"
            >
              נקה סינון
            </button>
          )}

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filtered.length} {filtered.length === 1 ? "תבנית" : "תבניות"}
            {filtered.length !== data.length && ` מתוך ${data.length}`}
          </span>

          <button
            type="button"
            onClick={onAddNew}
            className="ms-auto inline-flex items-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-4 py-2 text-sm font-bold text-white shadow-sm"
          >
            <FaPlus size={11} />
            {addLabel}
          </button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-400 shadow-sm">
            <FaMagnifyingGlass size={20} />
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">
            {anyFilterActive || search ? "לא נמצאו תבניות התואמות לסינון" : "עדיין אין תבניות"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {anyFilterActive || search ? "נסה לנקות את הסינון" : "התחל ביצירת תבנית חדשה"}
          </p>
          {anyFilterActive || search ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                clearAll();
              }}
              className="mt-1 inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            >
              נקה סינון
            </button>
          ) : (
            <button
              type="button"
              onClick={onAddNew}
              className="mt-1 inline-flex items-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-4 py-2 text-sm font-bold text-white shadow-sm"
            >
              <FaPlus size={11} />
              {addLabel}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((preset) => (
            <WorkoutPresetCard
              key={preset._id || preset.name}
              preset={preset}
              onOpen={onOpen}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------- */

/**
 * Per-category tone palette — each filter category gets its own quiet
 * tint when idle (icon + soft accent edge), so the toolbar reads as a
 * row of distinct chips rather than a wall of grey. Hover deepens the
 * tint; when there's an active selection we switch to the brand
 * gradient so it's unmistakable that the filter is engaged.
 */
type FilterTone = "blue" | "amber" | "violet" | "rose" | "emerald" | "sky" | "indigo";
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
};

/**
 * FilterDropdown — per-category pill button that opens a checkable
 * multi-select list below it. Same component as in DietPlanPresetGrid
 * so the two preset pages share the exact same filter UX.
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

export default WorkoutPresetGrid;
