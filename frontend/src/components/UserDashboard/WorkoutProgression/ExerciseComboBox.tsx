import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { exercisesByMuscleGroup } from "@/constants/Workout";
import { cn } from "@/lib/utils";
import React from "react";
import { FaSort, FaCheck } from "react-icons/fa";

type Exercise = {
  label: string;
  value: string;
};

const exercisesToOptions = (exercises: string[]): Exercise[] => {
  return exercises.map((exercise) => ({
    label: exercise,
    value: exercise,
  }));
};
export const ExerciseComboBox = ({ muscleGroup }: { muscleGroup: string }) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  // @ts-ignore
  const exercises = exercisesToOptions(exercisesByMuscleGroup[muscleGroup] || []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value ? exercises.find((exercise) => exercise.value === value)?.label : "בחר תרגיל..."}
          <FaSort className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="חפש קבוצת שריר..." className="h-9" />
          <CommandList>
            <CommandEmpty>No exercise found.</CommandEmpty>
            <CommandGroup>
              {exercises.map((exercise) => (
                <CommandItem
                  key={exercise.value}
                  value={exercise.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {exercise.label}
                  <FaCheck
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === exercise.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
