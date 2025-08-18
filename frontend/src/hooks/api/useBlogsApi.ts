import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IBlog, IBlogResponse } from "@/interfaces/IBlog";
import { PaginationParams, PaginationResult } from "@/interfaces/interfaces";
import { ApiResponse } from "@/types/types";
import { useImageApi } from "./useImageApi";

const BLOGS_API_URL = "blogs";

export const useBlogsApi = () => {
  const { handleDeletePhoto, handleUploadImageToS3 } = useImageApi();

  const getBlogById = async (blogId: string) => {
    const response = await fetchData<ApiResponse<IBlogResponse>>(
      `${BLOGS_API_URL}/one?id=${blogId}`
    );

    return response.data;
  };

  const updateBlog = async (
    blogId: string,
    blog: IBlog,
    imageToUpload?: string,
    imageToDelete?: string
  ) => {
    try {
      await handleDeletePhoto(`images/` + imageToDelete);

      if (imageToUpload && imageToUpload !== imageToDelete) {
        blog.imageUrl = await handleUploadImageToS3(blog.title, imageToUpload);
      }

      if (imageToDelete && !imageToUpload) {
        blog.imageUrl = "";
      }

      const res = await updateItem<ApiResponse<IBlogResponse>>(`${BLOGS_API_URL}/one`, blog, null, {
        id: blogId,
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteBlog = async (blog: IBlog & { _id: string }) => {
    await handleDeletePhoto(`images/` + blog.imageUrl);

    return await deleteItem(`${BLOGS_API_URL}/one?id=${blog._id}`);
  };

  const handleUploadBlog = async (blog: IBlog, image?: string) => {
    try {
      if (image) {
        blog.imageUrl = await handleUploadImageToS3(blog.title, image);
      }

      await sendData<ApiResponse<{}>>(BLOGS_API_URL, blog);
    } catch (error) {
      throw error;
    }
  };

  const getPaginatedPosts = async (pagination: PaginationParams) => {
    const response = await fetchData<ApiResponse<PaginationResult<IBlogResponse>>>(
      `${BLOGS_API_URL}/paginate?_page=${pagination.page}&_limit=${pagination.limit}`
    );

    return response.data;
  };

  return { handleUploadBlog, deleteBlog, getBlogById, updateBlog, getPaginatedPosts };
};
