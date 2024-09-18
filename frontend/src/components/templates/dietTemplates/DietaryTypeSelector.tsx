import { Badge } from "@/components/ui/badge";
import React, { useEffect, useState } from "react";
import { FaCheck, FaPlus } from "react-icons/fa";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { BiPencil } from "react-icons/bi";

const dietaryTypeItems = [`צמחוני`, `טבעוני`, `פסקטריאן`, `ללא גלוטן`, `ללא לקטוז`];

interface DietaryTypeSelectorProps {
  saveSelected: (selectedItems: string[]) => void;
  existingItems?: string[];
  error?: boolean;
}

const DietaryTypeSelector: React.FC<DietaryTypeSelectorProps> = ({
  saveSelected,
  existingItems,
  error,
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSelect = (item: string) => {
    setSelectedItems((prevSelectedItems) => {
      const selected = prevSelectedItems?.includes(item)
        ? prevSelectedItems.filter((i) => i !== item)
        : [...prevSelectedItems, item];

      saveSelected(selected);

      return selected;
    });
  };

  useEffect(() => {
    if (existingItems) {
      setSelectedItems(existingItems);
    }
  }, [existingItems]);

  return (
    <Collapsible open={isOpen}>
      <div className="flex items-end justify-between">
        <h1 className={error ? `text-destructive` : ``}>הגבלות תזונה</h1>
        <div
          className="cursor-pointer border-2 hover:border-black hover:bg-accent p-2 rounded"
          onClick={() => setIsOpen(!isOpen)}
        >
          <BiPencil />
        </div>
      </div>
      <div className="flex p-2 my-2 gap-2 flex-wrap h-auto border-y-2">
        {selectedItems.length == 0
          ? `ללא`
          : selectedItems.map((item) => <p className="inline  pl-2 border-l-2"> {item}</p>)}
      </div>
      <CollapsibleContent>
        <div className="w-full bg-accent py-3 px-2 rounded">
          {dietaryTypeItems.map((item) => (
            <Badge
              key={item}
              className={`m-1 cursor-pointer ${
                selectedItems.includes(item) ? `bg-green-500 text-white` : ``
              }`}
              onClick={() => handleSelect(item)}
            >
              {item}
              {selectedItems.includes(item) ? (
                <FaCheck size={12} className="inline mr-1" />
              ) : (
                <FaPlus size={12} className="inline mr-1" />
              )}
            </Badge>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default DietaryTypeSelector;
