import React, { useState } from "react";
import { Button } from "./button";
import { BsTrash3 } from "react-icons/bs";

interface TipAdderProps {
  saveTips: (tips: string[]) => void;
  tips: string[];
  isEditable?: boolean;
}

const TipAdder: React.FC<TipAdderProps> = ({ tips, saveTips, isEditable = true }) => {
  const [newTip, setNewTip] = useState<string | undefined>();

  const addTip = () => {
    if (!newTip) return;

    const newTipsArr = [...tips];

    newTipsArr.push(newTip);

    saveTips(newTipsArr);
    setNewTip(``);
  };

  const removeTip = (index: number) => {
    const newTipsArr = tips.filter((_, i) => i !== index);

    saveTips(newTipsArr);
  };

  return (
    <div className="border-2 rounded  p-4 flex flex-col gap-4 h-fit">
      <h2 className="font-bold">דגשים</h2>
      <ul className="px-4 w-full max-h-32 overflow-y-auto">
        {tips.length === 0 ? (
          <h2 className="text-center">לא הוספו טיפים!</h2>
        ) : (
          tips.map((tip, i) => (
            <div key={i} className="list-disc flex justify-between py-1 border-b-2 items-center">
              <li className="text-wrap">{tip}</li>
              {isEditable && (
                <div
                  className="hover:bg-secondary rounded p-1 cursor-pointer"
                  onClick={() => removeTip(i)}
                >
                  <BsTrash3 />
                </div>
              )}
            </div>
          ))
        )}
      </ul>
      {isEditable && (
        <>
          <input
            className="border-2 rounded p-1 bg-secondary"
            placeholder="דגש חדש.."
            value={newTip}
            onChange={(e) => setNewTip(e.target.value)}
          ></input>
          <div className="flex justify-center gap-2">
            <Button className="w-full" variant="secondary" onClick={() => saveTips([])}>
              נקה
            </Button>
            <Button className="w-full" onClick={addTip}>
              הוספה
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TipAdder;
