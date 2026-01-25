import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FullscreenImage } from "./FullscreenImage";
import Loader from "@/components/ui/Loader";
import useUserWeighInPhotosQuery from "@/hooks/queries/weighInPhotos/useUserWeighInPhotosQuery";

interface WeightProgressionPhotosProps {
  onClickPhoto?: (photo: string) => void;
}

type SelectedFullscreenImage = {
  photo: string;
  index: number;
};

export const WeightProgressionPhotos: FC<WeightProgressionPhotosProps> = ({ onClickPhoto }) => {
  const { id } = useParams();
  const { data: photos = [], isLoading } = useUserWeighInPhotosQuery(id);

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
    if (fullScreenImage) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullScreenImage]);

  if (isLoading) return <Loader size="large" />;

  return (
    <>
      {photos.length > 0 && (
        <Card className="flex flex-col gap-4">
          <CardHeader className="text-lg font-semibold">
            <CardTitle>תמונות</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleClickPhoto(photo, i)}
                className="group relative w-full overflow-hidden rounded-lg border border-border/60 bg-muted/20 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="aspect-[3/4] w-full">
                  <img
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    src={photo}
                    alt={`Photo ${i + 1}`}
                    loading="lazy"
                  />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
      {photos.length == 0 && (
        <div className="flex size-full items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 py-10">
          <h1 className="text-center text-sm text-muted-foreground">אין תמונות מעקב</h1>
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
