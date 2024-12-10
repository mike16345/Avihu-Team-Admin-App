import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IBlog, IBlogResponse } from "@/interfaces/IBlog";
import { PaginationParams, PaginationResult } from "@/interfaces/interfaces";
import { ApiResponse } from "@/types/types";
import { v4 as uuidv4 } from "uuid";

const BLOGS_API_URL = "blogs";

const fetchSignedUrl = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "X-Api-Key": import.meta.env.VITE_API_AUTH_TOKEN },
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching signed URL:", error);
    throw new Error("Failed to fetch signed URL.");
  }
};

const handleDeletePhoto = async (photo?: string) => {
  if (!photo) return Promise.reject("no photo available");

  return await deleteItem("s3/photos/one", undefined, undefined, {
    photoId: photo,
  });
};

export const useBlogsApi = () => {
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

  const handleUploadImageToS3 = async (name: string, image: string) => {
    const api = import.meta.env.VITE_SERVER;
    const today = new Date().toISOString().split("T")[0];
    const imageName = name + "-image";
    const id = uuidv4();
    const url = `${api}/signedUrl?userId=${id}&date=${today}&imageName=${imageName}`;
    const urlToStore = `${id}/${today}/${imageName}`;

    const signedUrl = await fetchSignedUrl(url);
    await uploadImageToS3(image, signedUrl);

    return urlToStore;
  };

  const handleUploadBlog = async (blog: IBlog, image?: string) => {
    try {
      if (image) {
        blog.imageUrl = await handleUploadImageToS3(blog.title, image);
      }

      const res = await sendData<ApiResponse<{}>>(BLOGS_API_URL, blog);

      console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  const getPaginatedPosts = async (pagination: PaginationParams) => {
    const response = await fetchData<ApiResponse<PaginationResult<IBlogResponse>>>(
      `${BLOGS_API_URL}/paginate?_page=${pagination.page}&_limit=${pagination.limit}`
    );

    return response.data;
  };

  const uploadImageToS3 = async (fileUri: string, presignedUrl: string) => {
    try {
      const fileResponse = await fetch(fileUri);
      const fileBlob = await fileResponse.blob();
      const response = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": fileBlob.type || "image/jpeg",
        },
        body: fileBlob,
      });

      if (response.status === 200) {
        console.log("uploaded image");
      } else {
        console.error("Failed to upload image:", response.status, await response.text());
      }
    } catch (error) {
      console.error(error);
    }
  };

  return { handleUploadBlog, deleteBlog, getBlogById, updateBlog, getPaginatedPosts };
};
