import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { useBlogsApi } from "@/hooks/api/useBlogsApi";
import { IBlog } from "@/interfaces/IBlog";
import { PaginationResult } from "@/interfaces/interfaces";
import { useInfiniteQuery } from "@tanstack/react-query";

const useBlogsQuery = () => {
  const { getPaginatedPosts } = useBlogsApi();

  return useInfiniteQuery({
    queryKey: [QueryKeys.BLOGS],
    initialPageParam: { page: 1, limit: 10 },
    queryFn: ({ pageParam = { page: 1, limit: 10 } }) => getPaginatedPosts(pageParam),
    getNextPageParam: (lastPage: PaginationResult<IBlog>) => {
      return lastPage.hasNextPage ? { page: lastPage.currentPage + 1, limit: 10 } : undefined;
    },
    staleTime: FULL_DAY_STALE_TIME,
  });
};

export default useBlogsQuery;
