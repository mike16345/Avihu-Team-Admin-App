import { FC, PropsWithChildren } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface UserExpiredTooltipProps extends PropsWithChildren {
  isActive?: boolean;
}

const UserExpiredTooltip: FC<UserExpiredTooltipProps> = ({ isActive, children }) => {
  if (!isActive) return <>{children}</>;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <span className="font-bold">תוכנית המשתמש הסתיימה</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserExpiredTooltip;
