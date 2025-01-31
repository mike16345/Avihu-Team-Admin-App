import { Button } from "@/components/ui/button";
import ComboBox from "@/components/ui/combo-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { aerobicActivities } from "@/constants/cardioOptions";
import { ICardioWorkout } from "@/interfaces/IWorkoutPlan";
import React from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

interface CardioExerciseProps {
  existingItem: ICardioWorkout;
  updateExercise: <K extends keyof ICardioWorkout>(key: K, val: ICardioWorkout[K]) => void;
  isLastItem: boolean;
}

const CardioExercise: React.FC<CardioExerciseProps> = ({
  existingItem,
  updateExercise,
  isLastItem,
}) => {
  return (
    <div className="flex flex-wrap gap-5 w-5/6 justify-start p-5 items-end">
      <div>
        <Label className="font-bold underline">זמן חימום (דק'):</Label>
        <Input
          type="number"
          min={0}
          value={existingItem?.warmUpAmount}
          onChange={(e) => updateExercise("warmUpAmount", Number(e.target.value))}
          placeholder="זמן חימום לפני תרגיל.."
        ></Input>
      </div>
      <div>
        <Label className="font-bold underline">מרחק (קמ'):</Label>
        <Input
          type="number"
          min={0}
          value={existingItem?.distance}
          placeholder="הכנס מרחק.."
          onChange={(e) => updateExercise("distance", Number(e.target.value))}
        ></Input>
      </div>
      <div className="md:w-1/5">
        <Label className="font-bold underline">שיטת ביצוע:</Label>
        <ComboBox
          options={aerobicActivities}
          value={existingItem?.cardioExercise}
          onSelect={(val) => updateExercise("cardioExercise", val)}
        />
      </div>
      <div className="md:w-1/5">
        <Label className="font-bold underline">דגשים:</Label>
        <Input
          value={existingItem?.tips}
          placeholder="דגשים..."
          onChange={(e) => updateExercise("tips", e.target.value)}
        ></Input>
      </div>
    </div>
  );
};

export default CardioExercise;
