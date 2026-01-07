import AddButton from "@/components/ui/buttons/AddButton";
import DeleteButton from "@/components/ui/buttons/DeleteButton";
import DynamicInput from "@/components/ui/DynamicInput";
import React from "react";

interface OptionsContainerProps {
  options: [];
  onChange: (arr: string[]) => void;
}

const OptionsContainer: React.FC<OptionsContainerProps> = ({ onChange, options }) => {
  const addOption = () => {
    onChange([...options, `אופציה ${options.length + 1}`]);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="space-y-3">
        {options.map((option, i) => (
          <div className="flex items-center gap-2" key={i + option}>
            <div className="flex gap-2 w-full items-center">
              <span>{i + 1}.</span>
              <DynamicInput defaultValue={option} />
            </div>
            <DeleteButton onClick={() => removeOption(i)} tip="הסרה" />
          </div>
        ))}
      </div>
      <AddButton onClick={addOption} tip="הוסף אופציה" />
    </div>
  );
};

export default OptionsContainer;
