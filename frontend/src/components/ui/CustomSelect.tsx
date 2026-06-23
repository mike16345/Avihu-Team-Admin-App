import React, { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Option } from "@/types/types";

const EMPTY_OPTION_VALUE = "__custom_select_empty__";

export type CustomSelectItem = Option & {
  label?: ReactNode;
  disabled?: boolean;
};

interface CustomSelectProps {
  placeholder?: string;
  selectedValue?: string;
  items: CustomSelectItem[];
  onValueChange: (value: string) => void;
  className?: string;
  contentClassName?: string;
  itemClassName?: string;
  disabled?: boolean;
  dir?: "rtl" | "ltr";
  startAdornment?: ReactNode;
  testId?: string;
}

const normalizeValue = (value: string) => (value === "" ? EMPTY_OPTION_VALUE : value);

const CustomSelect: React.FC<CustomSelectProps> = ({
  items,
  placeholder,
  selectedValue,
  onValueChange,
  className,
  contentClassName,
  itemClassName,
  disabled = false,
  dir = "rtl",
  startAdornment,
  testId,
}) => {
  const hasExplicitEmptyOption = items.some((item) => item.value === "");
  const resolvedValue =
    selectedValue === undefined || (!hasExplicitEmptyOption && selectedValue === "")
      ? undefined
      : normalizeValue(selectedValue);

  return (
    <Select
      value={resolvedValue}
      onValueChange={(value) => onValueChange(value === EMPTY_OPTION_VALUE ? "" : value)}
      disabled={disabled}
      dir={dir}
    >
      <div className="relative">
        {startAdornment && (
          <span className="pointer-events-none absolute start-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {startAdornment}
          </span>
        )}
        <SelectTrigger
          data-testid={testId}
          className={cn("w-full", startAdornment && "ps-9", className)}
        >
          <SelectValue placeholder={placeholder || "בחר"} />
        </SelectTrigger>
      </div>
      <SelectContent className={contentClassName} dir={dir}>
        <SelectGroup>
          {items.map((item, index) => {
            const displayLabel = item.label ?? item.name ?? item.value;

            return (
              <SelectItem
                className={cn("cursor-pointer", itemClassName)}
                key={`${item.value || "empty"}-${index}`}
                value={normalizeValue(item.value)}
                disabled={item.disabled}
                onPointerDown={(event) => {
                  event.stopPropagation();
                }}
              >
                {displayLabel}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default CustomSelect;
