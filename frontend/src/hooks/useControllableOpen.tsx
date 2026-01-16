import { useCallback, useMemo, useState } from "react";

type UseControllableOpenOptions = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function useControllableOpen(options: UseControllableOpenOptions = {}) {
  const { open, defaultOpen = false, onOpenChange } = options;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;

  const isOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  return useMemo(
    () => ({
      isOpen,
      setOpen,
    }),
    [isOpen, setOpen]
  );
}
