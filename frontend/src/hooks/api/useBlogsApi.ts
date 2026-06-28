import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IBlog, IBlogResponse } from "@/interfaces/IBlog";
import { PaginationParams, PaginationResult } from "@/interfaces/interfaces";
import { ApiResponse } from "@/types/types";
import { useImageApi } from "./useImageApi";

const BLOGS_API_URL = "blogs";

export type BlogListFilters = {
  query?: string;
  groups?: string[];
};

type BlogPaginationParams = PaginationParams & BlogListFilters;

const getBlogQueryParam = ({ query, groups }: BlogListFilters) => {
  const filters: Record<string, unknown> = {};
  const trimmedQuery = query?.trim();
  const selectedGroups = groups?.filter(Boolean) ?? [];

  if (trimmedQuery) filters.search = trimmedQuery;

  if (selectedGroups.length === 1) {
    filters.group = selectedGroups[0];
  } else if (selectedGroups.length > 1) {
    filters.group = { $in: selectedGroups };
  }

  return Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined;
};

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

  const deleteBlog = async (blog: IBlogResponse) => {
    if (blog.imageUrl) {
      await handleDeletePhoto(`images/` + blog.imageUrl);
    }

    return await deleteItem<ApiResponse<IBlogResponse>>(`${BLOGS_API_URL}/one?id=${blog._id}`);
  };

  const handleUploadBlog = async (blog: IBlog, image?: string) => {
    try {
      if (image) {
        blog.imageUrl = await handleUploadImageToS3(blog.title, image);
      }

      return await sendData<ApiResponse<IBlogResponse>>(BLOGS_API_URL, blog);
    } catch (error) {
      throw error;
    }
  };

  const getPaginatedPosts = async (pagination: BlogPaginationParams) => {
    const response = await fetchData<ApiResponse<PaginationResult<IBlogResponse>>>(
      `${BLOGS_API_URL}/paginate`,
      {
        _page: pagination.page,
        _limit: pagination.limit,
        query: getBlogQueryParam(pagination),
      }
    );

    return response.data;
  };

  return { handleUploadBlog, deleteBlog, getBlogById, updateBlog, getPaginatedPosts };
};
