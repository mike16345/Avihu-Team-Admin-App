import { useProgressNotesApi } from "@/hooks/api/useProgressNotesApi";
import { IPostProgressNoteObject } from "@/interfaces/IProgress";
import { useMutation } from "@tanstack/react-query";
import { onError, onSuccess } from "@/lib/query";
import { QueryKeys } from "@/enums/QueryKeys";

const useAddProgressNote = (noteToPost: IPostProgressNoteObject) => {
  const { addProgressNote } = useProgressNotesApi();

  return useMutation({
    mutationFn: () => addProgressNote(noteToPost),
    onSuccess: () =>
      onSuccess("פתק נשמר בהצלחה!", [QueryKeys.USER_PROGRESS_NOTES + noteToPost.userId]),
    onError: onError,
  });
};

export default useAddProgressNote;
