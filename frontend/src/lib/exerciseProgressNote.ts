import { DateRange } from "react-day-picker";
import { IMuscleGroupRecordedSets, IRecordedSet } from "@/interfaces/IWorkout";

interface ExerciseProgressNoteInput {
  userName?: string;
  selectedExercises: string[];
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
    return "לא זמין";
  }

  return date.toLocaleDateString("he-IL");
};

const formatValue = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "לא זמין";
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

const buildInstanceLines = (instance?: ExerciseInstance) => {
  if (!instance) {
    return ["אין נתונים זמינים."];
  }

  const maxSet = getMaxWeightSet(instance.sets);
  const date = maxSet?.date ? new Date(maxSet.date) : instance.date;

  return [
    `- תאריך: ${formatDate(date)}`,
    `- משקל: ${formatValue(maxSet?.weight)}`,
    `- חזרות: ${formatValue(maxSet?.repsDone)}`,
  ];
};

export const generateExerciseProgressNote = ({
  userName,
  selectedExercises,
  dateRange,
  recordedWorkouts,
}: ExerciseProgressNoteInput) => {
  if (!selectedExercises.length) {
    return "";
  }

  const greeting = userName?.trim() ? `היי ${userName.trim()},` : "היי,";
  const rangeLabel =
    dateRange?.from && dateRange?.to
      ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
      : "טווח לא נבחר";

  const noteLines: string[] = [greeting, "", "להלן ההתקדמות שלך:", ""];

  selectedExercises.forEach((exercise, index) => {
    const setsForExercise =
      recordedWorkouts
        ?.flatMap((group) => group.recordedSets?.[exercise] ?? [])
        .filter((set) => set?.date) ?? [];

    const allInstances = groupByInstance(setsForExercise);
    const firstInstance = allInstances[0];

    const rangeInstances = allInstances.filter((instance) =>
      isWithinRange(instance.date, dateRange)
    );
    const firstRangeInstance = rangeInstances[0];
    const lastRangeInstance = rangeInstances[rangeInstances.length - 1];
    const sameRangeInstance =
      firstRangeInstance?.key && firstRangeInstance.key === lastRangeInstance?.key;

    noteLines.push(`${exercise}:`);
    noteLines.push("מאז שהצטרפת:");
    noteLines.push(...buildInstanceLines(firstInstance));
    noteLines.push("");
    noteLines.push(`בטווח שנבחר (${rangeLabel}):`);

    if (!rangeInstances.length) {
      noteLines.push("אין נתונים בטווח שנבחר.");
    } else {
      noteLines.push(sameRangeInstance ? "התחלה (אותו אימון):" : "התחלה:");
      noteLines.push(...buildInstanceLines(firstRangeInstance));
      noteLines.push(sameRangeInstance ? "עדכני (אותו אימון):" : "עדכני:");
      noteLines.push(...buildInstanceLines(lastRangeInstance));
    }

    if (index < selectedExercises.length - 1) {
      noteLines.push("");
    }
  });

  return noteLines.join("\n");
};
