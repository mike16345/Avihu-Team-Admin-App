import { useEffect } from "react";
import { useDirtyFormContext } from "@/context/useFormContext";

export const useUnsavedChangesWarning = () => {
  const { isDirty } = useDirtyFormContext();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log("is dirty", isDirty);
      if (!isDirty) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);
};
