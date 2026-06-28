import { useGetQueryData } from "@/hooks/useGetQueryData";
import { IUser } from "@/interfaces/IUser";
import { extractDateAndNumber } from "@/lib/utils";
import { FC, useEffect } from "react";
import { FaArrowLeft, FaArrowRight, FaDownload } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useLocation, useParams } from "react-router-dom";

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
  const { id } = useParams();
  const user = useLocation().state || useGetQueryData<IUser>([id || ""]);

  // ESC closes; arrow keys navigate between images when available.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && onArrowPress && isPrevious) onArrowPress("previous");
      if (event.key === "ArrowLeft" && onArrowPress && isNext) onArrowPress("next");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onArrowPress, isPrevious, isNext]);

  // Lock body scroll while open so the underlying page doesn't drift.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const downloadFile = async (url: string, filename: string) => {
    const response = await fetch(url, { method: "GET" });
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  };

  const handleDownload = () => {
    const name = user ? `${user?.firstName}-${user?.lastName}`.replace(" ", "") : "לקוח";
    const { date, number } = extractDateAndNumber(img);
    const filename = `${name}-${date}-${number}.jpg`;
    downloadFile(img, filename);
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-200/95 p-6 backdrop-blur-md dark:bg-slate-900/95"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="סגור"
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800 hover:scale-105"
      >
        <IoClose size={22} />
      </button>

      <button
        type="button"
        onClick={handleDownload}
        aria-label="הורד תמונה"
        className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800 hover:scale-105"
      >
        <FaDownload size={16} />
      </button>

      {onArrowPress && isPrevious && (
        <button
          type="button"
          onClick={() => onArrowPress("previous")}
          aria-label="התמונה הקודמת"
          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800 hover:scale-105"
        >
          <FaArrowRight size={18} />
        </button>
      )}

      <img
        src={img}
        alt="תמונה מוגדלת"
        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      />

      {onArrowPress && isNext && (
        <button
          type="button"
          onClick={() => onArrowPress("next")}
          aria-label="התמונה הבאה"
          className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800 hover:scale-105"
        >
          <FaArrowLeft size={18} />
        </button>
      )}
    </div>
  );
};
