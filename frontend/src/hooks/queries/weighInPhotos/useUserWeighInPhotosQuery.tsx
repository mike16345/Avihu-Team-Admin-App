import { FULL_DAY_STALE_TIME, MIN_STALE_TIME } from "@/constants/constants";
import { useWeighInPhotosApi } from "@/hooks/api/useWeighInPhotosApi";
import { buildPhotoUrls } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const useUserWeighInPhotosQuery = (id?: string) => {
  const { getUserImageUrls } = useWeighInPhotosApi();

  const handleGetPhotos = async () => {
    try {
      const userImageUrls = await getUserImageUrls(id!);
      const urls = buildPhotoUrls(userImageUrls.data);

      return urls;
    } catch (error) {
      console.error("Failed to load images:", error);
      return [];
    }
  };

  return useQuery({
    queryKey: [id + "-photos"],
    queryFn: handleGetPhotos,
    enabled: !!id,
    staleTime: FULL_DAY_STALE_TIME / 2,
  });
};

export default useUserWeighInPhotosQuery;
