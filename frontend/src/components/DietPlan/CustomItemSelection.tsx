import { FC, useState } from "react";
import { Badge } from "../ui/badge";
import { FaCheck, FaPlus } from "react-icons/fa";

const proteinItems = [
  "עוף",
  "בקר",
  "חזיר",
  "כבש",
  "הודו",
  "ברווז",
  "סלמון",
  "טונה",
  "ביצים",
  "טופו",
  "אדממה",
  "עדשים",
  "חומוס",
  "שעועית שחורה",
  "שעועית כליה",
  "שעועית חילבה",
  "שעועית פינטו",
  "קינואה",
  "בוטנים",
  "שקדים",
  "קשיו",
  "אגוזי מלך",
  "אגוזי לוז",
  "גרעיני חמניות",
  "גרעיני דלעת",
  "זרעי צ'יה",
  "זרעי המפ",
  "זרעי פשתן",
  "יוגורט יווני",
  "גבעה גבינה",
  "גאודה",
  "מוצרלה",
  "פרמזן",
  "גבינת ריקוטה",
  "גבינה מעורבבת",
  "נקניק",
  "פפרוני",
  "פסטרמה",
  "בשר מתובל",
  "עגל",
  "גדי",
  "סרדינים",
  "אנשובי",
  "אמנון",
  "טרוטה",
  "לוקוס",
  "בקלה",
  "הדוק",
  "גרופר",
  "קויאר",
  "סייטן",
  "חלבון צמחי ממקור מרקם",
  "חלב סויה",
  "חלב שקדים",
  "חלבון אפונה",
  "חלבון המפ",
  "חלבון מי גבינה",
  "חלבון קזאין",
  "בשר על בסיס צמחי",
];

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
    <div className="flex flex-wrap items-center p-2  max-h-48 custom-scrollbar overflow-y-scroll gap-4">
      {items.map((item, index) => (
        <Badge
          key={item._id || index}
          onClick={() => toggleSelect(item)}
          className={`cursor-pointer  flex item-center justify-center ${
            selected.includes(item) ? "bg-green-500  text-white" : ""
          }`}
        >
          {item.name}
          {selected.includes(item) ? (
            <FaCheck size={12} className="inline mr-1" />
          ) : (
            <FaPlus size={12} className="inline mr-1" />
          )}
        </Badge>
      ))}
    </div>
  );
};
