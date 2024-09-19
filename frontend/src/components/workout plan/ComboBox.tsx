import React, { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ApiResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import ErrorPage from "@/pages/ErrorPage";
import InputSkeleton from "../ui/skeletons/InputSkeleton";

interface ComboBoxProps {
  optionsEndpoint?: string;
  handleChange: (value: any) => void;
  existingValue?: string;
  getOptions: (endpoint?: any) => Promise<ApiResponse<any[]>>;
  queryKey: string;
}

const ComboBox: React.FC<ComboBoxProps> = ({
  optionsEndpoint,
  getOptions,
  handleChange,
  existingValue,
  queryKey,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string | undefined>(existingValue);

  const { data, isError, isLoading, error } = useQuery({
    queryFn: () => getOptions(optionsEndpoint),
    staleTime: FULL_DAY_STALE_TIME,
    queryKey: [queryKey],
  });

  const onChange = (val: string) => {
    if (!data?.data) return;

    setValue(val);
    setOpen(false);
    let objToReturn;

    if (data?.data[0].name) {
      objToReturn = data?.data?.find((obj) => obj.name.toLowerCase() === val.toLowerCase());
    }

    handleChange(objToReturn);
  };

  if (isLoading) return <InputSkeleton />;
  if (isError) return <ErrorPage message={error.message} />;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="min-w-1/3 m-auto flex justify-between" dir="rtl" asChild>
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
              {data?.data?.map((option, i) => (
                <CommandItem key={i} value={option.name} onSelect={(val) => onChange(val)}>
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
