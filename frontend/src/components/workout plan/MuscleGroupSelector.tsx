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
import { convertStringsToOptions, removePointerEventsFromBody } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { useFormContext } from "react-hook-form";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import { MUSCLE_GROUPS } from "@/constants/muscleGroups";

interface MuscleGroupSelectorProps {
  handleDismiss: (value?: string) => void;
  handleChange: (value: string) => void;
  existingMuscleGroup?: string;
  pathToMuscleGroups: `workoutPlans.${number}.muscleGroups`;
}

const MuscleGroupSelector: React.FC<MuscleGroupSelectorProps> = ({
  handleChange,
  handleDismiss,
  existingMuscleGroup,
  pathToMuscleGroups,
}) => {
  const { getValues } = useFormContext<WorkoutSchemaType>();
  const muscleGroups = getValues(pathToMuscleGroups);

  const [value, setValue] = useState<string>(existingMuscleGroup || ``);
  const [open, setOpen] = useState(!Boolean(existingMuscleGroup));

  const muscleGroupOptions = useMemo(() => {
    const muscleGroupsInWorkout = muscleGroups.map((muscleGroup) => muscleGroup.muscleGroup);

    const filteredExistingMuscleGroups = MUSCLE_GROUPS.filter(
      (muscleGroup) => muscleGroupsInWorkout.find((mgName) => muscleGroup == mgName) == undefined
    );

    return convertStringsToOptions(filteredExistingMuscleGroups || []);
  }, [muscleGroups]);

  const updateSelection = (selection: string) => {
    handleChange(selection);
    setValue(selection);
    setOpen(false);
    removePointerEventsFromBody();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        handleDismiss(value);
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
              {muscleGroupOptions?.map((option, i) => (
                <CommandItem
                  key={option.name + i}
                  className="text-lg font-bold border-b-2"
                  value={option.name}
                  onSelect={(name) => {
                    if (value?.toLowerCase() == name.toLowerCase()) return; // Return if value is the same as previous value.
                    updateSelection(option.value);
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
