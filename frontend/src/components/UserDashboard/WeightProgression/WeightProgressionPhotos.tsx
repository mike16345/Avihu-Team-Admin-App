import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useWeighInPhotosApi } from "@/hooks/api/useWeighInPhotosApi";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FullscreenImage } from "./FullscreenImage";

interface WeightProgressionPhotosProps {
  onClickPhoto?: (photo: string) => void;
}

type SelectedFullscreenImage = {
  photo: string;
  index: number;
};

export const WeightProgressionPhotos: FC<WeightProgressionPhotosProps> = ({ onClickPhoto }) => {
  const { id } = useParams();
  const { getUserImageUrls } = useWeighInPhotosApi();

  const [photos, setPhotos] = useState<string[]>([]);
  const [fullScreenImage, setFullScreenImage] = useState<SelectedFullscreenImage | null>(null);

  const maxPhotosIndex = photos.length - 1;
  const minPhotosIndex = 0;

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowRight":
        handleClickArrowKey(e.key);
        break;
      case "Escape":
        handleCloseFullscreenImage();
        break;
      default:
        break;
    }
  };

  const handleClickArrowKey = (key: string) => {
    if (!fullScreenImage) return;
    const currIndex = fullScreenImage.index;

    if ((key === "ArrowLeft" || key === "previous") && currIndex > minPhotosIndex) {
      setFullScreenImage({ photo: photos[currIndex - 1], index: currIndex - 1 });
    } else if ((key === "ArrowRight" || key === "next") && currIndex < maxPhotosIndex) {
      setFullScreenImage({ photo: photos[currIndex + 1], index: currIndex + 1 });
    }
  };

  const handleClickPhoto = (photo: string, index: number) => {
    if (onClickPhoto) onClickPhoto(photo);
    setFullScreenImage({ photo, index });
  };

  const handleCloseFullscreenImage = () => {
    setFullScreenImage(null);
  };

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!id) return;

      try {
        const userImageUrls = await getUserImageUrls(id);
        setPhotos(userImageUrls.data);
      } catch (error) {
        console.error("Failed to load images:", error);
      }
    };

    fetchPhotos();
  }, []);

  useEffect(() => {
    if (fullScreenImage) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullScreenImage]);

  return (
    <>
      {photos.length > 0 ? (
        <Card className="flex flex-col gap-2">
          <CardHeader className="text-lg font-semibold">
            <CardTitle>תמונות</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2 rounded">
            {photos.map((photo, i) => (
              <Card
                onClick={() => handleClickPhoto(photo, i)}
                className="w-[200px] cursor-pointer"
                key={i}
              >
                <img src={photo} alt={`Photo ${i + 1}`} />
              </Card>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="size-full items-center justify-center">
          <h1 className="text-center">אין תמונות</h1>
        </div>
      )}
      {fullScreenImage && (
        <FullscreenImage
          img={fullScreenImage.photo}
          onClose={handleCloseFullscreenImage}
          onArrowPress={(direction) => handleClickArrowKey(direction)}
          isNext={fullScreenImage.index < maxPhotosIndex}
          isPrevious={fullScreenImage.index > minPhotosIndex}
        />
      )}
    </>
  );
};
