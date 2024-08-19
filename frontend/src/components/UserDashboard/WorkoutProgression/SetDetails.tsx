import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IRecordedSet } from "@/interfaces/IWorkout";
import DateUtils from "@/lib/dateUtils";

export const SetDetails = ({ set }: { set: IRecordedSet; index: number }) => {
  const dateRecorded = new Date(set.date);
  const dateString = DateUtils.formatDate(dateRecorded, "DD/MM/YYYY");
  const time = dateRecorded.toLocaleTimeString().replace("AM", "").replace("PM", "");

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="text-xl">סט {set.setNumber}</CardTitle>
        <CardDescription className="font-medium">
          תאריך: <span className="text-xs">{dateString + ": " + time}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          משקל עבודה:
          <span className="font-normal text-muted-foreground ms-1">{set.weight} ק"ג</span>
        </p>
        <p>
          חזרות: <span className="font-normal text-muted-foreground ms-1">{set.repsDone}</span>
        </p>
        <p>
          תוכנית:
          <span className="font-normal text-muted-foreground ms-1">{set.plan}</span>
        </p>
        <p>
          פטק: <span className="font-normal text-muted-foreground ms-1">{set.note}</span>
        </p>
      </CardContent>
    </Card>
  );
};
