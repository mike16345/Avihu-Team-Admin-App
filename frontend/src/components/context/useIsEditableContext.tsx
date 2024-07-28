import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface EditableContextProps {
  isEditable: boolean;
  setIsEditable: Dispatch<SetStateAction<boolean>>;
  toggleIsEditable: () => void;
}

const EditableContext = createContext<EditableContextProps | null>(null);

export const EditableContextProvider: React.FC<{ children: ReactNode; isEdit?: boolean }> = ({
  children,
  isEdit = false,
}) => {
  const [isEditable, setIsEditable] = useState(isEdit);

  const toggleIsEditable = () => {
    setIsEditable((prev) => !prev);
  };

  return (
    <EditableContext.Provider value={{ isEditable, toggleIsEditable, setIsEditable }}>
      {children}
    </EditableContext.Provider>
  );
};

export const useIsEditableContext = () => {
  const context = useContext(EditableContext);

  if (!context) {
    throw new Error("useEditable must be used within an EditableContextProvider");
  }

  return context;
};
