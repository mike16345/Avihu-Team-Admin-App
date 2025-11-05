import { deleteItem } from "@/API/api";
import { v4 as uuidv4 } from "uuid";

export const useImageApi = () => {
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

  const handleDeleteManyPhotos = async (photos?: string[]) => {
    return await deleteItem("s3/photos/many", undefined, undefined, {
      photoIds: photos,
    });
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

      if (response.status !== 200) {
        console.error("Failed to upload image:", response.status, await response.text());
        throw new Error(`Failed to upload image: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
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

  return { fetchSignedUrl, handleDeleteManyPhotos, handleDeletePhoto, handleUploadImageToS3 };
};
