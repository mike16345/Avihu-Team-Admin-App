import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";

import Loader from "@/components/ui/Loader";
import useMuscleGroupsQuery from "@/hooks/queries/MuscleGroups/useMuscleGroupsQuery";
import useUserRecordedSets from "@/hooks/queries/recordedSets/useUserRecordedSets";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import ErrorPage from "@/pages/ErrorPage";
import { workoutTab } from "@/pages/UserDashboard";

import { ExerciseCardsGrid } from "./ExerciseCardsGrid";
import { ExerciseDetailModal } from "./ExerciseDetailModal";
import { ProgressNoteCreator } from "./ProgressNoteCreator";
import { ProgressNoteLauncher } from "./ProgressNoteLauncher";
import { WorkoutEmptyState } from "./WorkoutEmptyState";
import { WorkoutFilterBar } from "./WorkoutFilterBar";
import { ALL_GROUP_LABEL, type FlatExercise } from "./workoutProgressionModel";
import {
  flattenRecordedWorkouts,
  getAvailableGroups,
  getDetailRawSets,
  getInitialWorkoutSelection,
  isExpectedRecordedSetsEmptyError,
} from "./workoutProgressionUtils";

const getFilteredExercises = (flatExercises: FlatExercise[], filter: string) => {
  if (filter === ALL_GROUP_LABEL) return flatExercises;
  return flatExercises.filter((exercise) => exercise.group === filter);
};

export const WorkoutProgression = () => {
  const { id } = useParams();
  const userFirstName = useUserQuery(id).data?.firstName;
  const { data: recordedWorkouts, isLoading, error } = useUserRecordedSets(id);
  const { data: muscleGroupsFromServer } = useMuscleGroupsQuery();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(
    searchParams.get("muscleGroup") || ""
  );
  const [selectedExercise, setSelectedExercise] = useState(searchParams.get("exercise") || "");
  const [filter, setFilter] = useState<string>(ALL_GROUP_LABEL);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [detailExercise, setDetailExercise] = useState<FlatExercise | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const flatExercises = useMemo(
    () => flattenRecordedWorkouts(recordedWorkouts),
    [recordedWorkouts]
  );

  const availableGroups = useMemo(
    () => getAvailableGroups(flatExercises, muscleGroupsFromServer),
    [flatExercises, muscleGroupsFromServer]
  );

  const filteredExercises = useMemo(
    () => getFilteredExercises(flatExercises, filter),
    [filter, flatExercises]
  );

  useEffect(() => {
    if (searchParams.get("tab") !== workoutTab || !recordedWorkouts) return;
    if (searchParams.get("muscleGroup") && searchParams.get("exercise")) return;

    const initialSelection = getInitialWorkoutSelection(recordedWorkouts);
    if (!initialSelection) return;

    setSearchParams((params) => ({
      ...Object.fromEntries(params.entries()),
      muscleGroup: initialSelection.initialMuscleGroup,
      exercise: initialSelection.initialExercise,
    }));
    setSelectedMuscleGroup(initialSelection.initialMuscleGroup);
    setSelectedExercise(initialSelection.initialExercise);
  }, [recordedWorkouts, searchParams, setSearchParams]);

  const openExerciseDetails = (exercise: FlatExercise) => {
    setSelectedMuscleGroup(exercise.group);
    setSelectedExercise(exercise.name);
    setSearchParams((params) => ({
      ...Object.fromEntries(params.entries()),
      muscleGroup: exercise.group,
      exercise: exercise.name,
    }));
    setDetailExercise(exercise);
  };

  const detailRawSets = useMemo(
    () => getDetailRawSets(recordedWorkouts, detailExercise),
    [detailExercise, recordedWorkouts]
  );

  if (isLoading) return <Loader />;
  if (error && !isExpectedRecordedSetsEmptyError(error)) {
    return <ErrorPage message={(error as any).data?.message} />;
  }

  return (
    <div dir="rtl" className="flex flex-col gap-4 font-heebo">
      <WorkoutFilterBar
        availableGroups={availableGroups}
        filter={filter}
        onFilterChange={setFilter}
      />

      {!flatExercises.length && <WorkoutEmptyState userFirstName={userFirstName} />}

      {flatExercises.length > 0 && (
        <ExerciseCardsGrid
          exercises={filteredExercises}
          selectedExercise={selectedExercise}
          selectedMuscleGroup={selectedMuscleGroup}
          expandedCard={expandedCard}
          onExpandedCardChange={setExpandedCard}
          onOpenExerciseDetails={openExerciseDetails}
        />
      )}

      {detailExercise && (
        <ExerciseDetailModal
          exercise={detailExercise}
          rawSets={detailRawSets}
          onClose={() => setDetailExercise(null)}
        />
      )}

      <ProgressNoteLauncher userFirstName={userFirstName} onOpen={() => setNoteOpen(true)} />

      {noteOpen && (
        <ProgressNoteCreator
          flatExercises={flatExercises}
          availableGroups={availableGroups}
          userName={userFirstName}
          recordedWorkouts={recordedWorkouts}
          onClose={() => setNoteOpen(false)}
        />
      )}
    </div>
  );
};
