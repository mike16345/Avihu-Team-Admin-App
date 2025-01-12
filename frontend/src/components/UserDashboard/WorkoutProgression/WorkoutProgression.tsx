import { useEffect, useState } from "react";
import { ExerciseProgressChart } from "./ExerciseProgressChart";
import { useParams } from "react-router";
import { RecordedSetsList } from "./RecordedSetsList";
import { MuscleExerciseSelector } from "./MuscleExerciseSelector";
import { useRecordedSetsApi } from "@/hooks/api/useRecordedSetsApi";
import { extractExercises } from "@/lib/workoutUtils";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/enums/QueryKeys";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { createRetryFunction } from "@/lib/utils";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { workoutTab } from "@/pages/UserDashboard";

export const WorkoutProgression = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getRecordedSetsByUserId } = useRecordedSetsApi();

  const handleGetRecordedSets = async () => {
    try {
      const data = await getRecordedSetsByUserId(id!);

      return data;
    } catch (error) {
      console.error("Error fetching recorded sets:", error);
      throw error;
    }
  };

  const handleSetSearchParams = () => {
    if (!recordedWorkouts || (searchParams.get("muscleGroup") && searchParams.get("exercise")))
      return;

    const initialMuscleGroup = recordedWorkouts[0]?.muscleGroup || "";
    const initialExercise = extractExercises(recordedWorkouts[0]?.recordedSets)[0] || "";

    setSearchParams((s) => {
      return {
        ...Object.fromEntries(s.entries()),
        muscleGroup: initialMuscleGroup,
        exercise: initialExercise,
      };
    });
    setSelectedMuscleGroup(initialMuscleGroup);
    setSelectedExercise(initialExercise);
  };

  const {
    data: recordedWorkouts,
    isLoading,
    error,
  } = useQuery({
    queryFn: handleGetRecordedSets,
    queryKey: [`${QueryKeys.RECORDED_WORKOUTS}${id}`],
    staleTime: FULL_DAY_STALE_TIME / 2,
    retry: createRetryFunction(404),
    enabled: !!id,
  });
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(
    searchParams.get("muscleGroup") || ""
  );
  const [selectedExercise, setSelectedExercise] = useState(searchParams.get("exercise") || "");

  const recordedMuscleGroup = recordedWorkouts?.find(
    (recordedMuscleGroup) => recordedMuscleGroup.muscleGroup == selectedMuscleGroup
  );

  const recordedSets = recordedMuscleGroup?.recordedSets[selectedExercise] || [];

  useEffect(() => {
    if (searchParams.get("tab") !== workoutTab || !recordedWorkouts) return;
    handleSetSearchParams();
  }, [searchParams]);

  if (isLoading) return <Loader />;
  if (error) return <ErrorPage message={error.data.message} />;

  return (
    <div className="size-full flex flex-col gap-4 p-3">
      {recordedWorkouts!.length > 0 && (
        <>
          <MuscleExerciseSelector
            selectedExercise={selectedExercise}
            recordedWorkouts={recordedWorkouts!}
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
      {recordedWorkouts!?.length == 0 && <h1 className="text-center">לא הקליטו אימונים</h1>}
    </div>
  );
};
