import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import TipAdder from "../ui/TipAdder";

interface CustomInstructionsProps {
  instructions?: string[];
  supplements?: string[];
  freeCalories: number;
  fatsPerDay: number;
  veggiesPerDay: number;
  onUpdate: (key: string, val: any) => void;
}

const CustomInstructions: FC<CustomInstructionsProps> = ({
  instructions,
  supplements,
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

        <Label>כמות שומנים ליום (מנות)</Label>
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

        <TipAdder
          tips={instructions || []}
          saveTips={(tips) => onUpdate("customInstructions", tips)}
        />

        <TipAdder
          name="תוספים"
          tips={supplements || []}
          saveTips={(tips) => onUpdate("supplements", tips)}
        />
      </CardContent>
    </Card>
  );
};

export default CustomInstructions;
