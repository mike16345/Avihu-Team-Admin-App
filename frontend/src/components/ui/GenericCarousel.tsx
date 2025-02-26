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
}

const GenericCarousel: React.FC<GenericCarouselProps> = ({ carouselItems }) => {
  return (
    <Carousel dir="ltr" className="h-full shadow-md">
      <CarouselContent className="  h-[77vh]">
        {carouselItems.map((item, i) => (
          <CarouselItem className="h-full" key={i}>
            {item}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default GenericCarousel;
