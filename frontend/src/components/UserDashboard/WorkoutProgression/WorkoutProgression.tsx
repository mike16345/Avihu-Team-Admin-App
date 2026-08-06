import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";

import Loader from "@/components/ui/Loader";
import useMuscleGroupsQuery from "@/hooks/queries/MuscleGroups/useMuscleGroupsQuery";
import useUserRecordedSets from "@/hooks/queries/recordedSets/useUserRecordedSets";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import useWorkoutPlanQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanQuery";
import ErrorPage from "@/pages/ErrorPage";
import { workoutTab } from "@/pages/UserDashboard";

import { ExerciseCardsGrid } from "./ExerciseCardsGrid";
import { ExerciseDetailModal } from "./ExerciseDetailModal";
import { ProgressNoteCreator } from "./ProgressNoteCreator";
import { WorkoutEmptyState } from "./WorkoutEmptyState";
import { WorkoutFilterBar } from "./WorkoutFilterBar";
import { ALL_GROUP_LABEL, type FlatExercise, type ViewMode } from "./workoutProgressionModel";
import {
  flattenRecordedWorkouts,
  getAvailableGroups,
  getDetailRawSets,
  getExerciseNamesInWorkout,
  getInitialWorkoutSelection,
  getWorkoutNames,
  groupWorkoutExercises,
  isExpectedRecordedSetsEmptyError,
} from "./workoutProgressionUtils";

const getFilteredExercises = (
  flatExercises: FlatExercise[],
  filter: string,
  mode: ViewMode,
  workoutExerciseNames: Set<string>
) => {
  if (mode === "muscle") {
    if (filter === ALL_GROUP_LABEL) return flatExercises;
    return flatExercises.filter((exercise) => exercise.group === filter);
  }
  if (!filter) return [];
  return flatExercises.filter((exercise) => workoutExerciseNames.has(exercise.name));
};

export const WorkoutProgression = () => {
  const { id } = useParams();
  const userFirstName = useUserQuery(id).data?.firstName;
  const { data: recordedWorkouts, isLoading, error } = useUserRecordedSets(id);
  const { data: muscleGroupsFromServer } = useMuscleGroupsQuery();
  const { data: workoutPlanResponse } = useWorkoutPlanQuery(id ?? "");
  const workoutPlan = workoutPlanResponse?.data;

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(
    searchParams.get("muscleGroup") || ""
  );
  const [selectedExercise, setSelectedExercise] = useState(searchParams.get("exercise") || "");
  const [mode, setMode] = useState<ViewMode>("workout");
  const [filter, setFilter] = useState<string>("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [detailExercise, setDetailExercise] = useState<FlatExercise | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const flatExercises = useMemo(
    () => flattenRecordedWorkouts(recordedWorkouts),
    [recordedWorkouts]
  );

  const muscleGroupOptions = useMemo(
    () => getAvailableGroups(flatExercises, muscleGroupsFromServer),
    [flatExercises, muscleGroupsFromServer]
  );

  const workoutNameOptions = useMemo(() => getWorkoutNames(workoutPlan), [workoutPlan]);

  const availableGroups = mode === "muscle" ? muscleGroupOptions : workoutNameOptions;

  const workoutExerciseNames = useMemo(
    () => getExerciseNamesInWorkout(workoutPlan, filter),
    [workoutPlan, filter]
  );

  const filteredExercises = useMemo(
    () => getFilteredExercises(flatExercises, filter, mode, workoutExerciseNames),
    [filter, flatExercises, mode, workoutExerciseNames]
  );

  const workoutSections = useMemo(() => {
    if (mode !== "workout" || !filter) return undefined;
    return groupWorkoutExercises(workoutPlan, filter, flatExercises);
  }, [mode, filter, workoutPlan, flatExercises]);

  const handleModeChange = (nextMode: ViewMode) => {
    setMode(nextMode);
    setFilter(nextMode === "muscle" ? ALL_GROUP_LABEL : (workoutNameOptions[0] ?? ""));
  };

  useEffect(() => {
    if (filter !== "") return;
    if (mode === "muscle") {
      setFilter(ALL_GROUP_LABEL);
      return;
    }
    if (workoutNameOptions.length > 0) {
      setFilter(workoutNameOptions[0]);
    }
  }, [mode, filter, workoutNameOptions]);

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
        mode={mode}
        onModeChange={handleModeChange}
        onOpenNote={() => setNoteOpen(true)}
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
          sections={workoutSections}
        />
      )}

      {detailExercise && (
        <ExerciseDetailModal
          exercise={detailExercise}
          rawSets={detailRawSets}
          onClose={() => setDetailExercise(null)}
        />
      )}

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
