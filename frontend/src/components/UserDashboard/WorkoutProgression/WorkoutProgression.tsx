import React, { useState } from "react";
import { ExerciseProgressChart } from "./ExerciseProgressChart";
import { useParams } from "react-router";
import { MuscleGroupCombobox } from "./MuscleGroupCombobox";

export const WorkoutProgression = () => {
  const { id } = useParams();

  const [recordedWorkouts, setRecordedWorkouts] = useState<any[]>([]);

  // TODO: Fetch workout progress data for the given user and exercise

  return (
    <div className="size-full">
      <MuscleGroupCombobox />
      {/* <ExerciseProgressChart /> */}
    </div>
  );
};
