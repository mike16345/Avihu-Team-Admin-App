import { Calendar } from "../ui/calendar";
import { Card, CardContent } from "../ui/card";

export const WeightCalendar = () => {
  return (
    <>
      <Card className="flex items-center justify-center h-full">
        <CardContent>
          <Calendar modifiers={{ deadline: [] }} modifiersStyles={{ deadline: {} }} />
        </CardContent>
      </Card>
    </>
  );
};
