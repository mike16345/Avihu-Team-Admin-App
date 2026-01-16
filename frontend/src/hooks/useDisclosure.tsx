import { useCallback, useMemo, useState } from "react";

type UseDisclosureOptions = {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  clearPayloadOnClose?: boolean; // default true
};

export function useDisclosure<TPayload = undefined>(options: UseDisclosureOptions = {}) {
  const { defaultOpen = false, onOpenChange, clearPayloadOnClose = true } = options;

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [payload, setPayload] = useState<TPayload | null>(null);

  const setOpen = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);

      if (!open && clearPayloadOnClose) {
        setPayload(null);
      }
    },
    [onOpenChange, clearPayloadOnClose]
  );

  const open = useCallback(() => setOpen(true), [setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!isOpen), [setOpen, isOpen]);

  const openWith = useCallback(
    (nextPayload: TPayload) => {
      setPayload(nextPayload);
      setOpen(true);
    },
    [setOpen]
  );

  const clearPayload = useCallback(() => setPayload(null), []);

  return useMemo(
    () => ({
      isOpen,
      payload,
      setOpen,
      open,
      close,
      toggle,
      openWith,
      setPayload,
      clearPayload,
      bind: {
        open: isOpen,
        onOpenChange: setOpen,
      },
    }),
    [isOpen, payload, setOpen, open, close, toggle, openWith, clearPayload]
  );
}
