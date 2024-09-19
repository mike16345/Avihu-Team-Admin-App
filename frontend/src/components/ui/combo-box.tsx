import { Option } from "@/types/types";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { ChevronsUpDown } from "lucide-react";
import { FC, useState } from "react";
import { Button } from "./button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";

interface ComboBoxProps {
  options: Option[];
  value: any;
  onSelect: (val: any) => void;
}

const ComboBox: FC<ComboBoxProps> = ({ onSelect, options, value }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full  flex justify-between" dir="rtl" asChild>
        <Button variant="outline" role="combobox" aria-expanded={open}>
          <span>{value || `בחר`}</span>
          <ChevronsUpDown className="mr-4 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput dir="rtl" placeholder="בחר סוג תוכנית..." />
          <CommandList>
            <CommandGroup dir="rtl">
              {options?.map((option, i) => (
                <CommandItem
                  key={i}
                  value={option.name}
                  onSelect={(name) => {
                    if (value.toLowerCase() == name.toLowerCase()) return; // Return 
                    onSelect(option.value);
                  }}
                >
                  {option.name}
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
