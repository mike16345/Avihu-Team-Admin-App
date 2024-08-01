import { FC } from "react";
import { ExerciseComboBox } from "./ExerciseComboBox";
import { MuscleGroupCombobox } from "./MuscleGroupCombobox";
import { Label } from "@/components/ui/label";
import { useParams } from "react-router-dom";
import { IMuscleGroupRecordedSets } from "@/interfaces/IWorkout";
import { extractExercises } from "@/lib/workoutUtils";

interface MuscleExerciseSelectorProps {
  recordedWorkouts: IMuscleGroupRecordedSets[];
  selectedMuscleGroup: string;
  selectedExercise: string;
  onSelectMuscleGroup: (muscleGroup: string) => void;
  onSelectExercise: (exercise: string) => void;
}

export const MuscleExerciseSelector: FC<MuscleExerciseSelectorProps> = ({
  selectedMuscleGroup,
  selectedExercise,
  recordedWorkouts,
  onSelectExercise,
  onSelectMuscleGroup,
}) => {
  const { id } = useParams();

  const muscleGroups = recordedWorkouts.map((workout) => workout.muscleGroup);
  const muscleGroupRecordedSets = recordedWorkouts.find(
    (workout) => workout.muscleGroup == selectedMuscleGroup
  );
  const muscleGroupRecordedExercises = extractExercises(muscleGroupRecordedSets?.recordedSets);

  const handleSelectMuscleGroup = async (muscleGroup: string) => {
    if (!id || muscleGroup == selectedMuscleGroup) return;

    const muscleGroupExercises = recordedWorkouts.find(
      (workout) => workout.muscleGroup == muscleGroup
    );
    const exercises = extractExercises(muscleGroupExercises?.recordedSets);

    onSelectExercise(exercises[0]);
    onSelectMuscleGroup(muscleGroup);
  };

  const handleSelectExercise = (exercise: string) => {
    if (exercise == selectedExercise) return;

    onSelectExercise(exercise);
  };

  return (
    <div className="flex items-center gap-8">
      <div className="flex flex-col gap-1">
        <Label>קבוצת שריר</Label>
        <MuscleGroupCombobox
          muscleGroups={muscleGroups}
          value={selectedMuscleGroup}
          onChange={(val) => handleSelectMuscleGroup(val)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label>תרגיל</Label>
        <ExerciseComboBox
          selectedExercise={selectedExercise}
          exercises={muscleGroupRecordedExercises}
          handleSelectExercise={handleSelectExercise}
        />
      </div>
    </div>
  );
};
