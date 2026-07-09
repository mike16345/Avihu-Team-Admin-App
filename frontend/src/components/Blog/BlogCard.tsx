import React from "react";
import { IBlogResponse } from "@/interfaces/IBlog";
import { FaPlay, FaArrowLeft, FaImage } from "react-icons/fa6";
import {
  getBlogGroupName,
  getBlogGroupPalette,
  getBlogMedia,
  stripBlogHtml,
} from "./blogDisplayUtils";

interface BlogCardProps {
  blog: IBlogResponse;
  onClick: () => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onClick }) => {
  const { hasYoutubeLink, imageUrl } = getBlogMedia(blog);
  const groupName = getBlogGroupName(blog);
  const palette = getBlogGroupPalette(groupName);
  const previewText = stripBlogHtml(blog.content || "");
  const imageSrc = imageUrl || "";
  const showImage = Boolean(imageSrc);
  const showFallback = !showImage;

  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      dir="rtl"
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        {showImage && (
          <img
            src={imageSrc}
            alt={blog.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {showFallback && (
          <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
            <FaImage size={32} />
          </div>
        )}

        {hasYoutubeLink && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110">
              <FaPlay size={14} className="ms-0.5" />
            </span>
          </div>
        )}

        {groupName && (
          <span
            className={`absolute top-3 right-3 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ring-1 ${palette.bg} ${palette.text} ${palette.ring}`}
          >
            {groupName}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 dark:text-slate-100">
          {blog.title}
        </h3>
        {blog.subtitle && (
          <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{blog.subtitle}</p>
        )}
        {previewText && (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {previewText}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 transition-transform group-hover:-translate-x-0.5">
            <FaArrowLeft size={10} />
            קרא עוד
          </span>
          {blog.link && !hasYoutubeLink && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">קישור חיצוני</span>
          )}
        </div>
      </div>
    </article>
  );
};
