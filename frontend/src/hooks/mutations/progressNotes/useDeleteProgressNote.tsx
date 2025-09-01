import { useProgressNotesApi } from "@/hooks/api/useProgressNotesApi";
import { useMutation } from "@tanstack/react-query";
import { onError, onSuccess } from "@/lib/query";
import { QueryKeys } from "@/enums/QueryKeys";

const useDeleteProgressNote = (userId: string, noteId: string) => {
  const { deleteProgressNote } = useProgressNotesApi();

  return useMutation({
    mutationFn: () => deleteProgressNote(userId, noteId),
    onSuccess: () => onSuccess("פתק נמחק בהצלחה!", [QueryKeys.USER_PROGRESS_NOTES + userId]),
    onError: onError,
  });
};

export default useDeleteProgressNote;
