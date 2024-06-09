import { FC } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

type DietItemUnitRadioProps = {
  onChangeSelection: Function;
};

export const DietItemUnitRadio: FC<DietItemUnitRadioProps> = ({ onChangeSelection }) => {
  return (
    <RadioGroup
      onValueChange={(val) => onChangeSelection(val)}
      className="flex flex-col "
      defaultValue="grams"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="grams" id="Grams" />
        <Label htmlFor="Grams">Grams</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="spoons" id="Spoons" />
        <Label htmlFor="spoons">Spoons</Label>
      </div>
    </RadioGroup>
  );
};
