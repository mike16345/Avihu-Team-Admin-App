import { FC } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

type CustomInstructionsRadioChoices = "Fixed" | "Custom";
type CustomInstructionsRadioProps = {
  defaultValue: CustomInstructionsRadioChoices;
  onChangeSelection: Function;
};

export const CustomItemSelectionRadio: FC<CustomInstructionsRadioProps> = ({
  defaultValue,
  onChangeSelection,
}) => {
  return (
    <RadioGroup
      onValueChange={(val) => onChangeSelection(val)}
      className="flex items-center gap-3 "
      defaultValue={defaultValue}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="Custom" id="Custom" />
        <Label htmlFor="Custom">בחירה</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="Fixed" id="Fixed" />
        <Label htmlFor="Fixed">קבוע</Label>
      </div>
    </RadioGroup>
  );
};
