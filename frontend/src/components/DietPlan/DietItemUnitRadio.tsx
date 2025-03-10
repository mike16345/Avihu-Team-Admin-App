import { FC } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

type DietItemUnitRadioProps = {
  value: string;
  onChangeSelection: Function;
};

export const DietItemUnitRadio: FC<DietItemUnitRadioProps> = ({ value, onChangeSelection }) => {
  return (
    <RadioGroup
      onValueChange={(val) => onChangeSelection(val)}
      className="flex flex-col "
      defaultValue={value}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="grams" id="Grams" />
        <Label htmlFor="Grams">גרם</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="spoons" id="Spoons" />
        <Label htmlFor="spoons">כפות</Label>
      </div>
    </RadioGroup>
  );
};
