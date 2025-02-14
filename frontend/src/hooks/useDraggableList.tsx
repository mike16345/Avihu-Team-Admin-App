import { useEffect, useRef, useState } from "react";

export function useDragToSwap<T>(items: T[], onSwap: (updatedItems: T[]) => void) {
  const fromIndex = useRef<number | null>(null);
  const toIndex = useRef<number | null>(null);
  const latestItems = useRef(items); // Store the latest reference to avoid stale closures
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<number | null>(null);

  const scrollThreshold = 200; // Pixels from edge to trigger scrolling
  const scrollSpeed = 15; // Pixels per frame

  useEffect(() => {
    latestItems.current = items; // Keep the latest items reference updated
  }, [items]);

  const handleDragStart = (event: React.DragEvent, index: number) => {
    event.dataTransfer.effectAllowed = "move";
    fromIndex.current = index;
    setIsDragging(true);
  };

  const handleDragEnter = (index: number) => {
    if (index !== fromIndex.current) {
      toIndex.current = index;
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    stopScrolling();

    if (
      fromIndex.current !== null &&
      toIndex.current !== null &&
      fromIndex.current !== toIndex.current
    ) {
      const newItems = [...latestItems.current]; // Use latest reference
      [newItems[fromIndex.current], newItems[toIndex.current]] = [
        newItems[toIndex.current],
        newItems[fromIndex.current],
      ];
      onSwap(newItems);
    }

    fromIndex.current = null;
    toIndex.current = null;
  };

  const stopScrolling = () => {
    if (scrollRef.current) {
      cancelAnimationFrame(scrollRef.current);
      scrollRef.current = null;
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();

    const { clientY } = event;
    const { innerHeight, scrollY } = window;

    stopScrolling(); // Stop previous scrolling before starting a new one

    const scrollUp = clientY < scrollThreshold && scrollY > 0;
    const scrollDown =
      clientY > innerHeight - scrollThreshold &&
      scrollY < document.documentElement.scrollHeight - innerHeight;

    if (scrollUp || scrollDown) {
      const scrollStep = scrollUp ? -scrollSpeed : scrollSpeed;

      const scroll = () => {
        if (scrollUp && scrollY <= 0) return stopScrolling();
        if (scrollDown && scrollY >= document.documentElement.scrollHeight - innerHeight)
          return stopScrolling();

        window.scrollBy(0, scrollStep);
        scrollRef.current = requestAnimationFrame(scroll);
      };
      scrollRef.current = requestAnimationFrame(scroll);
    }
  };

  return {
    isDragging,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    handleDragOver,
  };
}
