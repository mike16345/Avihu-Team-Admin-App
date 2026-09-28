import { extractExercises } from "@/lib/workoutUtils";

import {
  ALL_GROUP_LABEL,
  FALLBACK_GROUPS,
  type ExerciseDetailSession,
  type FlatExercise,
  type RecordedSet,
} from "./workoutProgressionModel";

const getServerGroups = (rawData: any) => {
  if (Array.isArray(rawData)) return rawData;
  if (Array.isArray(rawData?.data)) return rawData.data;
  return [];
};

const splitDetailSessionDate = (date: string) => {
  let separator = "/";

  if (date.includes(".")) {
    separator = ".";
  }

  return date.split(separator);
};

export function flattenRecordedWorkouts(recordedWorkouts?: any[]): FlatExercise[] {
  if (!recordedWorkouts?.length) return [];

  const exercises: FlatExercise[] = [];
  recordedWorkouts.forEach((muscleGroup: any) => {
    Object.keys(muscleGroup.recordedSets || {}).forEach((exerciseName) => {
      const sets: RecordedSet[] = muscleGroup.recordedSets[exerciseName] || [];
      const sessionsByDate: Record<string, { weight: number; reps: number; date: Date }> = {};

      sets.forEach((set) => {
        const date = new Date(set.date || new Date());
        const dateKey = date.toISOString().split("T")[0];
        const weight = set.weight ?? 0;
        const reps = set.repsDone ?? 0;

        if (!sessionsByDate[dateKey] || weight > sessionsByDate[dateKey].weight) {
          sessionsByDate[dateKey] = { weight, reps, date };
        }
      });

      const sessions = Object.values(sessionsByDate).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      if (sessions.length > 0) {
        exercises.push({ name: exerciseName, group: muscleGroup.muscleGroup, sessions });
      }
    });
  });

  return exercises;
}

export function getAvailableGroups(flatExercises: FlatExercise[], muscleGroupsFromServer: unknown) {
  const rawData: any = muscleGroupsFromServer;
  const serverGroups: any[] = getServerGroups(rawData);
  const groupsFromServer: string[] = serverGroups
    .map((muscleGroup) => muscleGroup?.name)
    .filter(Boolean);
  const groupsFromData = new Set<string>(flatExercises.map((exercise) => exercise.group));

  const merged: string[] = [ALL_GROUP_LABEL];
  FALLBACK_GROUPS.forEach((group) => {
    if (!merged.includes(group)) merged.push(group);
  });
  groupsFromServer.forEach((group) => {
    if (!merged.includes(group)) merged.push(group);
  });
  groupsFromData.forEach((group) => {
    if (!merged.includes(group)) merged.push(group);
  });

  return merged;
}

export function getInitialWorkoutSelection(recordedWorkouts?: any[]) {
  const initialMuscleGroup = recordedWorkouts?.[0]?.muscleGroup || "";
  const initialExercise = extractExercises(recordedWorkouts?.[0]?.recordedSets)[0] || "";

  if (!initialMuscleGroup && !initialExercise) return null;

  return { initialMuscleGroup, initialExercise };
}

export function getDetailRawSets(recordedWorkouts: unknown, detailExercise: FlatExercise | null) {
  if (!detailExercise) return [];

  const muscleGroup = (recordedWorkouts as any[])?.find(
    (recordedWorkout) => recordedWorkout.muscleGroup === detailExercise.group
  );

  return muscleGroup?.recordedSets?.[detailExercise.name] || [];
}

export function isExpectedRecordedSetsEmptyError(error: unknown) {
  const status = (error as any)?.status;

  return (
    status === 401 ||
    status === 403 ||
    status === 404 ||
    (error as any)?.data?.message === "Data could not be retrieved!"
  );
}

export function groupExerciseDetailSessions(rawSets: any[]): ExerciseDetailSession[] {
  const byDate = new Map<string, any[]>();

  rawSets.forEach((set) => {
    const date = new Date(set.date || new Date());
    const key = date.toLocaleDateString("he-IL");
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push({
      setNumber: set.setNumber || 1,
      weight: set.weight ?? 0,
      reps: set.repsDone ?? 0,
      program: set.plan,
    });
  });

  return Array.from(byDate.entries())
    .map(([date, sets]) => ({
      date,
      sets: sets.sort((a, b) => a.setNumber - b.setNumber),
    }))
    .sort((a, b) => {
      const [dayA, monthA, yearA] = splitDetailSessionDate(a.date);
      const [dayB, monthB, yearB] = splitDetailSessionDate(b.date);
      return (
        new Date(`${yearA}-${monthA}-${dayA}`).getTime() -
        new Date(`${yearB}-${monthB}-${dayB}`).getTime()
      );
    });
}
