import React, { useEffect, useState } from "react";
import { Button } from "./button";
import { useFormContext } from "react-hook-form";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import DeleteButton from "./buttons/DeleteButton";

const TipAdder: React.FC = () => {
  const [newTip, setNewTip] = useState("");
  const { setValue, watch } = useFormContext<WorkoutSchemaType>();

  const tips = watch("tips") || [];

  const addTip = () => {
    if (!newTip.trim()) return;
    
    setValue("tips", [...tips, newTip]);
    setNewTip("");
  };

  const removeTip = (index: number) => {
    setValue(
      "tips",
      tips.filter((_, i) => i !== index)
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="border-2 rounded p-4 flex flex-col gap-4 h-fit">
      <h2 className="font-bold">דגשים</h2>
      <ul className="px-4 w-full max-h-32 overflow-y-auto">
        {tips.length === 0 ? (
          <h2 className="text-center">לא הוספו טיפים!</h2>
        ) : (
          tips.map((tip, index) => (
            <div
              key={index}
              className="list-disc flex justify-between py-1 border-b-2 items-center"
            >
              <li className="text-wrap">{tip}</li>
              <DeleteButton onClick={() => removeTip(index)} tip="הסר דגש" />
            </div>
          ))
        )}
      </ul>
      <div className="flex flex-col gap-2">
        <input
          className="border-2 rounded p-1 bg-secondary"
          placeholder="דגש חדש.."
          value={newTip}
          onChange={(e) => setNewTip(e.target.value)}
        />
        <div className="flex justify-center gap-2">
          <Button
            className="w-full"
            type="button"
            variant="secondary"
            onClick={() => setValue("tips", [])}
          >
            נקה
          </Button>
          <Button className="w-full" type="button" onClick={addTip}>
            הוספה
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TipAdder;
