import { IProgressNote } from "@/interfaces/IProgress";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface ProgressNoteContextProps {
  progressNote: IProgressNote | null;
  setProgressNote: Dispatch<SetStateAction<IProgressNote | null>>;
  openProgressSheet: boolean;
  setOpenProgressSheeet: Dispatch<SetStateAction<boolean>>;
  handleProgressNoteEdit: (note: IProgressNote) => void;
  handleCloseProgressSheet: () => void;
}

const ProgressNoteContext = createContext<ProgressNoteContextProps | null>(null);

export const ProgressNoteContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [progressNote, setProgressNote] = useState<IProgressNote | null>(null);
  const [openProgressSheet, setOpenProgressSheeet] = useState(false);

  const handleProgressNoteEdit = (note: IProgressNote) => {
    setProgressNote(note);
    setOpenProgressSheeet(true);
  };

  const handleCloseProgressSheet = () => {
    setProgressNote(null);
    setOpenProgressSheeet(false);
  };

  return (
    <ProgressNoteContext.Provider
      value={{
        progressNote,
        setProgressNote,
        setOpenProgressSheeet,
        openProgressSheet,
        handleCloseProgressSheet,
        handleProgressNoteEdit,
      }}
    >
      {children}
    </ProgressNoteContext.Provider>
  );
};

export const useProgressNoteContext = () => {
  const context = useContext(ProgressNoteContext);

  if (!context) {
    throw new Error("useProgressNoteontext must be used within an ProgressNoteContextProvider");
  }

  return context;
};
