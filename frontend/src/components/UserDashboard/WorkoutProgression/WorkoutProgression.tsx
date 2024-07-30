import { useState } from "react";
import { ExerciseProgressChart } from "./ExerciseProgressChart";
import { useParams } from "react-router";
import { RecordedSetsList } from "./RecordedSetsList";
import { MuscleExerciseSelector } from "./MuscleExerciseSelector";

export const WorkoutProgression = () => {
  const { id } = useParams();

  const [recordedWorkouts, setRecordedWorkouts] = useState<any[]>([]);

  // TODO: Fetch workout progress data for the given user and exercise

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
