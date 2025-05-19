import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { useBlogsApi } from "@/hooks/api/useBlogsApi";
import { useQuery } from "@tanstack/react-query";

const useBlogQuery = (id: string = "undefined") => {
  const { getBlogById } = useBlogsApi();

  return useQuery({
    queryKey: [QueryKeys.BLOGS, id],
    queryFn: () => getBlogById(id),
    enabled: id !== "undefined",
    staleTime: FULL_DAY_STALE_TIME,
  });
};

export default useBlogQuery;
