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
  handleChange: (value: string) => void;
  existingMuscleGroup?: string;
}

const MuscleGroupSelector: React.FC<MuscleGroupSelectorProps> = ({
  handleChange,
  existingMuscleGroup,
}) => {
  const { workout } = useWorkoutPlanContext();
  const { getAllMuscleGroups } = useMuscleGroupsApi();
  const [value, setValue] = useState<string>(existingMuscleGroup || ``);

  console.log("workout", workout);
  const muscleGroupsInWorkout = workout.muscleGroups.map((muscleGroup) => muscleGroup.muscleGroup);

  const muscleGroupsQuery = useQuery({
    queryKey: ["muscleGroups"],
    queryFn: () => getAllMuscleGroups().then((res) => res.data),
    staleTime: FULL_DAY_STALE_TIME,
  });

  const muscleGroupOptions = useMemo(() => {
    console.log("muscleGroups", muscleGroupsQuery.data);
    console.log("muscleGroups in workout", muscleGroupsInWorkout);
    const filteredExistingMuscleGroups = muscleGroupsQuery.data?.filter(
      (muscleGroup) =>
        muscleGroupsInWorkout.find((mgName) => muscleGroup.name == mgName) == undefined
    );

    console.log("filteredExistingMuscleGroups", filteredExistingMuscleGroups);
    return convertItemsToOptions(filteredExistingMuscleGroups || [], "name", "name");
  }, [muscleGroupsQuery.data, muscleGroupsInWorkout]);

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
            בחר קבוצת שריר
          </DialogTitle>
          <DialogDescription className="w-full flex justify-center py-4 z-50 ">
            <Command>
              <CommandEmpty></CommandEmpty>
              <CommandInput dir="rtl" placeholder="בחר קבוצת שריר..." />
              <CommandList>
                <CommandGroup dir="rtl">
                  {muscleGroupsQuery.isLoading && <Loader size="medium" />}
                  {muscleGroupOptions?.map((option, i) => (
                    <CommandItem
                      key={option.name + i}
                      className="text-lg font-bold"
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
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default MuscleGroupSelector;
