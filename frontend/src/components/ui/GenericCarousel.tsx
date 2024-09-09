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
    <Carousel dir="ltr" opts={{ align: `end` }}>
      <CarouselContent>
        {carouselItems.map((item, i) => (
          <CarouselItem key={i}>{item}</CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default GenericCarousel;
