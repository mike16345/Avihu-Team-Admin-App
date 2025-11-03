import { useBlogsApi } from "@/hooks/api/useBlogsApi";
import { IBlog, IBlogResponse } from "@/interfaces/IBlog";
import { IMutationProps } from "@/interfaces/interfaces";
import { ApiResponse } from "@/types/types";
import { useMutation } from "@tanstack/react-query";

const useAddBlog = ({ onSuccess, onError }: IMutationProps<ApiResponse<IBlogResponse>>) => {
  const { handleUploadBlog } = useBlogsApi();

  return useMutation({
    mutationFn: ({ blog, image }: { blog: IBlog; image?: string }) => handleUploadBlog(blog, image),
    onSuccess,
    onError,
  });
};

export default useAddBlog;
