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
  "Shrimp",
  "Crab",
  "Lobster",
  "Oysters",
  "Scallops",
  "Mussels",
  "Clams",
  "Eggs",
  "Tofu",
  "Tempeh",
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
  "Bacon",
  "Prosciutto",
  "Pepperoni",
  "Pastrami",
  "Corned Beef",
  "Veal",
  "Bison",
  "Elk",
  "Venison",
  "Goat",
  "Rabbit",
  "Quail",
  "Pheasant",
  "Herring",
  "Mackerel",
  "Sardines",
  "Anchovies",
  "Tilapia",
  "Catfish",
  "Trout",
  "Swordfish",
  "Halibut",
  "Bass",
  "Cod",
  "Haddock",
  "Grouper",
  "Snapper",
  "Octopus",
  "Squid",
  "Sea Urchin",
  "Sea Cucumber",
  "Conch",
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
  "Insect Protein",
];

type CustomItemSelectionProps = {
  onItemToggle: (selectedItems: string[]) => void;
};

export const CustomItemSelection: FC<CustomItemSelectionProps> = ({ onItemToggle }) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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
          className={`cursor-pointer ${
            selectedItems.includes(item) ? "bg-green-500  text-white" : ""
          }`}
        >
          {selectedItems.includes(item) ? (
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
