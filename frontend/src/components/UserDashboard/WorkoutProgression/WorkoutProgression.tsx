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

  const [recordedWorkouts, setRecordedWorkouts] = useState<IMuscleGroupRecordedSets | null>();
  const [recordedSets, setRecordedSets] = useState<IRecordedSet[]>(
    recordedWorkouts.recordedSets[0]
  );
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
      <MuscleExerciseSelector />
      <div className="w-full flex gap-4">
        <div className="w-4/6">
          <ExerciseProgressChart />
        </div>
        <div className="w-2/6 border rounded-lg ">
          <RecordedSetsList />
        </div>
      </div>
    </div>
  );
};
