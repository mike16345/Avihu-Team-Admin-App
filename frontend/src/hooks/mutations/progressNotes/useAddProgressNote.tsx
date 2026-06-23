import { useProgressNotesApi } from "@/hooks/api/useProgressNotesApi";
import { IPostProgressNoteObject } from "@/interfaces/IProgress";
import { useMutation } from "@tanstack/react-query";
import { onError, onSuccess } from "@/lib/query";
import { QueryKeys } from "@/enums/QueryKeys";
import { useProgressNoteContext } from "@/context/useProgressNoteContext";

const useAddProgressNote = (userId: string) => {
  const { addProgressNote } = useProgressNotesApi();
  const { handleCloseProgressSheet } = useProgressNoteContext();

  return useMutation({
    mutationFn: (noteToPost: IPostProgressNoteObject) => addProgressNote(noteToPost),
    onSuccess: () => {
      onSuccess("פתק נשמר בהצלחה!", [QueryKeys.USER_PROGRESS_NOTES + userId]);
      handleCloseProgressSheet();
    },
    onError: onError,
  });
};

export default useAddProgressNote;
