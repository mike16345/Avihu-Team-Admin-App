import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsEditableContext } from "@/context/useIsEditableContext";
import { ISimpleCardioType } from "@/interfaces/IWorkoutPlan";
import React, { useState } from "react";

interface FixedCardioContainerProps {
  updateWorkout: (val: ISimpleCardioType) => void;
  existingObject: ISimpleCardioType;
}

const FixedCardioContainer: React.FC<FixedCardioContainerProps> = ({
  updateWorkout,
  existingObject,
}) => {
  const [cardioDetails, setCardioDetails] = useState<ISimpleCardioType>(existingObject);
  const { isEditable } = useIsEditableContext();

  const handleObjectChange = <K extends keyof ISimpleCardioType>(
    key: K,
    value: ISimpleCardioType[K]
  ) => {
    if (value === undefined || value === null) return;

    const newObject = { ...cardioDetails, [key]: value };

    setCardioDetails(newObject);
    updateWorkout(newObject);
  };

  return (
    <div className="flex flex-col gap-5 bg-accent p-5 rounded-lg mb-2 w-5/6 md:w-1/3 ">
      <div>
        <Label htmlFor="minsPerWeek" className="font-bold underline">
          כמות אירובי לשבוע (דק'):
        </Label>
        {isEditable?<Input
          placeholder="הכנס זמן בדקות.."
          name="minsPerWeek"
          id="minsPerWeek"
          type="number"
          min={0}
          value={existingObject.minsPerWeek}
          onChange={(e) => handleObjectChange("minsPerWeek", Number(e.target.value))}
        ></Input> :
        <div className="border-4 border-background rounded-md py-2 px-4 ">
          {existingObject?.minsPerWeek||`לא הוגדר`}
          </div>}
      </div>
      <div>
        <Label htmlFor="timesPerWeek" className="font-bold underline">
          כמות פעמים לשבוע:
        </Label>
        {isEditable?<Input
          placeholder="כמה אימונים בשבוע.."
          name="timesPerWeek"
          id="timesPerWeek"
          type="number"
          min={0}
          value={existingObject.timesPerWeek}
          onChange={(e) => handleObjectChange("timesPerWeek", Number(e.target.value))}
        ></Input>:
        <div className="border-4 border-background rounded-md py-2 px-4 ">
          {existingObject?.timesPerWeek||`לא הוגדר`}
          </div>}
      </div>
      <div>
        <Label htmlFor="tips" className="font-bold underline">
          דגשים:
        </Label>
        {isEditable?<Textarea
          placeholder="דגשים...."
          name="tips"
          id="tips"
          value={existingObject.tips}
          onChange={(e) => handleObjectChange("tips", e.target.value)}
        ></Textarea>:
        <div className="border-4 border-background rounded-md py-2 px-4 ">
          {existingObject?.tips||`לא הוגדר`}
          </div>}
      </div>
    </div>
  );
};

export default FixedCardioContainer;
