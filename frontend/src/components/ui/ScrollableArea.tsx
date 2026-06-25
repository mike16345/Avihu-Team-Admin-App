import { forwardRef, useCallback } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_MAX_HEIGHT = "max-h-[calc(100vh-360px)]";

const SCROLLBAR_CLASSES =
  // overflow-x-hidden is critical: without it, the negative margin
  // below (-me-2) causes the content to bleed past the parent edge,
  // which makes a horizontal scrollbar appear and shows up as a
  // thin gray line across the bottom of the list.
  "overflow-y-auto overflow-x-hidden p-2 -me-2 " +
  "[scrollbar-color:rgba(148,163,184,0.3)_transparent] [scrollbar-width:thin] " +
  "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-[3px] " +
  "[&::-webkit-scrollbar-thumb]:bg-slate-400/30 " +
  "[&::-webkit-scrollbar-thumb:hover]:bg-slate-400/50 " +
  "[&::-webkit-scrollbar-track]:bg-transparent";

const REACH_END_THRESHOLD_PX = 120;

interface ScrollableAreaProps {
  children: React.ReactNode;
  className?: string;
  /** Fired when the user scrolls within REACH_END_THRESHOLD_PX of
   *  the bottom. Lets the caller drive infinite-scroll without
   *  needing a sentinel + IntersectionObserver. The caller is
   *  responsible for guarding against repeat fires while a page
   *  is in flight (e.g. via `isFetchingNextPage`). */
  onReachEnd?: () => void;
}

/**
 * Page-level scroll container with the slim brand scrollbar used
 * across list/grid pages (users, blogs, workout templates, diet
 * templates). Keeps the page header/toolbar fixed while the list
 * scrolls inside. Pass `className` with a `max-h-...` utility to
 * override the default viewport-relative height.
 */
const ScrollableArea = forwardRef<HTMLDivElement, ScrollableAreaProps>(
  ({ children, className, onReachEnd }, ref) => {
    const handleScroll = useCallback(
      (event: React.UIEvent<HTMLDivElement>) => {
        if (!onReachEnd) return;
        const el = event.currentTarget;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceFromBottom <= REACH_END_THRESHOLD_PX) onReachEnd();
      },
      [onReachEnd]
    );

    return (
      <div
        ref={ref}
        onScroll={onReachEnd ? handleScroll : undefined}
        className={cn(DEFAULT_MAX_HEIGHT, SCROLLBAR_CLASSES, className)}
      >
        {children}
      </div>
    );
  }
);

ScrollableArea.displayName = "ScrollableArea";

export default ScrollableArea;
