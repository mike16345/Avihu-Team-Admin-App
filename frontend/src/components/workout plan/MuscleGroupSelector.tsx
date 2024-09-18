import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ComboBox from "./ComboBox";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { BiPencil } from "react-icons/bi";
import useMuscleGroupsApi from "@/hooks/api/useMuscleGroupsApi";

interface MuscleGroupSelectorProps {
  handleChange: (value: string) => void;
  existingMuscleGroup?: string;
}

const MuscleGroupSelector: React.FC<MuscleGroupSelectorProps> = ({
  handleChange,
  existingMuscleGroup,
}) => {
  const { getAllMuscleGroups } = useMuscleGroupsApi();
  const [value, setValue] = useState<string>(existingMuscleGroup || ``);
  const [tempValue, setTempValue] = useState<string>();

  const updateSelection = (selection: string) => {
    handleChange(selection);
    setValue(selection);
  };

  return (
    <Dialog defaultOpen={!Boolean(value)}>
      <DialogTrigger className="w-[180px] border hover:border-secondary-foreground rounded py-1 px-2">
        <div className="flex items-center justify-between">
          <p className="font-bold text-md">{value || `לא נבחר`}</p>
          <p className="text-sm">
            <BiPencil />
          </p>
        </div>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle dir="rtl" className="text-center underline pb-6">
            בחר קבוצת שריר:
          </DialogTitle>
          <DialogDescription className="py-4   z-50 ">
            <ComboBox
              queryKey="muscleGroups"
              existingValue={value}
              getOptions={getAllMuscleGroups}
              handleChange={(val) => {
                setTempValue(val.name);
              }}
            />
          </DialogDescription>
        </DialogHeader>
        <DialogClose>
          <Button
            className="w-full"
            onClick={tempValue ? () => updateSelection(tempValue) : () => {}}
          >
            אישור
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default MuscleGroupSelector;
