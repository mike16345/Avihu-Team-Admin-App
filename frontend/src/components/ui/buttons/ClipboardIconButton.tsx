import { Button } from "@/components/ui/button";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import { cn } from "@/lib/utils";
import { Clipboard } from "lucide-react";

interface ClipboardIconButtonProps {
  onClick: () => void;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

const ClipboardIconButton = ({
  onClick,
  tooltip = "העתק ללוח",
  disabled,
  className,
}: ClipboardIconButtonProps) => {
  return (
    <CustomTooltip
      tooltipTrigger={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          className={cn("h-9 w-9", className)}
          aria-label={tooltip}
        >
          <Clipboard className="h-4 w-4" />
        </Button>
      }
      tooltipContent={tooltip}
      side="top"
    />
  );
};

export default ClipboardIconButton;
