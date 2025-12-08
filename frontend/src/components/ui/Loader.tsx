import { cn } from "@/lib/utils";
import React from "react";
interface LoaderProps {
  size?: `small` | `medium` | `large` | `xl`;
  variant?: `standard` | `button`;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = `medium`, variant = `standard`, className }) => {
  const standardSizeClasses: Record<NonNullable<LoaderProps["size"]>, string> = {
    small: "w-2.5 h-2.5 border-2",
    medium: "w-3 h-3 border-4",
    large: "w-5 h-5 border-8",
    xl: "w-6 h-6 border-8",
  };

  const buttonSizeClasses: Record<NonNullable<LoaderProps["size"]>, string> = {
    small: "w-2.5 h-2.5",
    medium: "w-3 h-3",
    large: "w-5 h-5",
    xl: "w-6 h-6",
  };

  const spinnerClass =
    variant === `standard`
      ? cn("rounded-full border-border border-t-primary animate-spin", standardSizeClasses[size])
      : cn(
          "rounded-full animate-spin border-2 border-primary-foreground border-t-transparent",
          buttonSizeClasses[size]
        );

  return (
    <div className={cn(`w-full h-full flex items-center justify-center `, className)}>
      <div className="flex flex-col gap-5 items-center">
        <div className={spinnerClass}></div>
      </div>
    </div>
  );
};

export default Loader;
