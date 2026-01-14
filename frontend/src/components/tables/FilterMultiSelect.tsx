import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Option } from "@/types/types";

interface FilterMultiSelectProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

const FilterMultiSelect = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "הכל",
  className,
}: FilterMultiSelectProps) => {
  const optionMap = useMemo(() => {
    return options.reduce<Record<string, string>>((acc, option) => {
      acc[option.value] = option.name;
      return acc;
    }, {});
  }, [options]);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }

    onChange([...selected, value]);
  };

  const summary = useMemo(() => {
    if (!selected.length) {
      return placeholder;
    }

    if (selected.length === 1) {
      return optionMap[selected[0]] ?? selected[0];
    }

    const firstLabel = optionMap[selected[0]] ?? selected[0];
    const restCount = selected.length - 1;

    return `${firstLabel} ועוד ${restCount}`;
  }, [selected, optionMap, placeholder]);

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("h-9 gap-2 whitespace-nowrap", className)}>
          <span className="text-sm font-medium">{label}</span>
          <span className="max-w-[12rem] truncate text-sm text-muted-foreground">{summary}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="max-h-64 overflow-y-auto w-72">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            dir="rtl"
            checked={selected.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
            onSelect={(event) => event.preventDefault()}
          >
            {option.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterMultiSelect;
