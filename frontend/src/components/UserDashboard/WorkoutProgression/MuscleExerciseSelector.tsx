import { useState } from "react";
import { ExerciseComboBox } from "./ExerciseComboBox";
import { MuscleGroupCombobox } from "./MuscleGroupCombobox";
import { Label } from "@/components/ui/label";

export const MuscleExerciseSelector = () => {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");

  return (
    <div className="flex items-center gap-8">
      <div className="flex flex-col gap-1">
        <Label>קבוצת שריר</Label>
        <MuscleGroupCombobox
          value={selectedMuscleGroup}
          onChange={(val) => setSelectedMuscleGroup(val)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label>תרגיל</Label>
        <ExerciseComboBox muscleGroup={selectedMuscleGroup} />
      </div>
    </div>
  );
};
