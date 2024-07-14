import React, { useState } from "react";
import { ExerciseProgressChart } from "./ExerciseProgressChart";
import { useParams } from "react-router";
import { MuscleGroupCombobox } from "./MuscleGroupCombobox";
import { Label } from "@/components/ui/label";
import { RecordedSetsList } from "./RecordedSetsList";

export const WorkoutProgression = () => {
  const { id } = useParams();

  const [recordedWorkouts, setRecordedWorkouts] = useState<any[]>([]);

  // TODO: Fetch workout progress data for the given user and exercise

  return (
    <div className="size-full flex flex-col gap-4 p-4">
      <div className="flex items-center gap-8">
        <div className="flex flex-col gap-1">
          <Label>קבוצת שריר</Label>
          <MuscleGroupCombobox />
        </div>
        <div className="flex flex-col gap-1">
          <Label>תרגיל</Label>
          <MuscleGroupCombobox />
        </div>
      </div>
      <div className="w-full flex gap-4">
        <div className="w-4/6">
          <ExerciseProgressChart />
        </div>
        <div className="w-2/6 border">
          <RecordedSetsList />
        </div>
      </div>
    </div>
  );
};
