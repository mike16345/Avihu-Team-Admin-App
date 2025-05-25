import { Option } from "@/types/types";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { ChevronsUpDown } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { Button } from "./button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import Loader from "./Loader";

interface ComboBoxProps {
  options: Option[];
  value: any;
  onSelect: (val: any) => void;
  inputPlaceholder?: string;
  listEmptyMessage?: string;
  isLoading?: boolean;
}

const ComboBox: FC<ComboBoxProps> = ({
  onSelect,
  options,
  value,
  isLoading,
  listEmptyMessage = "אין פריטים",
  inputPlaceholder = "חפש...",
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    return () => setOpen(false);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full  flex justify-between" dir="rtl" asChild>
        <Button variant="outline" role="combobox" aria-expanded={open}>
          <span>{value || `בחר`}</span>
          <ChevronsUpDown className="mr-4 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput dir="rtl" placeholder={inputPlaceholder} />

          {options.length == 0 && !isLoading && (
            <div className="flex-1 flex place-content-center p-3 text-sm">{listEmptyMessage}</div>
          )}
          {isLoading && <Loader className="p-2" />}
          <CommandList>
            <CommandGroup dir="rtl">
              {options?.map((option, i) => (
                <CommandItem
                  key={option.name + i}
                  value={option.name}
                  onSelect={(name) => {
                    setOpen(false);
                    if (value?.toLowerCase() == name.toLowerCase()) return;
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
