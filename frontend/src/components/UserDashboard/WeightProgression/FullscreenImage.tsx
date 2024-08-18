import { FC } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

interface FullscreenImageProps {
  img: string;
  onClose: () => void;
  onArrowPress?: (direction: "next" | "previous") => void;
  isPrevious?: boolean;
  isNext?: boolean;
}

export const FullscreenImage: FC<FullscreenImageProps> = ({
  img,
  isNext,
  isPrevious,
  onArrowPress,
  onClose,
}) => {
  return (
    <div className="fixed top-0 left-0  size-full glassmorphism z-50 flex items-center justify-center">
      <div className="absolute top-10 left-4">
        <IoClose
          onClick={onClose}
          className=" text-white  filter-black cursor-pointer font-bold"
          size={36}
        />
      </div>
      {onArrowPress && isPrevious && (
        <div className="absolute top-1/2 left-4">
          <FaArrowLeft
            onClick={() => onArrowPress("previous")}
            className=" text-white  filter-black cursor-pointer font-bold"
            size={36}
          />
        </div>
      )}
      <img
        src={img}
        alt="fullscreen"
        className="max-w-full max-h-full rounded-md py-2 shadow-black "
      />
      {onArrowPress && isNext && (
        <div className="absolute top-1/2 right-4">
          <FaArrowRight
            onClick={() => onArrowPress("next")}
            className=" text-white  filter-black cursor-pointer font-bold"
            size={36}
          />
        </div>
      )}
    </div>
  );
};
