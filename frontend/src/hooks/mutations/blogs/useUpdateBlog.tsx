import { useBlogsApi } from "@/hooks/api/useBlogsApi";
import { IBlogResponse, IBlog } from "@/interfaces/IBlog";
import { IMutationProps } from "@/interfaces/interfaces";
import { useMutation } from "@tanstack/react-query";

const useUpdateBlog = ({ onSuccess, onError }: IMutationProps<IBlogResponse>) => {
  const { updateBlog } = useBlogsApi();

  return useMutation({
    mutationFn: ({
      blogId,
      blog,
      imageToUpload,
      imageToDelete,
    }: {
      blogId: string;
      blog: IBlog;
      imageToUpload?: string;
      imageToDelete?: string;
    }) => updateBlog(blogId, blog, imageToUpload, imageToDelete),
    onSuccess,
    onError,
  });
};

export default useUpdateBlog;
