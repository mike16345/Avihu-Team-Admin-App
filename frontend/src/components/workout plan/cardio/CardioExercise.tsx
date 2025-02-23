import { Button } from "@/components/ui/button";
import ComboBox from "@/components/ui/combo-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { aerobicActivities } from "@/constants/cardioOptions";
import { useIsEditableContext } from "@/context/useIsEditableContext";
import { ICardioWorkout } from "@/interfaces/IWorkoutPlan";
import React from "react";

interface CardioExerciseProps {
  existingItem: ICardioWorkout;
  updateExercise: <K extends keyof ICardioWorkout>(key: K, val: ICardioWorkout[K]) => void;
}

const CardioExercise: React.FC<CardioExerciseProps> = ({ existingItem, updateExercise }) => {
  const { isEditable } = useIsEditableContext();

  return (
    <div className="flex flex-wrap gap-5 w-5/6 justify-start p-5 items-end">
      <div>
        <Label className="font-bold underline">זמן חימום (דק'):</Label>
        {isEditable ? (
          <Input
            type="number"
            min={0}
            value={existingItem?.warmUpAmount}
            onChange={(e) => updateExercise("warmUpAmount", Number(e.target.value))}
            placeholder="זמן חימום לפני תרגיל.."
          ></Input>
        ) : (
          <div className="bg-accent rounded-md py-2 px-4 ">
            {existingItem?.warmUpAmount || `לא הוגדר`}
          </div>
        )}
      </div>
      <div className="md:min-w-1/5">
        <Label className="font-bold underline">שיטת ביצוע:</Label>
        {isEditable ? (
          <ComboBox
            options={aerobicActivities}
            value={existingItem?.cardioExercise}
            onSelect={(val) => updateExercise("cardioExercise", val)}
          />
        ) : (
          <div className="bg-accent rounded-md py-2 px-4 ">
            {existingItem?.cardioExercise || `לא הוגדר`}
          </div>
        )}
      </div>
      <div>
        <Label className="font-bold underline">מרחק:</Label>
        {isEditable ? (
          <Input
            type="string"
            value={existingItem?.distance}
            placeholder="הכנס מרחק.."
            onChange={(e) => updateExercise("distance", e.target.value)}
          ></Input>
        ) : (
          <div className="bg-accent rounded-md py-2 px-4 ">
            {existingItem?.distance || `לא הוגדר`}
          </div>
        )}
      </div>
      <div className="md:w-1/5">
        <Label className="font-bold underline">דגשים:</Label>
        {isEditable ? (
          <Input
            value={existingItem?.tips}
            placeholder="דגשים..."
            onChange={(e) => updateExercise("tips", e.target.value)}
          ></Input>
        ) : (
          <div className="bg-accent rounded-md py-2 px-4">{existingItem?.tips || `לא הוגדר`}</div>
        )}
      </div>
    </div>
  );
};

export default CardioExercise;
