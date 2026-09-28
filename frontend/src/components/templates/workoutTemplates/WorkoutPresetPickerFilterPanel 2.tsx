import {
  FaBullseye,
  FaCalendarWeek,
  FaClock,
  FaDumbbell,
  FaPersonRays,
  FaSignal,
  FaSliders,
  FaXmark,
} from "react-icons/fa6";
import { WorkoutEquipment, WorkoutGoal, WorkoutLevel } from "@/interfaces/IWorkoutPlan";
import {
  EQUIPMENT_OPTIONS,
  GOAL_OPTIONS,
  LEVEL_OPTIONS,
  MUSCLE_FOCUS_OPTIONS,
} from "@/lib/workoutMeta";
import { FilterSection } from "./WorkoutPresetPickerPrimitives";
import {
  ActiveDurationFilter,
  ActiveWeekFilter,
  DURATION_OPTIONS,
  getFilterOptionButtonClassName,
  getWeekFilterOptionButtonClassName,
  toggleIn,
  WEEK_OPTIONS,
} from "./workoutPresetPickerUtils";

type WorkoutPresetPickerFilterPanelProps = {
  openSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  onClose: () => void;
  weekFilter: ActiveWeekFilter[];
  setWeekFilter: React.Dispatch<React.SetStateAction<ActiveWeekFilter[]>>;
  durationFilter: ActiveDurationFilter[];
  setDurationFilter: React.Dispatch<React.SetStateAction<ActiveDurationFilter[]>>;
  levelFilter: WorkoutLevel[];
  setLevelFilter: React.Dispatch<React.SetStateAction<WorkoutLevel[]>>;
  goalFilter: WorkoutGoal[];
  setGoalFilter: React.Dispatch<React.SetStateAction<WorkoutGoal[]>>;
  equipmentFilter: WorkoutEquipment[];
  setEquipmentFilter: React.Dispatch<React.SetStateAction<WorkoutEquipment[]>>;
  muscleFilter: string[];
  setMuscleFilter: React.Dispatch<React.SetStateAction<string[]>>;
  hasActiveFilters: boolean;
  activeChipCount: number;
  filteredCount: number;
  onClearAll: () => void;
};

const WorkoutPresetPickerFilterPanel = ({
  openSections,
  onToggleSection,
  onClose,
  weekFilter,
  setWeekFilter,
  durationFilter,
  setDurationFilter,
  levelFilter,
  setLevelFilter,
  goalFilter,
  setGoalFilter,
  equipmentFilter,
  setEquipmentFilter,
  muscleFilter,
  setMuscleFilter,
  hasActiveFilters,
  activeChipCount,
  filteredCount,
  onClearAll,
}: WorkoutPresetPickerFilterPanelProps) => (
  <aside className="relative flex w-[340px] shrink-0 flex-col overflow-hidden bg-gradient-to-b from-slate-200/70 via-slate-100/80 to-slate-200/50 shadow-[-4px_0_12px_-6px_rgba(15,23,42,0.12)] dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900">
    <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-slate-300/70 to-transparent dark:via-slate-700/60" />
    <div className="relative flex items-start justify-between gap-2 px-5 py-4">
      <div className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-gradient-to-l from-transparent via-slate-200 to-transparent dark:via-slate-700" />
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300">
          <FaSliders size={13} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">סינון תבניות</h3>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            התאם את התבניות לצרכים שלך
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="סגור סינון"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800"
      >
        <FaXmark size={12} />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto px-5 py-2">
      <FilterSection
        id="muscle"
        label="פוקוס שריר"
        icon={<FaPersonRays size={11} />}
        count={muscleFilter.length}
        open={openSections.muscle}
        onToggle={() => onToggleSection("muscle")}
      >
        <div className="flex flex-wrap gap-1.5">
          {MUSCLE_FOCUS_OPTIONS.map((option) => {
            const active = muscleFilter.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMuscleFilter((previous) => toggleIn(previous, option.value))}
                className={`h-7 rounded-md border px-2.5 text-xs font-bold transition-all ${getFilterOptionButtonClassName(
                  active
                )}`}
              >
                {option.label}
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
        onToggle={() => onToggleSection("level")}
      >
        <div className="flex flex-wrap gap-1.5">
          {LEVEL_OPTIONS.map((option) => {
            const active = levelFilter.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setLevelFilter((previous) => toggleIn(previous, option.value))}
                className={`h-7 rounded-md border px-2.5 text-xs font-bold transition-all ${getFilterOptionButtonClassName(
                  active
                )}`}
              >
                {option.label}
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
        onToggle={() => onToggleSection("duration")}
      >
        <div className="flex flex-wrap gap-1.5">
          {DURATION_OPTIONS.filter((option) => option.value !== "all").map((option) => {
            const value = option.value as ActiveDurationFilter;
            const active = durationFilter.includes(value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setDurationFilter((previous) => toggleIn(previous, value))}
                className={`h-7 rounded-md border px-2.5 text-xs font-bold transition-all ${getFilterOptionButtonClassName(
                  active
                )}`}
              >
                {option.label}
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
        onToggle={() => onToggleSection("equipment")}
      >
        <div className="flex flex-wrap gap-1.5">
          {EQUIPMENT_OPTIONS.map((option) => {
            const active = equipmentFilter.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setEquipmentFilter((previous) => toggleIn(previous, option.value))}
                className={`h-7 rounded-md border px-2.5 text-xs font-bold transition-all ${getFilterOptionButtonClassName(
                  active
                )}`}
              >
                {option.label}
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
        onToggle={() => onToggleSection("goal")}
      >
        <div className="flex flex-wrap gap-1.5">
          {GOAL_OPTIONS.map((option) => {
            const active = goalFilter.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setGoalFilter((previous) => toggleIn(previous, option.value))}
                className={`h-7 rounded-md border px-2.5 text-xs font-bold transition-all ${getFilterOptionButtonClassName(
                  active
                )}`}
              >
                {option.label}
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
        onToggle={() => onToggleSection("week")}
        isLast
      >
        <div className="flex flex-wrap gap-1.5">
          {WEEK_OPTIONS.filter((option) => option.value !== "all").map((option) => {
            const value = option.value as ActiveWeekFilter;
            const active = weekFilter.includes(value);

            return (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => setWeekFilter((previous) => toggleIn(previous, value))}
                className={getWeekFilterOptionButtonClassName(active)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>

    <div className="relative flex flex-col gap-1.5 px-5 py-4">
      <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-l from-transparent via-slate-200 to-transparent dark:via-slate-700" />
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl brand-gradient brand-gradient-hover text-sm font-bold text-white shadow-md transition-all hover:shadow-lg"
      >
        הצג תוצאות ({filteredCount})
      </button>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex h-9 w-full items-center justify-center text-xs font-bold text-blue-600 transition-colors hover:text-blue-700"
        >
          נקה הכל
        </button>
      )}
      {activeChipCount === 0 && <span className="sr-only">אין מסננים פעילים</span>}
    </div>
  </aside>
);

export default WorkoutPresetPickerFilterPanel;
