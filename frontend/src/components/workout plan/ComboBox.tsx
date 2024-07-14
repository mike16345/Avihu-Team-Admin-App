import React, { useContext, useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useIsWorkoutEditable } from "@/store/isWorkoutEditableStore";

interface ComboBoxProps {
  options: string[] | undefined;
  handleChange: (value: string) => void;
  existingValue?: string
}

const ComboBox: React.FC<ComboBoxProps> = ({ options, handleChange, existingValue }) => {


  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string | undefined>(existingValue ? existingValue : undefined);
  const isEditable = useIsWorkoutEditable((state) => state.isEditable)



  useEffect(() => {
    if (value) {
      setOpen(false);
      handleChange(value);
    }
  }, [value])

  return (
    <Popover open={isEditable ? open : false} onOpenChange={setOpen}>
      <PopoverTrigger dir="rtl" asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value ? value : `בחר`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput dir="rtl" placeholder="בחר סוג תוכנית..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup dir="rtl">
              {options?.map((option) => (
                <CommandItem key={option} value={option} onSelect={(val) => setValue(val)}>
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBox;
