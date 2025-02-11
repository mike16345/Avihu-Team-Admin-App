import { createContext, useContext, useState, ReactNode } from "react";

interface FormContextType {
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  errors?: any;
  setErrors: (errors: any) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const DirtyFormProvider = ({ children }: { children: ReactNode }) => {
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState();

  return (
    <FormContext.Provider value={{ isDirty, errors, setErrors, setIsDirty }}>
      {children}
    </FormContext.Provider>
  );
};

export const useDirtyFormContext = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};
