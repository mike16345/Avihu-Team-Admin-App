import { Button } from "../ui/button";
import { BiExit } from "react-icons/bi";
import { CustomTooltip } from "../ui/custom-tooltip";
import { FC } from "react";

interface LogoutButtonProps {
  onLogout: () => void;
}

const LogoutButton: FC<LogoutButtonProps> = ({ onLogout }) => {
  return (
    <CustomTooltip
      side="top"
      tooltipContent={"יציאה"}
      tooltipTrigger={
        <Button onClick={onLogout} variant={"outline"} size="icon">
          <BiExit size={24} />
          <span className="sr-only">יציאה</span>
        </Button>
      }
    />
  );
};

export default LogoutButton;
