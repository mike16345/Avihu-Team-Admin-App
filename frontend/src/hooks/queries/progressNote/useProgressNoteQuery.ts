import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/types/types";
import { QueryKeys } from "@/enums/QueryKeys";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { useProgressNotesApi } from "@/hooks/api/useProgressNotesApi";
import { IProgressNotes } from "@/interfaces/IProgress";
import { createRetryFunction } from "@/lib/utils";

const useProgressNoteQuery = (userId?: string) => {
  const { getProgressNotesByUserId } = useProgressNotesApi();

  return useQuery<any, any, ApiResponse<IProgressNotes>, any>({
    queryFn: () => getProgressNotesByUserId(userId!),
    queryKey: [QueryKeys.USER_PROGRESS_NOTES, userId],
    staleTime: FULL_DAY_STALE_TIME / 2,
    retry: createRetryFunction(404, 3),
    enabled: !!userId,
  });
};

export default useProgressNoteQuery;
