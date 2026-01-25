import { cn } from "@/lib/utils";
import React from "react";
interface LoaderProps {
  size?: `small` | `medium` | `large` | `xl`;
  variant?: `standard` | `button`;
  style?: `spinner` | `orbit`;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = `medium`,
  variant = `standard`,
  style = `spinner`,
  className,
}) => {
  const spinnerSizeClasses: Record<NonNullable<LoaderProps["size"]>, string> = {
    small: "h-4 w-4 border-2",
    medium: "h-5 w-5 border-[2.5px]",
    large: "h-7 w-7 border-[3px]",
    xl: "h-9 w-9 border-4",
  };

  const orbitSizeClasses: Record<NonNullable<LoaderProps["size"]>, string> = {
    small: "h-4 w-4",
    medium: "h-5 w-5",
    large: "h-7 w-7",
    xl: "h-9 w-9",
  };

  const orbitDotSizeClasses: Record<NonNullable<LoaderProps["size"]>, string> = {
    small: "h-1.5 w-1.5",
    medium: "h-2 w-2",
    large: "h-2.5 w-2.5",
    xl: "h-3 w-3",
  };

  const ringColorClass =
    variant === `standard`
      ? "border-primary/20 border-t-primary border-r-primary/70 shadow-[0_0_12px_rgba(59,130,246,0.25)]"
      : "border-primary-foreground/30 border-t-primary-foreground border-r-primary-foreground/70";

  const orbitDotColorClass =
    variant === `standard`
      ? "bg-primary/85 shadow-[0_0_10px_rgba(59,130,246,0.25)]"
      : "bg-primary-foreground";

  return (
    <div className={cn(`w-full h-full flex items-center justify-center `, className)}>
      {style === `spinner` ? (
        <div
          className={cn(
            "rounded-full animate-[spin_0.8s_linear_infinite]",
            spinnerSizeClasses[size],
            ringColorClass
          )}
        />
      ) : (
        <div
          className={cn(
            "relative animate-[spin_1.4s_linear_infinite] motion-reduce:animate-none",
            orbitSizeClasses[size]
          )}
        >
          <span className="absolute inset-0 flex items-start justify-center">
            <span className={cn("rounded-full", orbitDotSizeClasses[size], orbitDotColorClass)} />
          </span>
          <span className="absolute inset-0 flex items-start justify-center rotate-[120deg]">
            <span className={cn("rounded-full", orbitDotSizeClasses[size], orbitDotColorClass)} />
          </span>
          <span className="absolute inset-0 flex items-start justify-center rotate-[240deg]">
            <span className={cn("rounded-full", orbitDotSizeClasses[size], orbitDotColorClass)} />
          </span>
        </div>
      )}
    </div>
  );
};

export default Loader;
