import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import CarouselDots from "./CarouselDots";

interface GenericCarouselProps {
  carouselItems: any[];
  hideControls?: boolean;
  hideDots?: boolean;
  dotPlacement?: "Top" | "Bottom";
}

const GenericCarousel: React.FC<GenericCarouselProps> = ({
  carouselItems,
  hideControls = false,
  hideDots = false,
  dotPlacement = "Bottom",
}) => {
  const [api, setApi] = useState<CarouselApi | undefined>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const displayDotsAbove = !hideDots && dotPlacement == "Top";
  const displayDotsBelow = !hideDots && dotPlacement == "Bottom";

  useEffect(() => {
    if (!api || hideDots) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <div className="space-y-4">
      {displayDotsAbove && (
        <CarouselDots
          windowCount={count}
          currentWindow={current}
          onDotClick={(index) => api?.scrollTo(index)}
        />
      )}

      <Carousel dir="ltr" className="flex-1" setApi={setApi} opts={{ loop: false }}>
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

      {displayDotsBelow && (
        <CarouselDots
          windowCount={count}
          currentWindow={current}
          onDotClick={(index) => api?.scrollTo(index)}
        />
      )}
    </div>
  );
};

export default GenericCarousel;
