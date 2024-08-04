import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axiosInstance from "@/config/apiConfig";
import { useWeighInPhotosApi } from "@/hooks/useWeighInPhotosApi";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export interface Photo {
  id: string;
  filename: string;
  contentType: string;
  data?: string; // Base64 encoded image data
}

export const WeightProgressionPhotos = () => {
  const { id } = useParams();
  const { getWeighInPhotosById } = useWeighInPhotosApi();

  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!id) return;
      try {
        const response = await getWeighInPhotosById(id);

        setPhotos(response.data);
      } catch (err) {
      } finally {
      }
    };

    fetchPhotos();
  }, []);

  return (
    <Card className="flex flex-col gap-2">
      <CardHeader className="text-lg font-semibold">
        <CardTitle>תמונות</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 rounded ">
        {photos.map((photo) => (
          <Card key={"jk"}>
            <img
              src={`data:${photo.contentType};base64,${photo.data}`}
              alt={photo.filename}
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
