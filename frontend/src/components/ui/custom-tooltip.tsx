import { FC, ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

type Side = "left" | "right" | "bottom" | "top";

interface TooltipProps {
  tooltipTrigger: ReactNode;
  tooltipContent: ReactNode;
  side?: Side;
  duration?: number;
  children?: ReactNode;
}

export const CustomTooltip: FC<TooltipProps> = ({
  tooltipTrigger,
  tooltipContent,
  duration = 100,
  side = "top",
  children,
  ...props
}) => {
  return (
    <TooltipProvider delayDuration={duration}>
      <Tooltip>
        <TooltipTrigger asChild>{tooltipTrigger}</TooltipTrigger>
        <TooltipContent side={side}>{tooltipContent}</TooltipContent>
        {children}
      </Tooltip>
    </TooltipProvider>
  );
};
