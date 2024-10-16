import { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface CustomInstructionsProps {
  instructions: string;
  freeCalories: number;
  fatsPerDay: number;
  veggiesPerDay: number;
  onUpdate: (key: string, val: any) => void;
}

const CustomInstructions: FC<CustomInstructionsProps> = ({
  instructions,
  freeCalories,
  fatsPerDay,
  veggiesPerDay,
  onUpdate,
}) => {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>הערות נוספות </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 ">
        <Label>קלוריות חופשיות</Label>

        <Input
          type="number"
          value={freeCalories}
          onChange={(e) => onUpdate("freeCalories", Number(e.target.value))}
        />
        <Label>כמות שומנים ליום (גרם)</Label>

        <Input
          type="number"
          value={fatsPerDay}
          onChange={(e) => onUpdate("fatsPerDay", Number(e.target.value))}
        />
        <Label>כמות ירקות ליום </Label>

        <Input
          type="number"
          value={veggiesPerDay}
          onChange={(e) => onUpdate("veggiesPerDay", Number(e.target.value))}
        />
        <Label>הערה</Label>
        <Textarea
          value={instructions}
          placeholder="קח 2 כדורים אחרי ארוחה 2"
          onChange={(e) => onUpdate("customInstructions", e.target.value)}
        />
      </CardContent>
    </Card>
  );
};

export default CustomInstructions;
