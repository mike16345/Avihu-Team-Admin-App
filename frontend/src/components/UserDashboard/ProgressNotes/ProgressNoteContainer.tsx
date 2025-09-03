import Note from "./Note";
import AddButton from "@/components/ui/buttons/AddButton";
import useProgressNoteQuery from "@/hooks/queries/progressNote/useProgressNoteQuery";
import { useParams } from "react-router-dom";
import ProgressSheet from "./ProgressSheet";
import { useProgressNoteContext } from "@/context/useProgressNoteContext";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";

const ProgressNoteContainer = () => {
  const { id } = useParams();
  const { setOpenProgressSheeet } = useProgressNoteContext();
  const { data: progressNoteRes, isError, isLoading } = useProgressNoteQuery(id);

  if (isLoading) return <Loader size="medium" />;
  if (isError) return <ErrorPage />;

  return (
    <>
      <div className="max-h-[55vh] overflow-y-auto space-y-5 p-2" dir="rtl">
        {progressNoteRes?.data.progressNotes.length !== 0 &&
          progressNoteRes?.data.progressNotes.map((note, i) => (
            <Note key={i} progressNote={note} />
          ))}

        {progressNoteRes?.data.progressNotes.length == 0 && (
          <h1 className="text-center">לא נמצאו פתקים למשתמש!</h1>
        )}
      </div>

      <AddButton onClick={() => setOpenProgressSheeet(true)} tip="הוסף פתק" />
      <ProgressSheet />
    </>
  );
};

export default ProgressNoteContainer;
