import { deleteItem, fetchData } from "@/API/api";
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

  return {
    getWeighInPhotosByUserId,
    deleteWeighInPhotos,
    getUserImageUrls,
    deleteWeighInPhotosByUserId,
    getWeighInPhotosById,
  };
};
