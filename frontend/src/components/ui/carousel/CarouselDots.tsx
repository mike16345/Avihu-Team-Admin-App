import React from "react";

interface CarouselDotsProps {
  windowCount: number;
  onDotClick: (index: number) => void;
  currentWindow: number;
}

const CarouselDots: React.FC<CarouselDotsProps> = ({ currentWindow, onDotClick, windowCount }) => {
  return (
    <div className="flex   flex-row-reverse justify-center gap-2">
      {Array.from({ length: windowCount }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`
               w-3 h-3 rounded-full
               ${currentWindow === index ? "bg-blue-600" : "bg-gray-300"}
             `}
        />
      ))}
    </div>
  );
};

export default CarouselDots;
