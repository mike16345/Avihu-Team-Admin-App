import AddButton from "@/components/ui/buttons/AddButton";
import DeleteButton from "@/components/ui/buttons/DeleteButton";
import DynamicInput from "@/components/ui/DynamicInput";
import React, { useState } from "react";

interface OptionsContainerProps {
  options: [];
}

const OptionsContainer: React.FC<OptionsContainerProps> = () => {
  const [options, setOptions] = useState(["אופציה 1"]);

  const addOption = () => {
    setOptions((prev) => [...prev, `אופציה ${prev.length + 1}`]);
  };

  return (
    <div>
      <div className="space-y-3">
        {options.map((option, i) => (
          <div className="flex items-center gap-2">
            <div className="flex gap-2 w-full">
              <span>{i + 1}.</span>
              <DynamicInput defaultValue={option} />
            </div>
            <DeleteButton onClick={() => {}} tip="הסרה" />
          </div>
        ))}
      </div>
      <AddButton onClick={addOption} tip="הוסף אופציה" />
    </div>
  );
};

export default OptionsContainer;
