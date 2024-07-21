"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
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

const muscleGroups = [
  {
    value: "קרסוליים",
    label: "קרסוליים",
  },
  {
    value: "שרירי עקב",
    label: "שרירי עקב",
  },
  {
    value: "שרירי רגל",
    label: "שרירי רגל",
  },
  {
    value: "שרירי הירך",
    label: "שרירי הירך",
  },
  {
    value: "שרירי הבטן",
    label: "שרירי הבטן",
  },
  {
    value: "שרירי הצדדים",
    label: "שרירי הצדדים",
  },
  {
    value: "שרירי החזה",
    label: "שרירי החזה",
  },
  {
    value: "שרירי הכתפיים",
    label: "שרירי הכתפיים",
  },
  {
    value: "שריר חולמי",
    label: "שריר חולמי",
  },
  {
    value: "שריר הגב",
    label: "שריר הגב",
  },
  {
    value: "שרירי הזרוע",
    label: "שרירי הזרוע",
  },
  {
    value: "שרירי היד",
    label: "שרירי היד",
  },
  {
    value: "שרירי הידיים",
    label: "שרירי הידיים",
  },
  {
    value: "שרירי הגב הקשר",
    label: "שרירי הגב הקשר",
  },
  {
    value: "שרירי הירך הסטרי",
    label: "שרירי הירך הסטרי",
  },
  {
    value: "שרירי הירך הכניסי",
    label: "שרירי הירך הכניסי",
  },
  {
    value: "שריר הכף הגדולה",
    label: "שריר הכף הגדולה",
  },
  {
    value: "שריר הכף הקטנה",
    label: "שריר הכף הקטנה",
  },
];

interface ComboBoxProps {
  value: string;
  onChange: (value: string) => void;
} 

export function MuscleGroupCombobox({ value, onChange }: ComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [currentValue, setValue] = React.useState(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {currentValue
            ? muscleGroups.find((framework) => framework.value === currentValue)?.label
            : "בחר קבוצת שריר..."}
          <FaSort className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="חפש קבוצת שריר..." className="h-9" />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {muscleGroups.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(val) => {
                    setValue(val === currentValue ? "" : val);
                    onChange(val === currentValue ? "" : val);
                    setOpen(false);
                  }}
                >
                  {framework.label}
                  <FaCheck
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentValue === framework.value ? "opacity-100" : "opacity-0"
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
