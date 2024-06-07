import { FC, useState } from "react";
import { FaChevronDown, FaTrash } from "react-icons/fa";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CustomInstructionsRadio } from "./CustomInstructionsRadio";

type DietPlanDropDownProps = {
  mealNumber: number;
  onDelete: () => void;
};

export const DietPlanDropDown: FC<DietPlanDropDownProps> = ({ mealNumber, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSaveChanges = () => {
    console.log("saving changes");
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full max-w-lg md:max-w-xl lg:max-w-2xl space-y-2"
    >
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">Meal {mealNumber}</h4>
        <CollapsibleTrigger asChild>
          <div>
            <Button onClick={() => onDelete()} variant="ghost" size="sm" className="w-9 p-0">
              <FaTrash className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`w-9 p-0 transition ${isOpen ? "rotate-180" : "rotate-0"}`}
            >
              <FaChevronDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </div>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className={`flex flex-col gap-4 ${isOpen && "p-4"}`}>
        <div className="flex flex-col gap-4 md:flex-row md:justify-between ">
          <div className="flex flex-col gap-2">
            <Label htmlFor="Protein">Protein</Label>
            <Input id="Protein" type="number" />
            <CustomInstructionsRadio onChangeSelection={(val: string) => console.log("val", val)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="Carbs">Carbs</Label>
            <Input id="Carbs" type="number" />
            <CustomInstructionsRadio onChangeSelection={(val: string) => console.log("val", val)} />
          </div>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:justify-between ">
          <div className="flex flex-col gap-2">
            <Label htmlFor="Fats">Fats</Label>
            <Input id="Fats" type="number" />
            <CustomInstructionsRadio onChangeSelection={(val: string) => console.log("val", val)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="Vegetables">Vegetables</Label>
            <Input id="Vegetables" type="number" />
            <CustomInstructionsRadio onChangeSelection={(val: string) => console.log("val", val)} />
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={handleSaveChanges}>Save</Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
