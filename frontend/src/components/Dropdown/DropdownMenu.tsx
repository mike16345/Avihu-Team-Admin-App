import { Option } from "@/types/types";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface CustomDropDownMenuProps {
  trigger: React.ReactNode;
  options: Option[];
  selectedOptions?: string[];
  handleOptionClick: (option: string) => void;
}

const CustomDropdownMenu: React.FC<CustomDropDownMenuProps> = ({
  options,
  handleOptionClick,
  trigger,
  selectedOptions = [],
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((item) => {
          return (
            <DropdownMenuCheckboxItem
              dir="rtl"
              onClick={() => handleOptionClick(item.value)}
              key={item.name}
              className="capitalize"
              checked={selectedOptions.includes(item.value)}
            >
              {item.name}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomDropdownMenu;
