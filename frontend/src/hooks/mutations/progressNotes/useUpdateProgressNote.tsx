import { useProgressNotesApi } from "@/hooks/api/useProgressNotesApi";
import { useMutation } from "@tanstack/react-query";
import { onError, onSuccess } from "@/lib/query";
import { QueryKeys } from "@/enums/QueryKeys";
import { IPutProgressNoteObject } from "@/interfaces/IProgress";
import { useProgressNoteContext } from "@/context/useProgressNoteContext";

const useUpdateProgressNote = (userId: string) => {
  const { updateProgressNote } = useProgressNotesApi();
  const { setOpenProgressSheet } = useProgressNoteContext();

  return useMutation({
    mutationFn: (noteToUpdate: IPutProgressNoteObject) => updateProgressNote(noteToUpdate),
    onSuccess: () => {
      onSuccess("פתק עודכן בהצלחה!", [QueryKeys.USER_PROGRESS_NOTES + userId]);
      setOpenProgressSheet(false);
    },
    onError: onError,
  });
};

export default useUpdateProgressNote;
