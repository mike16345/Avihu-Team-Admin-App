import { DateRange } from "react-day-picker";
import { IMuscleGroupRecordedSets, IRecordedSet } from "@/interfaces/IWorkout";
import DateUtils from "./dateUtils";

interface ExerciseProgressNoteInput {
  userName?: string;
  selectedByMuscleGroup: Record<string, string[]>;
  muscleGroupOrder?: string[];
  dateRange?: DateRange;
  recordedWorkouts?: IMuscleGroupRecordedSets[];
}

interface ExerciseInstance {
  key: string;
  date: Date;
  sets: IRecordedSet[];
}

const formatDate = (date?: Date) => {
  if (!date) {
    return "לא צוין תאריך";
  }

  return DateUtils.formatDate(date, "DD/MM/YYYY");
};

const formatValue = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "לא קיים";
  }

  return value.toString();
};

const getDateKey = (date: Date) => date.toISOString().split("T")[0];

const groupByInstance = (sets: IRecordedSet[]) => {
  const map = new Map<string, ExerciseInstance>();

  sets.forEach((set) => {
    if (!set?.date) return;

    const date = new Date(set.date);
    const planKey = set.plan ? `${set.plan}` : "no-plan";
    const key = `${getDateKey(date)}__${planKey}`;

    if (!map.has(key)) {
      map.set(key, { key, date, sets: [] });
    }

    map.get(key)!.sets.push(set);
  });

  return Array.from(map.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
};

const getMaxWeightSet = (sets: IRecordedSet[]) => {
  return sets.reduce<IRecordedSet | null>((maxSet, current) => {
    if (!maxSet) return current;
    const currentWeight = typeof current.weight === "number" ? current.weight : -Infinity;
    const maxWeight = typeof maxSet.weight === "number" ? maxSet.weight : -Infinity;

    return currentWeight > maxWeight ? current : maxSet;
  }, null);
};

const isWithinRange = (date: Date, range?: DateRange) => {
  if (!range?.from || !range?.to) {
    return true;
  }

  const start = new Date(range.from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(range.to);
  end.setHours(23, 59, 59, 999);

  return date >= start && date <= end;
};

const getInstanceSummary = (instance?: ExerciseInstance) => {
  const maxSet = instance ? getMaxWeightSet(instance.sets) : null;

  return {
    weight: formatValue(maxSet?.weight),
    reps: formatValue(maxSet?.repsDone),
    dateLabel: instance ? formatDate(instance.date) : formatDate(undefined),
  };
};

export const generateExerciseProgressNote = ({
  userName,
  selectedByMuscleGroup,
  muscleGroupOrder,
  dateRange,
  recordedWorkouts,
}: ExerciseProgressNoteInput) => {
  const totalSelected = Object.values(selectedByMuscleGroup || {}).reduce(
    (count, exercises) => count + exercises.length,
    0
  );

  if (!totalSelected) {
    return "";
  }

  const greeting = userName?.trim() ? `מה איתך ${userName.trim()}` : "מה איתך";
  const introLine = "עברתי על ההתקדמות שלך";
  const noteLines: string[] = [greeting, introLine, ""];

  const orderedMuscleGroups = (
    muscleGroupOrder?.length ? muscleGroupOrder : Object.keys(selectedByMuscleGroup)
  ).filter((muscleGroup) => selectedByMuscleGroup[muscleGroup]?.length);

  orderedMuscleGroups.forEach((muscleGroup, muscleGroupIndex) => {
    const groupSelections = selectedByMuscleGroup[muscleGroup] || [];
    const recordedGroup = recordedWorkouts?.find(
      (recorded) => recorded.muscleGroup === muscleGroup
    );

    noteLines.push(`*${muscleGroup}*:`);

    groupSelections.forEach((exercise, exerciseIndex) => {
      const setsForExercise =
        recordedGroup?.recordedSets?.[exercise]?.filter((set) => set?.date) ?? [];

      const allInstances = groupByInstance(setsForExercise);
      const firstInstance = allInstances[0];

      const rangeInstances = allInstances.filter((instance) =>
        isWithinRange(instance.date, dateRange)
      );
      const firstRangeInstance = rangeInstances[0];
      const lastRangeInstance = rangeInstances[rangeInstances.length - 1];

      const overallSummary = getInstanceSummary(firstInstance);
      const rangeStartSummary = getInstanceSummary(firstRangeInstance);
      const rangeEndSummary = getInstanceSummary(lastRangeInstance);

      noteLines.push(`*${exercise.trim()}*`);
      noteLines.push(`התחלה בתוכנית: משקל${overallSummary.weight} (חזרות: ${overallSummary.reps})`);
      noteLines.push(
        `מ-${rangeStartSummary.dateLabel}: משקל ${rangeStartSummary.weight} (חזרות: ${rangeStartSummary.reps})`
      );
      noteLines.push(
        `עד-${rangeEndSummary.dateLabel}: משקל ${rangeEndSummary.weight} (חזרות: ${rangeEndSummary.reps})`
      );

      if (exerciseIndex < groupSelections.length - 1) {
        noteLines.push("");
      }
    });

    if (muscleGroupIndex < orderedMuscleGroups.length - 1) {
      noteLines.push("");
    }
  });

  noteLines.push("");
  noteLines.push("מטרה:");
  noteLines.push("");

  return noteLines.join("\n");
};
