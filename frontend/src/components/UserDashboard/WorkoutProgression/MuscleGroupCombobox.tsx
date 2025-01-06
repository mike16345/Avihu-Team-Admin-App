"use client";

import * as React from "react";

import { cn, convertStringsToOptions } from "@/lib/utils";
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
import { FaCheck, FaSort } from "react-icons/fa";

interface ComboBoxProps {
  selectedMuscleGroup: string;
  muscleGroups: string[];
  handleSelectMuscleGroup: (value: string) => void;
}

export function MuscleGroupCombobox({
  selectedMuscleGroup,
  muscleGroups,
  handleSelectMuscleGroup,
}: ComboBoxProps) {
  const options = convertStringsToOptions(muscleGroups);

  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedMuscleGroup !== "" ? selectedMuscleGroup : "בחר קבוצת שריר..."}
          <FaSort className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="חפש קבוצת שריר..." className="h-9" />
          <CommandList>
            <CommandEmpty>No muscle groups found.</CommandEmpty>
            <CommandGroup>
              {options.map((muscleGroup) => (
                <CommandItem
                  key={muscleGroup.value}
                  value={muscleGroup.value}
                  onSelect={() => {
                    handleSelectMuscleGroup(muscleGroup.value);
                    setOpen(false);
                  }}
                >
                  {muscleGroup.label}
                  <FaCheck
                    className={cn(
                      "mr-auto h-4 w-4",
                      selectedMuscleGroup === muscleGroup.value ? "opacity-100" : "opacity-0"
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
}
