import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { BiPencil } from "react-icons/bi";
import useMuscleGroupsApi from "@/hooks/api/useMuscleGroupsApi";
import { useQuery } from "@tanstack/react-query";
import ComboBox from "../ui/combo-box";
import { convertItemsToOptions } from "@/lib/utils";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";

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

  const muscleGroupsQuery = useQuery({
    queryKey: ["muscleGroups"],
    queryFn: () => getAllMuscleGroups().then((res) => res.data),
    staleTime: FULL_DAY_STALE_TIME,
  });
  const muscleGroupOptions = useMemo(
    () => convertItemsToOptions(muscleGroupsQuery.data || [], "name", "name"),
    []
  );
  const updateSelection = (selection: string) => {
    handleChange(selection);
    setValue(selection);
  };

  return (
    <Dialog defaultOpen={!Boolean(value)}>
      <DialogTrigger className="w-[180px] border hover:border-secondary-foreground rounded py-1 px-2">
        <div className="flex items-center justify-between">
          <p className="font-bold text-md">{existingMuscleGroup || `לא נבחר`}</p>
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
          <DialogDescription className="w-full flex justify-center py-4 z-50 ">
            <div className=" w-1/2">
              <ComboBox
                value={value}
                options={muscleGroupOptions}
                onSelect={(val) => {
                  setValue(val);
                }}
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogClose>
          <Button className="w-full" onClick={value ? () => updateSelection(value) : () => {}}>
            אישור
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default MuscleGroupSelector;
