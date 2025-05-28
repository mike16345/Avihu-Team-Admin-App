import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { FilterIcon } from "lucide-react";

import { ReactNode } from "react";

export interface FilterItemsProps<T> {
  /** Trigger element to open the dropdown. Defaults to a Button if not provided. */
  trigger?: ReactNode;

  /** Array of items to choose from. Can be strings or objects. */
  items: T[];

  /** Optional key to use as the display name when items are objects. */
  nameKey?: keyof T;

  /** Currently selected items. Controlled component. */
  selectedItems: T[];

  /** Callback when selection changes. */
  onChange: (selected: T[]) => void;

  /** Optional placeholder or label when no items are selected. */
  placeholder?: string;

  /** Optional className for styling the dropdown container. */
  className?: string;

  /** Optional max height of the dropdown list (for scrollable UI). */
  maxHeight?: number | string;

  /** Optional function to uniquely identify each item (if not using primitive types). */
  getId?: (item: T) => string | number;

  /** Optional function to customize item rendering. */
  renderItem?: (item: T, selected: boolean) => ReactNode;
}

const FilterItems = <T,>({
  trigger,
  items,
  nameKey,
  selectedItems,
  onChange,
  placeholder,
  className,
  maxHeight = 300,
  getId,
  renderItem,
}: FilterItemsProps<T>) => {
  const isSelected = (item: T) => {
    const id = getId ? getId(item) : item;
    return selectedItems.some((selected) => (getId ? getId(selected) === id : selected === item));
  };

  const toggleItem = (item: T) => {
    const selected = isSelected(item);
    const updated = selected
      ? selectedItems.filter((i) => (getId ? getId(i) !== getId!(item) : i !== item))
      : [...selectedItems, item];

    onChange(updated);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            {placeholder ?? "סינון"}
            <FilterIcon size={16} className="mr-2" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={className}>
        <div
          style={{
            maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
            overflowY: "auto",
          }}
        >
          {items.map((item, idx) => {
            const id = getId ? getId(item) : idx;
            const selected = isSelected(item);

            return (
              <DropdownMenuCheckboxItem
                key={id}
                dir="rtl"
                onSelect={(e) => e.preventDefault()}
                checked={selected}
                onCheckedChange={() => toggleItem(item)}
                className="capitalize"
              >
                {renderItem
                  ? renderItem(item, selected)
                  : typeof item === "string"
                  ? item
                  : nameKey
                  ? String(item[nameKey])
                  : JSON.stringify(item)}
              </DropdownMenuCheckboxItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterItems;
