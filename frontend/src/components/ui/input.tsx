import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[#DCE3EA] bg-white dark:bg-slate-900 dark:border-slate-800 px-3.5 py-2 text-sm text-[#172B4D] dark:text-slate-100 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#98A2B3] focus-visible:outline-none focus-visible:border-[#9FC5E8] focus-visible:ring-2 focus-visible:ring-[#9FC5E8]/40 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
