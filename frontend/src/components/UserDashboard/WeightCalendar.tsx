import { Calendar } from "../ui/calendar";
import { Card, CardContent } from "../ui/card";

export const WeightCalendar = () => {
  return (
    <>
      <Card className="p-4">
        <CardContent>
          <Calendar
            className="p-1"
            modifiers={{ deadline: [] }}
            modifiersStyles={{ deadline: {} }}
          />
        </CardContent>
      </Card>
    </>
  );
};
