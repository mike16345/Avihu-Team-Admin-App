import { FC } from "react";
import { ExerciseComboBox } from "./ExerciseComboBox";
import { MuscleGroupCombobox } from "./MuscleGroupCombobox";
import { Label } from "@/components/ui/label";
import { useParams, useSearchParams } from "react-router-dom";
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
  const [_, setSearchParams] = useSearchParams();

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

    // Update the URL with the new muscle group and reset exercise
    setSearchParams((prevParams) => {
      const updatedParams = new URLSearchParams(prevParams);
      updatedParams.set("muscleGroup", muscleGroup);
      updatedParams.set("exercise", exercises[0] || ""); // Set the first exercise if available
      return updatedParams;
    });
  };

  const handleSelectExercise = (exercise: string) => {
    if (exercise == selectedExercise) return;

    onSelectExercise(exercise);

    // Update the URL with the selected exercise
    setSearchParams((prevParams) => {
      const updatedParams = new URLSearchParams(prevParams);
      updatedParams.set("exercise", exercise);
      return updatedParams;
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
      <div className="flex flex-col gap-1 ">
        <Label>קבוצת שריר</Label>
        <MuscleGroupCombobox
          muscleGroups={muscleGroups}
          selectedMuscleGroup={selectedMuscleGroup}
          handleSelectMuscleGroup={handleSelectMuscleGroup}
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
