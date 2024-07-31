import { useEffect, useState } from "react";
import { ExerciseComboBox } from "./ExerciseComboBox";
import { MuscleGroupCombobox } from "./MuscleGroupCombobox";
import { Label } from "@/components/ui/label";
import { useRecordedSetsApi } from "@/hooks/useRecordedSetsApi";
import { useParams } from "react-router-dom";

export const MuscleExerciseSelector = () => {
  const { id } = useParams();

  const { getUserRecordedMuscleGroupNames, getUserRecordedExerciseNamesByMuscleGroup } =
    useRecordedSetsApi();

  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [exercises, setExercises] = useState<string[]>([]);

  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  const handleSelectMuscleGroup = async (muscleGroup: string) => {
    if (!id) return;

    setSelectedMuscleGroup(muscleGroup);
    getUserRecordedExerciseNamesByMuscleGroup(id, muscleGroup).then((res) => setExercises(res));
  };

  const handleSelectExercise = (exercise: string) => {};

  useEffect(() => {
    if (!id) return;

    getUserRecordedMuscleGroupNames(id)
      .then((groups) => setMuscleGroups(groups))
      .catch();
  }, []);

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
        <ExerciseComboBox exercises={exercises} handleSelectExercise={handleSelectExercise} />
      </div>
    </div>
  );
};
