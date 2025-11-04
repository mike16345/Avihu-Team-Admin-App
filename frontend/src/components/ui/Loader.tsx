import { cn } from "@/lib/utils";
import React from "react";
interface LoaderProps {
  size?: `small` | `medium` | `large` | `xl`;
  variant?: `standard` | `button`;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = `medium`, variant = `standard`, className }) => {
  const pxSize = size === `small` ? 10 : size === `medium` ? 12 : size === `large` ? 20 : 24;

  return (
    <div
      className={cn(`w-full h-full flex items-center justify-center `, className)}
      data-testid="loading"
    >
      <div className="flex flex-col gap-5 items-center">
        <div
          className={
            variant === `standard`
              ? `rounded-full  border-8 border-t-primary animate-spin w-${pxSize} h-${pxSize} `
              : `rounded-full animate-spin border-2 border-primary-foreground border-t-transparent w-6 h-6`
          }
        ></div>
      </div>
    </div>
  );
};

export default Loader;
