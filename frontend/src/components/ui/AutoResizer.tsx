import React, { useCallback, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface AutoResizerProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxHeight?: number;
}

const AutoResizer = React.forwardRef<HTMLTextAreaElement, AutoResizerProps>(
  ({ className, maxHeight = 160, style, onChange, onInput, value, ...props }, forwardedRef) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const setRef = (element: HTMLTextAreaElement | null) => {
      internalRef.current = element;

      if (!forwardedRef) return;
      if (typeof forwardedRef === "function") {
        forwardedRef(element);
        return;
      }
      forwardedRef.current = element;
    };

    const resize = useCallback(
      (element: HTMLTextAreaElement | null) => {
        if (!element) return;

        element.style.height = "auto";
        element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`;
        element.style.overflowY = element.scrollHeight > maxHeight ? "auto" : "hidden";
      },
      [maxHeight]
    );

    useLayoutEffect(() => {
      resize(internalRef.current);
    }, [value, resize]);

    return (
      <Textarea
        {...props}
        value={value}
        rows={1}
        ref={setRef}
        className={cn("min-h-[40px] resize-none overflow-y-hidden", className)}
        style={{ ...style, maxHeight }}
        onChange={(event) => {
          onChange?.(event);
          resize(event.currentTarget);
        }}
        onInput={(event) => {
          onInput?.(event);
          resize(event.currentTarget);
        }}
      />
    );
  }
);

AutoResizer.displayName = "AutoResizer";

export default AutoResizer;
