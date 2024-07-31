import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IRecordedSet } from "@/interfaces/IWorkout";
import DateUtils from "@/lib/dateUtils";
import { getWorkoutPlanName } from "@/lib/workoutUtils";

export const SetDetails = ({ set, index }: { set: IRecordedSet; index: number }) => {
  const dateRecorded = new Date(set.date);
  const dateString = DateUtils.formatDate(dateRecorded, "DD/MM/YYYY");
  const time = dateRecorded.toLocaleTimeString();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Set {index + 1}</CardTitle>
        <CardDescription className="font-medium">
          Date: <span className="text-xs">{dateString + ": " + time}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
