import { IMuscleGroupWorkouts } from "@/interfaces/IWorkoutPlan";
import { cn } from "@/lib/utils";

interface WorkoutMuscleGroupPillsProps {
  muscleGroups: IMuscleGroupWorkouts[];
  className?: string;
  emptyLabel?: string;
}

const MUSCLE_DOT_COLOR: Record<string, string> = {
  חזה: "bg-rose-500",
  גב: "bg-emerald-500",
  כתפיים: "bg-amber-500",
  "יד קדמית": "bg-blue-500",
  "יד אחורית": "bg-indigo-500",
  ביצפס: "bg-blue-500",
  טריצפס: "bg-indigo-500",
  רגליים: "bg-violet-500",
  ישבן: "bg-fuchsia-500",
  תאומים: "bg-teal-500",
  טרפזים: "bg-cyan-500",
  אמות: "bg-sky-500",
  בטן: "bg-orange-500",
};

const getMuscleDotClassName = (group?: string) => {
  if (group && MUSCLE_DOT_COLOR[group]) return MUSCLE_DOT_COLOR[group];

  return "bg-slate-400";
};

const WorkoutMuscleGroupPills: React.FC<WorkoutMuscleGroupPillsProps> = ({
  muscleGroups,
  className,
  emptyLabel = "אין קבוצות שריר עדיין",
}) => {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-wrap items-center gap-1.5", className)}>
      {muscleGroups.length === 0 && (
        <span className="text-xs text-slate-400 dark:text-slate-500">{emptyLabel}</span>
      )}

      {muscleGroups.map((muscleGroup, index) => (
        <span
          key={muscleGroup._id || index}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
              getMuscleDotClassName(muscleGroup.muscleGroup)
            )}
            aria-hidden
          />
          <span>{muscleGroup.muscleGroup || "קבוצה"}</span>
          {Boolean(muscleGroup.exercises?.length) && (
            <span className="rounded-md bg-slate-100 px-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {muscleGroup.exercises.length}
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

export default WorkoutMuscleGroupPills;
