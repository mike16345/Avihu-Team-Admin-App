import { FC } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

type CustomInstructionsRadioProps = {
  onChangeSelection: Function;
};

export const CustomInstructionsRadio: FC<CustomInstructionsRadioProps> = ({
  onChangeSelection,
}) => {
  return (
    <RadioGroup
      onValueChange={(val) => onChangeSelection(val)}
      className="flex justify-between items-center"
      defaultValue="option-one"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="Custom" id="Custom" />
        <Label htmlFor="Custom">Custom Instructions</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="Fixed" id="Fixed" />
        <Label htmlFor="Fixed">Fixed Amount</Label>
      </div>
    </RadioGroup>
  );
};
