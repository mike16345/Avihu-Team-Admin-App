import { ProgressNoteContextProvider } from "@/context/useProgressNoteContext";
import ProgressNoteContainer from "./ProgressNoteContainer";

const ProgressNoteWrapper = () => {
  return (
    <ProgressNoteContextProvider>
      <ProgressNoteContainer />
    </ProgressNoteContextProvider>
  );
};

export default ProgressNoteWrapper;
