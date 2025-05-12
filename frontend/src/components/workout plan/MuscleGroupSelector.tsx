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
import { convertItemsToOptions, removePointerEventsFromBody } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import Loader from "../ui/Loader";
import { useFormContext } from "react-hook-form";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import useMuscleGroupsQuery from "@/hooks/queries/MuscleGroups/useMuscleGroupsQuery";

interface MuscleGroupSelectorProps {
  handleChange: (value: string) => void;
  existingMuscleGroup?: string;
  pathToMuscleGroups: `workoutPlans.${number}.muscleGroups`;
}

const MuscleGroupSelector: React.FC<MuscleGroupSelectorProps> = ({
  handleChange,
  existingMuscleGroup,
  pathToMuscleGroups,
}) => {
  const { getValues } = useFormContext<WorkoutSchemaType>();
  const muscleGroups = getValues(pathToMuscleGroups);

  const [value, setValue] = useState<string>(existingMuscleGroup || ``);
  const [open, setOpen] = useState(!Boolean(existingMuscleGroup));

  const muscleGroupsQuery = useMuscleGroupsQuery();

  const muscleGroupOptions = useMemo(() => {
    const muscleGroupsInWorkout = muscleGroups.map((muscleGroup) => muscleGroup.muscleGroup);

    const filteredExistingMuscleGroups = muscleGroupsQuery.data?.data.filter(
      (muscleGroup) =>
        muscleGroupsInWorkout.find((mgName) => muscleGroup.name == mgName) == undefined
    );

    return convertItemsToOptions(filteredExistingMuscleGroups || [], "name", "name");
  }, [muscleGroupsQuery.data, muscleGroups]);

  const updateSelection = (selection: string) => {
    handleChange(selection);
    setValue(selection);
    setOpen(false);
    removePointerEventsFromBody();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
