import { useBlogsApi } from "@/hooks/api/useBlogsApi";
import { IBlogResponse } from "@/interfaces/IBlog";
import { IMutationProps } from "@/interfaces/interfaces";
import { ApiResponse } from "@/types/types";
import { useMutation } from "@tanstack/react-query";

const useDeleteBlog = ({ onSuccess, onError }: IMutationProps<ApiResponse<IBlogResponse>>) => {
  const { deleteBlog } = useBlogsApi();

  return useMutation({
    mutationFn: (blogToDelete: IBlogResponse) => deleteBlog(blogToDelete),
    onSuccess,
    onError,
  });
};

export default useDeleteBlog;
