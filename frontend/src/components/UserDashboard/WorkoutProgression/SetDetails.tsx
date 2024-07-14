import { IRecordedSet } from "@/interfaces/IWorkout";
import { getWorkoutPlanName } from "@/lib/workoutUtils";

export const SetDetails = ({ set, index }: { set: IRecordedSet; index: number }) => (
  <div className="flex flex-col gap-1">
    <h3 className="font-semibold mb-1">Set {index + 1}</h3>
    <p>
      Weight: <span className="font-normal text-muted-foreground ms-1">{set.weight} kg</span>
    </p>
    <p>
      Reps Done: <span className="font-normal text-muted-foreground ms-1">{set.repsDone}</span>
    </p>
    <p>
      Workout Plan:
      <span className="font-normal text-muted-foreground ms-1">
        {getWorkoutPlanName(set.workoutPlan)}
      </span>
    </p>
    <p>
      Note: <span className="font-normal text-muted-foreground ms-1">{set.note}</span>
    </p>
  </div>
);
