import React, { useMemo, useState } from "react";
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
import WorkoutPresetFilterDropdown from "./WorkoutPresetFilterDropdown";

type PresetItem = IWorkoutPlanPreset & { _id?: string };

interface WorkoutPresetGridProps {
  data: PresetItem[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  addLabel: string;
}

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

const toggle = <T,>(arr: T[], val: T): T[] => {
  if (arr.includes(val)) return arr.filter((v) => v !== val);
  return [...arr, val];
};

const getFavoriteButtonClassName = (favoritesOnly: boolean) => {
  if (favoritesOnly) {
    return "border-amber-300 bg-amber-50 text-amber-700 shadow-sm shadow-amber-200/50 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
  }

  return "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
};

const getFavoriteCountClassName = (favoritesOnly: boolean) => {
  if (favoritesOnly) return "bg-amber-500 text-white";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
};

const getWorkoutFrequency = (preset: PresetItem) => {
  if (typeof preset.workoutsPerWeek === "number") return preset.workoutsPerWeek;
  return -1;
};

const getFavoriteSortWeight = (preset: PresetItem, isFavorite: (presetId?: string) => boolean) => {
  if (isFavorite(preset._id)) return 1;
  return 0;
};

const getEmptyStateText = (hasFilter: boolean) => {
  if (hasFilter) {
    return {
      title: "לא נמצאו תבניות התואמות לסינון",
      subtitle: "נסה לנקות את הסינון",
    };
  }

  return {
    title: "עדיין אין תבניות",
    subtitle: "התחל ביצירת תבנית חדשה",
  };
};

const getPresetCountLabel = (count: number) => {
  if (count === 1) return "תבנית";
  return "תבניות";
};

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
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { isFavorite, count: favoritesCount } = useFavoriteWorkoutPresets();

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

  const durationMatches = (dur: number, bands: string[]): boolean => {
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = data.filter((p) => {
      if (favoritesOnly && !isFavorite(p._id)) return false;
      if (q && !p.name?.toLowerCase().includes(q)) return false;
      if (weekFilter.length > 0) {
        const wpw = getWorkoutFrequency(p);
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

    return [...matches].sort((a, b) => {
      const af = getFavoriteSortWeight(a, isFavorite);
      const bf = getFavoriteSortWeight(b, isFavorite);
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
  const hasSearch = Boolean(search);
  const hasNoResults = filtered.length === 0;
  const hasEmptyFilterState = anyFilterActive || hasSearch;
  const emptyStateText = getEmptyStateText(hasEmptyFilterState);
  const presetCountLabel = getPresetCountLabel(filtered.length);

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
    <div dir="rtl" className="flex flex-col gap-4 font-heebo">
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

          <button
            type="button"
            onClick={() => setFavoritesOnly((v) => !v)}
            aria-pressed={favoritesOnly}
            className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all ${getFavoriteButtonClassName(
              favoritesOnly
            )}`}
          >
            <FaStar size={11} />
            מועדפים
            {favoritesCount > 0 && (
              <span
                className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${getFavoriteCountClassName(
                  favoritesOnly
                )}`}
              >
                {favoritesCount}
              </span>
            )}
          </button>

          <WorkoutPresetFilterDropdown
            label="תדירות"
            icon={<FaCalendarWeek size={11} />}
            tone="blue"
            options={WEEK_OPTIONS}
            selected={weekFilter}
            onToggle={(v) => setWeekFilter(toggle(weekFilter, v))}
          />
          <WorkoutPresetFilterDropdown
            label="משך"
            icon={<FaClock size={11} />}
            tone="amber"
            options={DURATION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            selected={durationFilter}
            onToggle={(v) => setDurationFilter(toggle(durationFilter, v))}
          />
          <WorkoutPresetFilterDropdown
            label="רמה"
            icon={<FaSignal size={11} />}
            tone="violet"
            options={LEVEL_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            selected={levelFilter}
            onToggle={(v) => setLevelFilter(toggle(levelFilter, v as WorkoutLevel))}
          />
          <WorkoutPresetFilterDropdown
            label="דגש"
            icon={<FaBullseye size={11} />}
            tone="rose"
            options={GOAL_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            selected={goalFilter}
            onToggle={(v) => setGoalFilter(toggle(goalFilter, v as WorkoutGoal))}
          />
          <WorkoutPresetFilterDropdown
            label="ציוד"
            icon={<FaDumbbell size={11} />}
            tone="emerald"
            options={EQUIPMENT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            selected={equipmentFilter}
            onToggle={(v) => setEquipmentFilter(toggle(equipmentFilter, v as WorkoutEquipment))}
          />
          <WorkoutPresetFilterDropdown
            label="פוקוס שריר"
            icon={<FaPersonRays size={11} />}
            tone="sky"
            options={MUSCLE_FOCUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            selected={muscleFilter}
            onToggle={(v) => setMuscleFilter(toggle(muscleFilter, v))}
          />
          {builderOptions.length > 0 && (
            <WorkoutPresetFilterDropdown
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
            {filtered.length} {presetCountLabel}
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

      {hasNoResults && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-400 shadow-sm">
            <FaMagnifyingGlass size={20} />
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">
            {emptyStateText.title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{emptyStateText.subtitle}</p>
          {hasEmptyFilterState && (
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
          )}
          {!hasEmptyFilterState && (
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
      )}
      {!hasNoResults && (
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

export default WorkoutPresetGrid;
