import { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface CustomInstructionsProps {
  instructions: string;
  freeCalories: number;
  onUpdate: (key: string, val: string) => void;
}

const CustomInstructions: FC<CustomInstructionsProps> = ({
  instructions,
  freeCalories,
  onUpdate,
}) => {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>פקודות נוספות </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 ">
        <Label>קלוריות חופשיות</Label>

        <Input
          type="number"
          value={freeCalories}
          onChange={(e) => onUpdate("freeCalories", e.target.value)}
        />
        <Label>פקודות נוספות</Label>
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
