import { defaultColor, groupColors, type FlatExercise } from "./workoutProgressionModel";
import type { WorkoutGroupSection } from "./workoutProgressionUtils";
import { EmptyExerciseCard } from "./EmptyExerciseCard";
import { ExerciseCard, getExerciseCardId } from "./ExerciseCard";
import { IMonthlyExerciseGoal } from "@/interfaces/IMonthlyExerciseGoal";
import { ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";

type ExerciseCardsGridProps = {
  exercises: FlatExercise[];
  selectedExercise: string;
  selectedMuscleGroup: string;
  expandedCard: string | null;
  onExpandedCardChange: (cardId: string | null) => void;
  onOpenExerciseDetails: (exercise: FlatExercise) => void;
  sections?: WorkoutGroupSection[];
  userId?: string;
  goals?: IMonthlyExerciseGoal[];
  workoutPlan?: ICompleteWorkoutPlan;
  currentWorkoutName?: string;
};

const getPlannedReps = (
  plan: ICompleteWorkoutPlan | undefined,
  workoutName: string | undefined,
  exerciseName: string
): string[] | undefined => {
  if (!plan || !workoutName) return undefined;
  const target = exerciseName.trim();
  const wp = plan.workoutPlans?.find((w) => w.planName === workoutName);
  if (!wp) return undefined;
  for (const mg of wp.muscleGroups || []) {
    for (const ex of mg.exercises || []) {
      const nm =
        (ex.exerciseId as any)?.name ??
        (typeof ex.exerciseId === "string" ? (ex as any).name : (ex as any).name);
      if ((nm || "").trim() === target) {
        const sets = (ex as any).sets ?? [];
        const labels = sets
          .map((s: any) => {
            const min = Number(s?.minReps ?? s?.reps);
            const max = Number(s?.maxReps);
            if (Number.isFinite(min) && min > 0) {
              if (Number.isFinite(max) && max > 0 && max !== min) return `${min}-${max}`;
              return String(min);
            }
            return null;
          })
          .filter((v: string | null): v is string => !!v);
        return labels.length > 0 ? labels : undefined;
      }
    }
  }
  return undefined;
};

export function ExerciseCardsGrid({
  exercises,
  selectedExercise,
  selectedMuscleGroup,
  expandedCard,
  onExpandedCardChange,
  onOpenExerciseDetails,
  sections,
  userId,
  goals,
  workoutPlan,
  currentWorkoutName,
}: ExerciseCardsGridProps) {
  const goalByExercise = new Map<string, IMonthlyExerciseGoal>();
  (goals || []).forEach((g) => goalByExercise.set(g.exercise.trim(), g));

  const renderCard = (exercise: FlatExercise, positionIndex: number) => {
    const positionLabel = `תרגיל ${positionIndex}`;
    const cardId = getExerciseCardId(exercise);
    const goal = goalByExercise.get(exercise.name.trim());
    const plannedReps = getPlannedReps(workoutPlan, currentWorkoutName, exercise.name);

    if (exercise.sessions.length === 0) {
      return (
        <EmptyExerciseCard
          key={cardId}
          exercise={exercise}
          positionLabel={positionLabel}
          userId={userId}
          goal={goal}
          plannedReps={plannedReps}
        />
      );
    }

    const isSelected = selectedExercise === exercise.name && selectedMuscleGroup === exercise.group;

    return (
      <ExerciseCard
        key={cardId}
        exercise={exercise}
        positionLabel={positionLabel}
        isSelected={isSelected}
        isExpanded={expandedCard === cardId}
        onExpandedChange={onExpandedCardChange}
        onOpen={onOpenExerciseDetails}
        userId={userId}
        goal={goal}
        plannedReps={plannedReps}
      />
    );
  };

  return (
    <div className="max-h-[calc(100vh-280px)] overflow-y-auto pe-2 -me-2 [scrollbar-color:rgba(148,163,184,0.3)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-slate-400/30 [&::-webkit-scrollbar-thumb:hover]:bg-slate-400/50 [&::-webkit-scrollbar-track]:bg-transparent">
      {sections ? (
        <div className="flex flex-col gap-5">
          {sections.map((section) => {
            const sectionColors = groupColors[section.muscleGroup] || defaultColor;
            return (
              <section key={section.muscleGroup}>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full ${sectionColors.bg} px-2.5 py-0.5 text-xs font-bold ${sectionColors.text}`}
                  >
                    {section.muscleGroup}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {section.exercises.length} תרגילים
                  </span>
                  <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {section.exercises.map((exercise, index) => renderCard(exercise, index + 1))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {exercises.map((exercise, index) => renderCard(exercise, index + 1))}
        </div>
      )}
    </div>
  );
}
