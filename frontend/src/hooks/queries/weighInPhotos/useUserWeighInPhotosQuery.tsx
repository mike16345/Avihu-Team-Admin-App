import { useWeighInPhotosApi } from "@/hooks/api/useWeighInPhotosApi";
import { buildPhotoUrls } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const PHOTOS_STALE_MS = 60 * 1000;

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
    staleTime: PHOTOS_STALE_MS,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
};

export default useUserWeighInPhotosQuery;
