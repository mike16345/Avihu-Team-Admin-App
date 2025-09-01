import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/types/types";
import { QueryKeys } from "@/enums/QueryKeys";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { useProgressNotesApi } from "@/hooks/api/useProgressNotesApi";
import { IProgressNotes } from "@/interfaces/IProgress";

const useProgressNoteQuery = (userId: string) => {
  const { getProgressNotesByUserId } = useProgressNotesApi();

  return useQuery<any, any, ApiResponse<IProgressNotes[]>, any>({
    queryFn: () => getProgressNotesByUserId(userId),
    queryKey: [QueryKeys.USER_PROGRESS_NOTES],
    staleTime: FULL_DAY_STALE_TIME / 2,
    enabled: !!userId,
  });
};

export default useProgressNoteQuery;
