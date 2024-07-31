import { useEffect, useState } from "react";
import { ExerciseProgressChart } from "./ExerciseProgressChart";
import { useParams } from "react-router";
import { RecordedSetsList } from "./RecordedSetsList";
import { MuscleExerciseSelector } from "./MuscleExerciseSelector";
import { IMuscleGroupRecordedSets, IRecordedSet } from "@/interfaces/IWorkout";
import { useRecordedSetsApi } from "@/hooks/useRecordedSetsApi";

export const WorkoutProgression = () => {
  const { id } = useParams();
  const { getRecordedSetsByUserId } = useRecordedSetsApi();

  const [recordedWorkouts, setRecordedWorkouts] = useState<IMuscleGroupRecordedSets[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  const recordedMuscleGroup = recordedWorkouts?.find(
    (recordedMuscleGroup) => recordedMuscleGroup.muscleGroup == selectedMuscleGroup
  );

  const recordedSets = recordedMuscleGroup?.recordedSets[selectedExercise] || [];

  console.log("recorded sets:", recordedSets);

  // TODO: Fetch workout progress data for the given user and exercise

  useEffect(() => {
    if (!id) return;

    getRecordedSetsByUserId(id)
      .then((res) => setRecordedWorkouts(res))
      .catch((e) => console.error(e));
  }, []);

  console.log(recordedWorkouts);

  return (
    <div className="size-full flex flex-col gap-4 p-4">
      <MuscleExerciseSelector
        onSelectExercise={(exercise) => setSelectedExercise(exercise)}
        onSelectMuscleGroup={(muscleGroup) => setSelectedMuscleGroup(muscleGroup)}
      />
      <div className="w-full flex gap-4">
        <div className="w-4/6">
          <ExerciseProgressChart />
        </div>
        <div className="w-2/6 border rounded-lg ">
          <RecordedSetsList recordedSets={recordedSets} />
        </div>
      </div>
    </div>
  );
};
