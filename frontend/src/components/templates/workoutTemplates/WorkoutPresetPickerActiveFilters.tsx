import { FaXmark } from "react-icons/fa6";
import { WorkoutEquipment, WorkoutGoal, WorkoutLevel } from "@/interfaces/IWorkoutPlan";
import { ActiveChip } from "./WorkoutPresetPickerPrimitives";
import {
  ActiveDurationFilter,
  ActiveWeekFilter,
  durationLabelOf,
  equipmentLabelOf,
  goalLabelOf,
  levelLabelOf,
  muscleLabelOf,
} from "./workoutPresetPickerUtils";

type WorkoutPresetPickerActiveFiltersProps = {
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
  onClearAll: () => void;
};

const WorkoutPresetPickerActiveFilters = ({
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
  onClearAll,
}: WorkoutPresetPickerActiveFiltersProps) => (
  <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-white/70 px-6 py-2.5 dark:border-slate-800 dark:bg-slate-900/60">
    {weekFilter.map((week) => (
      <ActiveChip
        key={`w-${week}`}
        label={`${week}× בשבוע`}
        onRemove={() => setWeekFilter((previous) => previous.filter((value) => value !== week))}
      />
    ))}
    {durationFilter.map((duration) => (
      <ActiveChip
        key={`d-${duration}`}
        label={durationLabelOf(duration)}
        onRemove={() =>
          setDurationFilter((previous) => previous.filter((value) => value !== duration))
        }
      />
    ))}
    {levelFilter.map((level) => (
      <ActiveChip
        key={`l-${level}`}
        label={levelLabelOf(level)}
        onRemove={() => setLevelFilter((previous) => previous.filter((value) => value !== level))}
      />
    ))}
    {goalFilter.map((goal) => (
      <ActiveChip
        key={`g-${goal}`}
        label={goalLabelOf(goal)}
        onRemove={() => setGoalFilter((previous) => previous.filter((value) => value !== goal))}
      />
    ))}
    {equipmentFilter.map((equipment) => (
      <ActiveChip
        key={`e-${equipment}`}
        label={equipmentLabelOf(equipment)}
        onRemove={() =>
          setEquipmentFilter((previous) => previous.filter((value) => value !== equipment))
        }
      />
    ))}
    {muscleFilter.map((muscle) => (
      <ActiveChip
        key={`m-${muscle}`}
        label={muscleLabelOf(muscle)}
        onRemove={() => setMuscleFilter((previous) => previous.filter((value) => value !== muscle))}
      />
    ))}
    <button
      type="button"
      onClick={onClearAll}
      className="ms-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
    >
      <FaXmark size={10} />
      נקה הכל
    </button>
  </div>
);

export default WorkoutPresetPickerActiveFilters;
