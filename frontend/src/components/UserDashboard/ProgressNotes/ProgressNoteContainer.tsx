import Note from "./Note";
import AddButton from "@/components/ui/buttons/AddButton";
import useProgressNoteQuery from "@/hooks/queries/progressNote/useProgressNoteQuery";
import { useParams } from "react-router-dom";
import ProgressSheet from "./ProgressSheet";
import { useProgressNoteContext } from "@/context/useProgressNoteContext";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { useMemo } from "react";

const ProgressNoteContainer = () => {
  const { id } = useParams();
  const { setOpenProgressSheet } = useProgressNoteContext();
  const { data: progressNoteRes, isError, isLoading, error } = useProgressNoteQuery(id);

  const notes = useMemo(() => {
    if (!progressNoteRes?.data.progressNotes.length) return [];

    return progressNoteRes.data.progressNotes;
  }, [progressNoteRes?.data]);

  if (isLoading) return <Loader size="medium" />;
  if (isError && error?.status !== 404) return <ErrorPage />;

  return (
    <>
      <div className="max-h-[55vh] overflow-y-auto space-y-5 p-2" dir="rtl">
        {notes.map((note) => (
          <Note key={note._id} progressNote={note} />
        ))}

        {notes.length == 0 && <h1 className="text-center">לא נמצאו פתקים למשתמש!</h1>}
      </div>

      <AddButton onClick={() => setOpenProgressSheet(true)} tip="הוסף פתק" />
      <ProgressSheet />
    </>
  );
};

export default ProgressNoteContainer;
