import { createContext, useContext, useState, ReactNode } from "react";

interface FormContextType {
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const DirtyFormProvider = ({ children }: { children: ReactNode }) => {
  const [isDirty, setIsDirty] = useState(false);

  return <FormContext.Provider value={{ isDirty, setIsDirty }}>{children}</FormContext.Provider>;
};

export const useDirtyFormContext = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};
