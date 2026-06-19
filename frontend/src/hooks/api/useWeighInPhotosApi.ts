import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { Photo } from "@/components/UserDashboard/WeightProgression/WeightProgressionPhotos";
import axiosInstance from "@/config/apiConfig";
import { ApiResponse } from "@/types/types";

const WEIGH_IN_PHOTOS_ENDPOINT = "weighIns/photos/";
const USER_IMAGE_URLS_ENDPOINT = "userImageUrls";

export const useWeighInPhotosApi = () => {
  const deleteWeighInPhotos = (userID: string) => deleteItem(WEIGH_IN_PHOTOS_ENDPOINT, userID);

  const deleteWeighInPhotosByUserId = (userID: string) =>
    deleteItem(WEIGH_IN_PHOTOS_ENDPOINT + "user", userID);

  const getWeighInPhotosByUserId = (userID: string) =>
    fetchData<Photo[]>(`${WEIGH_IN_PHOTOS_ENDPOINT}/${userID}`);

  const getWeighInPhotosById = (id: string) =>
    axiosInstance.get<Photo[]>(WEIGH_IN_PHOTOS_ENDPOINT + id);

  const getUserImageUrls = (userId: string) => {
    return fetchData<ApiResponse<string[]>>(
      USER_IMAGE_URLS_ENDPOINT + "/user?userId=" + userId
    ).catch((error) => {
      if (error.status == 404) return { data: [] };
      else throw error;
    });
  };

  const addUserImageUrl = (userId: string, imageUrl: string) =>
    sendData<ApiResponse<string[]>>(USER_IMAGE_URLS_ENDPOINT, {
      userId,
      imageUrl,
    });

  const replaceUserImageUrl = (userId: string, oldImageUrl: string, newImageUrl: string) =>
    updateItem<ApiResponse<string[]>>(USER_IMAGE_URLS_ENDPOINT + "/one", {
      userId,
      oldImageUrl,
      newImageUrl,
    });

  const deleteUserImage = (userId: string, photoId: string, imageUrl: string) =>
    deleteItem<ApiResponse<string[]>>("s3/photos/one", undefined, undefined, {
      userId,
      photoId,
      imageUrl,
    });

  const deletePhotoObject = (photoId: string) =>
    deleteItem<ApiResponse<string>>("s3/photos/one", undefined, undefined, {
      photoId,
    });

  return {
    addUserImageUrl,
    deletePhotoObject,
    deleteUserImage,
    getWeighInPhotosByUserId,
    deleteWeighInPhotos,
    getUserImageUrls,
    deleteWeighInPhotosByUserId,
    getWeighInPhotosById,
    replaceUserImageUrl,
  };
};
