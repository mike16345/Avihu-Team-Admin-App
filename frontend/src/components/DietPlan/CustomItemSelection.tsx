import { FC, useState } from "react";
import { Badge } from "../ui/badge";
import { FaCheck, FaPlus } from "react-icons/fa";

const proteinItems = [
  "Chicken",
  "Beef",
  "Pork",
  "Lamb",
  "Turkey",
  "Duck",
  "Salmon",
  "Tuna",
  "Eggs",
  "Tofu",
  "Edamame",
  "Lentils",
  "Chickpeas",
  "Black Beans",
  "Kidney Beans",
  "Navy Beans",
  "Pinto Beans",
  "Quinoa",
  "Peanuts",
  "Almonds",
  "Cashews",
  "Walnuts",
  "Hazelnuts",
  "Sunflower Seeds",
  "Pumpkin Seeds",
  "Chia Seeds",
  "Hemp Seeds",
  "Flax Seeds",
  "Greek Yogurt",
  "Cottage Cheese",
  "Cheddar Cheese",
  "Mozzarella Cheese",
  "Parmesan Cheese",
  "Ricotta Cheese",
  "String Cheese",
  "Sausage",
  "Pepperoni",
  "Pastrami",
  "Corned Beef",
  "Veal",
  "Goat",
  "Sardines",
  "Anchovies",
  "Tilapia",
  "Trout",
  "Bass",
  "Cod",
  "Haddock",
  "Grouper",
  "Caviar",
  "Seitan",
  "Textured Vegetable Protein",
  "Soy Milk",
  "Almond Milk",
  "Pea Protein",
  "Hemp Protein",
  "Whey Protein",
  "Casein Protein",
  "Plant-Based Meat",
];

type CustomItemSelectionProps = {
  onItemToggle: (selectedItems: string[]) => void;
  selectedItems?: string[];
};

export const CustomItemSelection: FC<CustomItemSelectionProps> = ({
  onItemToggle,
  selectedItems,
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
    <div className="flex flex-wrap items-center max-h-40 custom-scrollbar overflow-y-scroll gap-4">
      {proteinItems.map((item, index) => (
        <Badge
          key={index}
          onClick={() => toggleSelect(item)}
          className={`cursor-pointer ${selected.includes(item) ? "bg-green-500  text-white" : ""}`}
        >
          {selected.includes(item) ? (
            <FaCheck size={10} className="inline mr-1" />
          ) : (
            <FaPlus size={10} className="inline mr-1" />
          )}
          {item}
        </Badge>
      ))}
    </div>
  );
};
