import ComboBox from "@/components/ui/combo-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsEditableContext } from "@/context/useIsEditableContext";
import useCardioWorkoutQuery from "@/hooks/queries/cardioWorkout/useCardioWorkoutQuery";
import { ICardioWorkout } from "@/interfaces/IWorkoutPlan";
import { convertItemsToOptions } from "@/lib/utils";
import React, { useEffect, useState } from "react";

interface CardioExerciseProps {
  existingItem: ICardioWorkout;
  updateExercise: <K extends keyof ICardioWorkout>(key: K, val: ICardioWorkout[K]) => void;
}

const CardioExercise: React.FC<CardioExerciseProps> = ({ existingItem, updateExercise }) => {
  const { isEditable } = useIsEditableContext();
  const { data: cardioWorkoutResponse } = useCardioWorkoutQuery();
  const [cardioWorkouts, setCardioWorkouts] = useState<any[]>([]);

  useEffect(() => {
    if (!cardioWorkoutResponse?.data) return;

    const options = convertItemsToOptions(cardioWorkoutResponse.data, `name`, `name`);

    setCardioWorkouts(options);
  }, [cardioWorkoutResponse]);

  return (
    <>
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
          <Label className="font-bold underline">תרגיל:</Label>
          {isEditable ? (
            <ComboBox
              options={cardioWorkouts || []}
              value={existingItem?.cardioExercise}
              onSelect={(val) => updateExercise("cardioExercise", val)}
            />
          ) : (
            <div className="bg-accent rounded-md py-2 px-4 ">
              {existingItem?.cardioExercise || `לא הוגדר`}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-6 px-5 flex-wrap">
        <div>
          <Label className="font-bold underline">מרחק:</Label>
          {isEditable ? (
            <Textarea
              value={existingItem?.distance}
              placeholder="הכנס מרחק.."
              onChange={(e) => updateExercise("distance", e.target.value)}
            ></Textarea>
          ) : (
            <div className="bg-accent rounded-md py-2 px-4 ">
              {existingItem?.distance || `לא הוגדר`}
            </div>
          )}
        </div>
        <div className="md:w-1/5">
          <Label className="font-bold underline">דגשים:</Label>
          {isEditable ? (
            <Textarea
              value={existingItem?.tips}
              placeholder="דגשים..."
              onChange={(e) => updateExercise("tips", e.target.value)}
            ></Textarea>
          ) : (
            <div className="bg-accent rounded-md py-2 px-4">{existingItem?.tips || `לא הוגדר`}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default CardioExercise;
