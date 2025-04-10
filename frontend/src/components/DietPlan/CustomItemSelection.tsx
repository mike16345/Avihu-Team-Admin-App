import { FC, useState } from "react";
import { Badge } from "../ui/badge";
import { FaCheck, FaPlus } from "react-icons/fa";

type CustomItemSelectionProps = {
  onItemToggle: (selectedItems: string[]) => void;
  selectedItems?: string[];
  items: any[];
};

export const CustomItemSelection: FC<CustomItemSelectionProps> = ({
  onItemToggle,
  selectedItems,
  items,
}) => {
  const [selected, setSelectedItems] = useState<string[]>(selectedItems || []);

  const toggleSelect = (item: string) => {
    setSelectedItems((prevSelectedItems) => {
      const selected = prevSelectedItems.includes(item)
        ? prevSelectedItems.filter((i) => i !== item)
        : [...prevSelectedItems, item];

      onItemToggle(selected);

      return selected;
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center p-2 max-h-48 custom-scrollbar overflow-y-scroll gap-4">
        {(!items || items?.length == 0) && <div className="text-destructive">אין פריטים</div>}
        {items?.map((item, index) => (
          <Badge
            key={item._id || index}
            onClick={() => toggleSelect(item._id)}
            className={`cursor-pointer  flex item-center justify-center ${
              selected.includes(item._id) ? "bg-success  text-white" : ""
            }`}
          >
            {item.name}
            {selected.includes(item._id) ? (
              <FaCheck size={12} className="inline mr-1" />
            ) : (
              <FaPlus size={12} className="inline mr-1" />
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
};
