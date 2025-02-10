import React, { useState } from "react";
import SetsInput from "./SetsInput";
import { ISet } from "@/interfaces/IWorkoutPlan";
import AddButton from "../ui/buttons/AddButton";
import DeleteButton from "../ui/buttons/DeleteButton";
import { useIsEditableContext } from "@/context/useIsEditableContext";
import { duplicateItem, removeItemAtIndex } from "@/utils/utils";
import { MdContentCopy } from "react-icons/md";
import CopyButton from "../ui/buttons/CopyButton";

interface SetContainerProps {
  updateSets: (componentSets: ISet[]) => void;
  existingSets?: ISet[];
}

const SetsContainer: React.FC<SetContainerProps> = ({ updateSets, existingSets }) => {
  const { isEditable } = useIsEditableContext();

  const [componentSets, setComponentSets] = useState<ISet[]>(
    existingSets || [
      {
        minReps: 0,
        maxReps: 0,
      },
    ]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;

    const updatedSets = componentSets.map((set, i) => {
      if (i === index) {
        return {
          ...set,
          [name]: value,
        };
      }
      return set;
    });

    setComponentSets(updatedSets);
    updateSets(updatedSets);
  };

  const createSet = () => {
    const newSet: ISet = {
        minReps: 0,
        maxReps: 0,
      };
    setComponentSets([...componentSets, newSet]);
    updateSets([...componentSets, newSet]);
  };

  const removeSet = (index: number) => {
    const filteredArr = removeItemAtIndex(index,componentSets)

    setComponentSets(filteredArr);
    updateSets(filteredArr);
  };

  const copySet=(index:number)=>{
    const newSetArray=duplicateItem(index,componentSets)

    setComponentSets(newSetArray);
    updateSets(newSetArray);
  }

  return (
    <div className="flex flex-col gap-2 w-fit">
      <h2 className="underline font-bold pt-2">סטים:</h2>
      <div className="flex flex-col gap-2">
        {componentSets.map((set, i) => (
          <div key={set?._id || i} className="flex gap-4 justify-center items-center w-fit">
            <SetsInput
              setNumber={i + 1}
              handleChange={(e) => handleChange(e, i)}
              maxReps={set.maxReps}
              minReps={set.minReps}
            />
            {isEditable && (
              <>
              <div className="mt-5">
                <DeleteButton
                  disabled={componentSets.length == 1}
                  tip="הסר סט"
                  onClick={() => removeSet(i)}
                />
              </div>
              <div className="mt-5">
                <CopyButton tip="שכפל סט" onClick={()=>copySet(i)}/>
              </div>
              </>
            )}
          </div>
        ))}
      </div>
      {isEditable && (
        <div className="border-t-2">
          <AddButton tip="הוסף סט" onClick={createSet} />
        </div>
      )}
    </div>
  );
};

export default SetsContainer;
