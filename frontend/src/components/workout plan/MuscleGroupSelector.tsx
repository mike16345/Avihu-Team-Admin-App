import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BiPencil } from "react-icons/bi";
import useMuscleGroupsApi from "@/hooks/api/useMuscleGroupsApi";
import { useQuery } from "@tanstack/react-query";
import { convertItemsToOptions } from "@/lib/utils";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import Loader from "../ui/Loader";
import { useWorkoutPlanContext } from "@/context/useWorkoutPlanContext";

interface MuscleGroupSelectorProps {
  handleDismiss: (value?: string) => void;
  handleChange: (value: string) => void;
  existingMuscleGroup?: string;
}

const MuscleGroupSelector: React.FC<MuscleGroupSelectorProps> = ({
  handleChange,
  handleDismiss,
  existingMuscleGroup,
}) => {
  const { workout } = useWorkoutPlanContext();
  const { getAllMuscleGroups } = useMuscleGroupsApi();
  const [value, setValue] = useState<string>(existingMuscleGroup || ``);
  const [open, setOpen] = useState(!Boolean(existingMuscleGroup));

  const muscleGroupsQuery = useQuery({
    queryKey: ["muscleGroups"],
    queryFn: getAllMuscleGroups,
    staleTime: FULL_DAY_STALE_TIME,
  });

  const muscleGroupOptions = useMemo(() => {
    const muscleGroupsInWorkout = workout.muscleGroups.map(
      (muscleGroup) => muscleGroup.muscleGroup
    );

    const filteredExistingMuscleGroups = muscleGroupsQuery.data?.data.filter(
      (muscleGroup) =>
        muscleGroupsInWorkout.find((mgName) => muscleGroup.name == mgName) == undefined
    );

    return convertItemsToOptions(filteredExistingMuscleGroups || [], "name", "name");
  }, [muscleGroupsQuery.data, workout.muscleGroups]);

  const updateSelection = (selection: string) => {
    handleChange(selection);
    setValue(selection);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        handleDismiss(value);
        setOpen(open);
      }}
    >
      <DialogTrigger
        className="w-[180px] border hover:border-secondary-foreground rounded py-1 px-2"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center justify-between">
          <p className="font-bold text-md">{existingMuscleGroup || `לא נבחר`}</p>
          <p className="text-sm">
            <BiPencil />
          </p>
        </div>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle dir="rtl" className="text-center underline">
            בחר קבוצת שריר
          </DialogTitle>
          <DialogDescription className="w-full flex justify-center  z-50 "></DialogDescription>
        </DialogHeader>
        <Command>
          <CommandEmpty></CommandEmpty>
          <CommandInput dir="rtl" placeholder="בחר קבוצת שריר..." />
          <CommandList>
            <CommandGroup dir="rtl">
              {muscleGroupsQuery.isLoading && <Loader size="medium" />}
              {muscleGroupOptions?.map((option, i) => (
                <CommandItem
                  key={option.name + i}
                  className="text-lg font-bold border-b-2"
                  value={option.name}
                  onSelect={(name) => {
                    if (value?.toLowerCase() == name.toLowerCase()) return; // Return if value is the same as previous value.
                    updateSelection(option.value);
                    setOpen(false);
                  }}
                >
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default MuscleGroupSelector;
