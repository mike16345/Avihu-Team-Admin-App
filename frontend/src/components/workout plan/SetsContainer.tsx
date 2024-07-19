import React, { useContext, useState } from "react";
import SetsInput from "./SetsInput";
import { ISet } from "@/interfaces/IWorkoutPlan";
import AddButton from "./buttons/AddButton";
import DeleteButton from "./buttons/DeleteButton";
import { isEditableContext } from "./CreateWorkoutPlan";

interface SetContainerProps {
  updateSets: (componentSets: ISet[]) => void;
  existingSets?: ISet[];
}

const SetsContainer: React.FC<SetContainerProps> = ({ updateSets, existingSets }) => {
  const isEditable = useContext(isEditableContext);

  const [componentSets, setComponentSets] = useState<ISet[]>(
    existingSets || [
      {
        id: 1,
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
      id: componentSets.length + 1,
      minReps: 0,
      maxReps: 0,
    };
    setComponentSets([...componentSets, newSet]);
    updateSets([...componentSets, newSet]);
  };

  const removeSet = (index: number) => {
    const filteredArr = componentSets.filter((_, i) => i !== index);
    const newArr = filteredArr.map((set, i) => ({ ...set, id: i + 1 }));

    setComponentSets(newArr);
    updateSets(newArr);
  };

  return (
    <div className="flex flex-col gap-2 w-fit">
      <h2 className="underline font-bold pr-4 pt-2">סטים:</h2>
      <div className="flex flex-col gap-2">
        {componentSets.map((set, i) => (
          <div key={i} className="flex gap-4 justify-center items-center w-fit">
            <SetsInput
              setNumber={i + 1}
              handleChange={(e) => handleChange(e, i)}
              maxReps={set.maxReps}
              minReps={set.minReps}
            />
            {isEditable && (
              <div className="mt-5">
                <DeleteButton tip="הסר סט" onClick={() => removeSet(i)} />
              </div>
            )}
          </div>
        ))}
      </div>
      {isEditable && (
        <div>
          <AddButton tip="הוסף סט" onClick={createSet} />
        </div>
      )}
    </div>
  );
};

export default SetsContainer;
