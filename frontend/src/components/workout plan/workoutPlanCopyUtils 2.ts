import { IMuscleGroupWorkouts, IWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { deepClone, generateUUID } from "@/lib/utils";

export interface CopyMuscleGroupRequest {
  sourceWorkoutIndex: number;
  sourceMuscleGroupIndex: number;
  targetWorkoutIndex: number;
}

const cloneExerciseForCopy = (exercise: IMuscleGroupWorkouts["exercises"][number]) => {
  const clonedExercise = deepClone(exercise);

  return {
    ...clonedExercise,
    _id: generateUUID(),
    sets: clonedExercise.sets.map((set) => ({
      ...set,
      _id: generateUUID(),
    })),
  };
};

export const cloneMuscleGroupForCopy = (
  muscleGroup: IMuscleGroupWorkouts
): IMuscleGroupWorkouts => {
  const clonedMuscleGroup = deepClone(muscleGroup);

  return {
    ...clonedMuscleGroup,
    _id: generateUUID(),
    exercises: clonedMuscleGroup.exercises.map(cloneExerciseForCopy),
  };
};

export const findMuscleGroupIndex = (workout: IWorkoutPlan, muscleGroupName: string) =>
  workout.muscleGroups.findIndex((group) => group.muscleGroup === muscleGroupName);

export const getWorkoutExerciseCount = (workout: IWorkoutPlan) =>
  workout.muscleGroups.reduce((total, group) => total + (group.exercises?.length ?? 0), 0);

export const getWorkoutDisplayName = (workout: IWorkoutPlan, index: number) => {
  const planName = workout.planName?.trim();

  if (planName) return planName;

  return `אימון ${index + 1}`;
};
