import { sendData } from "@/API/api";
import { IBlog } from "@/interfaces/IBlog";
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

export const useBlogsApi = () => {
  const handleUploadBlog = async (blog: IBlog, image?: string) => {
    try {
      const api = import.meta.env.VITE_SERVER;
      const today = new Date().toISOString().split("T")[0];
      const imageName = blog.title + "-image";
      const id = uuidv4();
      const url = `${api}/signedUrl?userId=${id}&date=${today}&imageName=${imageName}`;
      const urlToStore = `${id}/${today}/${imageName}`;

      if (image) {
        const signedUrl = await fetchSignedUrl(url);
        await uploadImageToS3(image, signedUrl);

        blog.imageUrl = urlToStore;
      }

      const res = await sendData<ApiResponse<{}>>(BLOGS_API_URL, blog);

      console.log(res);
    } catch (error) {
      console.error(error);
    }
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

  return { handleUploadBlog };
};
