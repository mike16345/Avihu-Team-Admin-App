import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface GenericCarouselProps {
  carouselItems: any[];
  hideControls?: boolean;
}

const GenericCarousel: React.FC<GenericCarouselProps> = ({
  carouselItems,
  hideControls = false,
}) => {
  return (
    <Carousel dir="ltr" className="shadow-md flex-1">
      <CarouselContent>
        {carouselItems.map((item, i) => (
          <CarouselItem key={i}>{item}</CarouselItem>
        ))}
      </CarouselContent>

      {!hideControls && (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      )}
    </Carousel>
  );
};

export default GenericCarousel;
