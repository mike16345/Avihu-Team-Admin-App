import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
        console.error(err);
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
        {photos.map((photo, i) => (
          <Card className="w-[200px]" key={i}>
            <img src={`data:${photo.contentType};base64,${photo.data}`} alt={photo.filename} />
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
