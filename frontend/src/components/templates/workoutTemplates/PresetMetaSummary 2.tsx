import {
  FaBullseye,
  FaCalendarWeek,
  FaCircleExclamation,
  FaClock,
  FaDumbbell,
  FaNoteSticky,
  FaPersonRays,
  FaSignal,
  FaUser,
} from "react-icons/fa6";

import { equipmentLabel, goalLabel, levelLabel } from "@/lib/workoutMeta";

import { GhostChip, SummaryChip } from "./PresetMetaPanelPrimitives";

export type PresetMetaValues = {
  workoutsPerWeek?: number;
  durationMinutes?: number;
  level?: string;
  goal?: string;
  equipment?: string;
  muscleFocus: string[];
  builtByTrainerId?: string;
  note: string;
  limitations: string;
};

type PresetMetaSummaryProps = {
  values: PresetMetaValues;
  builderName?: string;
  muscleNames: string[];
  onJumpToField: (id: string) => void;
};

export function PresetMetaSummary({
  values,
  builderName,
  muscleNames,
  onJumpToField,
}: PresetMetaSummaryProps) {
  return (
    <div className="order-3 flex w-full flex-wrap items-center gap-1.5 pt-1 sm:order-none sm:w-auto sm:flex-1 sm:pt-0">
      {values.workoutsPerWeek && (
        <SummaryChip
          icon={<FaCalendarWeek size={9} />}
          label={`${values.workoutsPerWeek}× בשבוע`}
          onClick={() => onJumpToField("workoutsPerWeek")}
        />
      )}
      {!values.workoutsPerWeek && (
        <GhostChip label="תדירות" onClick={() => onJumpToField("workoutsPerWeek")} />
      )}

      {values.durationMinutes && (
        <SummaryChip
          icon={<FaClock size={9} />}
          label={`${values.durationMinutes} דק׳`}
          onClick={() => onJumpToField("durationMinutes")}
        />
      )}
      {!values.durationMinutes && (
        <GhostChip label="משך" onClick={() => onJumpToField("durationMinutes")} />
      )}

      {values.level && (
        <SummaryChip
          icon={<FaSignal size={9} />}
          label={levelLabel(values.level as any) ?? values.level}
          onClick={() => onJumpToField("level")}
        />
      )}
      {!values.level && <GhostChip label="רמה" onClick={() => onJumpToField("level")} />}

      {values.goal && (
        <SummaryChip
          icon={<FaBullseye size={9} />}
          label={goalLabel(values.goal as any) ?? values.goal}
          onClick={() => onJumpToField("goal")}
        />
      )}
      {!values.goal && <GhostChip label="דגש" onClick={() => onJumpToField("goal")} />}

      {values.equipment && (
        <SummaryChip
          icon={<FaDumbbell size={9} />}
          label={equipmentLabel(values.equipment as any) ?? values.equipment}
          onClick={() => onJumpToField("equipment")}
        />
      )}
      {!values.equipment && <GhostChip label="ציוד" onClick={() => onJumpToField("equipment")} />}

      {muscleNames.length > 0 && (
        <SummaryChip
          icon={<FaPersonRays size={9} />}
          label={muscleNames.join(" · ")}
          onClick={() => onJumpToField("muscleFocus")}
        />
      )}
      {muscleNames.length === 0 && (
        <GhostChip label="פוקוס שריר" onClick={() => onJumpToField("muscleFocus")} />
      )}

      {builderName && (
        <SummaryChip
          icon={<FaUser size={9} />}
          label={builderName}
          onClick={() => onJumpToField("builtByTrainerId")}
        />
      )}
      {!builderName && (
        <GhostChip label="מאמן שבנה" onClick={() => onJumpToField("builtByTrainerId")} />
      )}

      {values.note.trim() && (
        <SummaryChip
          icon={<FaNoteSticky size={9} />}
          label="הערה"
          onClick={() => onJumpToField("note")}
        />
      )}
      {values.limitations.trim() && (
        <SummaryChip
          icon={<FaCircleExclamation size={9} />}
          label="מגבלות"
          onClick={() => onJumpToField("limitations")}
          tone="rose"
        />
      )}
    </div>
  );
}
