/**
 * BlogCard — single blog entry on the list page.
 *
 * Visual refresh:
 *  - 16:9 cover image at the top (YouTube thumbnail / S3 image / gradient fallback)
 *  - YouTube play overlay if the blog links to a video
 *  - Group chip overlay (color-coded, top-right in RTL)
 *  - Title (bold, 2-line clamp), subtitle (muted, 1-line clamp)
 *  - Stripped HTML preview (2-line clamp) — no tag noise
 *  - Footer with "קרא עוד" CTA + an external-link icon when there's a `link`
 *  - Whole card clickable + keyboard accessible
 *
 * Pure presentational — no data shape changes (mobile contract is safe).
 */
import React from "react";
import { IBlogResponse } from "@/interfaces/IBlog";
import { buildPhotoUrl, extractVideoId, getYouTubeThumbnail } from "@/lib/utils";
import { FaPlay, FaArrowLeft, FaImage } from "react-icons/fa6";

interface BlogCardProps {
  blog: IBlogResponse;
  onClick: () => void;
}

/**
 * Deterministic colour per group name — so the same group always looks
 * the same across the panel.
 */
const GROUP_PALETTE: { bg: string; text: string; ring: string }[] = [
  {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    ring: "ring-blue-200/60 dark:ring-blue-900/40",
  },
  {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-200/60 dark:ring-emerald-900/40",
  },
  {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
    ring: "ring-purple-200/60 dark:ring-purple-900/40",
  },
  {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    ring: "ring-rose-200/60 dark:ring-rose-900/40",
  },
  {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    ring: "ring-amber-200/60 dark:ring-amber-900/40",
  },
  {
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    text: "text-cyan-700 dark:text-cyan-300",
    ring: "ring-cyan-200/60 dark:ring-cyan-900/40",
  },
];

const groupPalette = (name?: string) => {
  if (!name) return GROUP_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return GROUP_PALETTE[hash % GROUP_PALETTE.length];
};

/** Strip HTML and collapse whitespace so the preview is plain text. */
const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onClick }) => {
  const hasYoutubeLink = Boolean(blog.link && extractVideoId(blog.link));
  const fallbackImage = hasYoutubeLink && blog.link ? getYouTubeThumbnail(blog.link) : undefined;
  const imageUrl = blog.imageUrl ? buildPhotoUrl(blog.imageUrl) : fallbackImage;

  const groupName = typeof blog.group === "string" ? blog.group : blog.group?.name;
  const palette = groupPalette(groupName);

  const previewText = stripHtml(blog.content || "");

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
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg"
    >
      {/* Cover */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={blog.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
            <FaImage size={32} />
          </div>
        )}

        {/* YouTube play indicator */}
        {hasYoutubeLink && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110">
              <FaPlay size={14} className="ms-0.5" />
            </span>
          </div>
        )}

        {/* Group chip (top-right in RTL = visually right of cover) */}
        {groupName && (
          <span
            className={`absolute top-3 right-3 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ring-1 ${palette.bg} ${palette.text} ${palette.ring}`}
          >
            {groupName}
          </span>
        )}
      </div>

      {/* Body */}
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

        {/* Footer — push to bottom */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
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
