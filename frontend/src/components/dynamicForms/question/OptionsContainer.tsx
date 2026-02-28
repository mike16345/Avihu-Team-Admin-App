import AddButton from "@/components/ui/buttons/AddButton";
import DeleteButton from "@/components/ui/buttons/DeleteButton";
import { Checkbox } from "@/components/ui/checkbox";
import DynamicInput from "@/components/ui/DynamicInput";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionTypes } from "@/interfaces/IForm";
import React from "react";

interface OptionsContainerProps {
  type: QuestionTypes;
  options: any[];
  onChange: (arr: string[]) => void;
}

const OptionsContainer: React.FC<OptionsContainerProps> = ({ onChange, options, type }) => {
  const addOption = () => {
    onChange([...options, `אופציה ${options.length + 1}`]);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const updateOption = (value: string, index: number) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions);
  };

  const prefixes: Record<string, any> = {
    checkboxes: <Checkbox checked />,
    radio: (
      <RadioGroup>
        <RadioGroupItem checked value="default" />
      </RadioGroup>
    ),
  };

  return (
    <div>
      <div className="space-y-3">
        {options.map((option, i) => (
          <div className="flex items-center gap-2" key={i + option}>
            <div className="flex gap-2 w-full items-center">
              {prefixes[type] || <span>{i + 1}.</span>}
              <Input defaultValue={option} onBlur={(e) => updateOption(e.target.value, i)} />
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
