import React, { useEffect, useState } from "react";
import { Button } from "./button";
import DeleteButton from "./buttons/DeleteButton";

interface TipAdderProps {
  name?: string;
  saveTips: (tips: string[]) => void;
  tips: string[];
}

const TipAdder: React.FC<TipAdderProps> = ({ name = "דגשים", tips = [], saveTips }) => {
  const [newTip, setNewTip] = useState<string>("");

  const addTip = () => {
    if (!newTip.trim()) return;

    const newTipsArr = [...tips, newTip];

    saveTips(newTipsArr);
    setNewTip("");
  };

  const removeTip = (index: number) => {
    const newTipsArr = tips.filter((_, i) => i !== index);

    saveTips(newTipsArr);
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
    <div className="border-2 rounded  p-4 flex flex-col gap-4 ">
      <h2 className="font-bold">{name}</h2>
      <ul className="w-full custom-scrollbar max-h-[250px] overflow-y-auto">
        {tips.length === 0 ? (
          <h2 className="text-center">לא הוספו {name}!</h2>
        ) : (
          tips.map((tip, i) => (
            <li key={i} className="list-disc py-1 border-b-2 flex items-center gap-2">
              <span className="break-words whitespace-normal flex-1 overflow-hidden text-ellipsis">
                {tip}
              </span>
              <DeleteButton tip="הסר דגש" onClick={() => removeTip(i)} />
            </li>
          ))
        )}
      </ul>
      <>
        <input
          className="border-2 rounded p-1 bg-secondary"
          placeholder="דגש חדש.."
          value={newTip}
          onChange={(e) => setNewTip(e.target.value)}
        />
        <div className="flex justify-center gap-2">
          <Button className="w-full" type="button" variant="secondary" onClick={() => saveTips([])}>
            נקה
          </Button>
          <Button className="w-full" type="button" onClick={addTip}>
            הוספה
          </Button>
        </div>
      </>
    </div>
  );
};

export default TipAdder;
