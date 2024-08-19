import { useEffect, useState } from "react";
import { ExerciseProgressChart } from "./ExerciseProgressChart";
import { useParams } from "react-router";
import { RecordedSetsList } from "./RecordedSetsList";
import { MuscleExerciseSelector } from "./MuscleExerciseSelector";
import { IMuscleGroupRecordedSets } from "@/interfaces/IWorkout";
import { useRecordedSetsApi } from "@/hooks/api/useRecordedSetsApi";
import { extractExercises } from "@/lib/workoutUtils";

export const WorkoutProgression = () => {
  const { id } = useParams();
  const { getRecordedSetsByUserId } = useRecordedSetsApi();

  const [recordedWorkouts, setRecordedWorkouts] = useState<IMuscleGroupRecordedSets[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");

  const recordedMuscleGroup = recordedWorkouts?.find(
    (recordedMuscleGroup) => recordedMuscleGroup.muscleGroup == selectedMuscleGroup
  );

  const recordedSets = recordedMuscleGroup?.recordedSets[selectedExercise] || [];

  useEffect(() => {
    if (!id) return;

    getRecordedSetsByUserId(id)
      .then((recordedWorkouts) => {
        const initialMuscleGroup = recordedWorkouts[0]?.muscleGroup || "";
        const initialExercise = extractExercises(recordedWorkouts[0]?.recordedSets)[0] || "";

        setRecordedWorkouts(recordedWorkouts);
        setSelectedMuscleGroup(initialMuscleGroup);
        setSelectedExercise(initialExercise);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="size-full flex flex-col gap-4 p-4">
      {recordedWorkouts.length > 0 && (
        <>
          <MuscleExerciseSelector
            selectedExercise={selectedExercise}
            recordedWorkouts={recordedWorkouts}
            selectedMuscleGroup={selectedMuscleGroup}
            onSelectExercise={(exercise) => setSelectedExercise(exercise)}
            onSelectMuscleGroup={(muscleGroup) => setSelectedMuscleGroup(muscleGroup)}
          />
          <div className="w-full flex flex-col md:flex-row gap-4">
            <div className="md:w-2/6 border rounded-lg ">
              <RecordedSetsList recordedSets={recordedSets} />
            </div>
            <div className="md:w-4/6">
              <ExerciseProgressChart
                selectedMuscleGroup={selectedMuscleGroup}
                selectedExercise={selectedExercise}
                recordedSets={recordedSets}
              />
            </div>
          </div>
        </>
      )}
      {recordedWorkouts.length == 0 && <h1 className="text-center">לא הקליטו אימונים</h1>}
    </div>
  );
};
