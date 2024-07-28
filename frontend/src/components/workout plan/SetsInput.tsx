import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useIsEditableContext } from "../context/useIsEditableContext";

interface SetInputProps {
  setNumber: number;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxReps?: number;
  minReps: number;
}

const SetsInput: React.FC<SetInputProps> = ({ setNumber, handleChange, maxReps, minReps }) => {
  const { isEditable } = useIsEditableContext();
  return (
    <div className="flex items-center gap-3">
      <div className="mt-5 font-semibold">סט {setNumber}</div>
      <div>
        <Label>מינימום חזרות</Label>
        {isEditable ? (
          <Input
            readOnly={!isEditable}
            name="minReps"
            type="number"
            min={0}
            className="w-28"
            placeholder="8/10/12..."
            value={minReps}
            onChange={(e) => handleChange(e)}
          />
        ) : (
          <p className="py-1 border-b-2 text-center">{minReps}</p>
        )}
      </div>
      <div>
        <Label>מקסימום חזרות</Label>
        {isEditable ? (
          <Input
            readOnly={!isEditable}
            name="maxReps"
            type="number"
            className="w-28"
            min={0}
            placeholder="8/10/12..."
            value={maxReps}
            onChange={(e) => handleChange(e)}
          />
        ) : (
          <p className="py-1 border-b-2 text-center">{maxReps || `לא קיים`}</p>
        )}
      </div>
    </div>
  );
};

export default SetsInput;
