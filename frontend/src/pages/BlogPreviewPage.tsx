/**
 * BlogPreviewPage — read-only article view, redesigned.
 *
 * Layout:
 *   - Top toolbar: in-flow "חזרה" button (navigate(-1) → exact list scroll
 *     position) + small "ערוך מאמר" CTA on the left in RTL.
 *   - Hero card: large cover image (16:9), group + plan-type chips,
 *     title + subtitle.
 *   - Article body card with proper typography (`prose` style done
 *     manually with Tailwind so it works in RTL).
 *   - Footer with an external "פתח קישור" button when the blog has a
 *     non-YouTube link.
 *
 * Data unchanged.
 */
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import useBlogQuery from "@/hooks/queries/blogs/useBlogQuery";
import { buildPhotoUrl, extractVideoId, getYouTubeThumbnail } from "@/lib/utils";
import {
  FaArrowRight,
  FaPenToSquare,
  FaPlay,
  FaUpRightFromSquare,
  FaImage,
} from "react-icons/fa6";

const BlogPreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: blog, isLoading, isError, error } = useBlogQuery(id);

  const imageUrl = useMemo(() => {
    if (!blog) return undefined;
    const hasYoutubeLink = Boolean(blog.link && extractVideoId(blog.link));
    const fallbackImage =
      hasYoutubeLink && blog.link ? getYouTubeThumbnail(blog.link) : undefined;
    return blog.imageUrl ? buildPhotoUrl(blog.imageUrl) : fallbackImage;
  }, [blog]);

  const youtubeVideoId = useMemo(
    () => (blog?.link ? extractVideoId(blog.link) : null),
    [blog?.link]
  );

  const handleBack = () => {
    const canGoBack =
      typeof window !== "undefined" &&
      typeof window.history.state?.idx === "number" &&
      window.history.state.idx > 0;
    if (canGoBack) navigate(-1);
    else navigate("/blogs");
  };

  if (isLoading) return <Loader variant="standard" />;
  if (isError) {
    const message = error instanceof Error ? error.message : undefined;
    return <ErrorPage message={message} />;
  }
  if (!blog) return <ErrorPage message="המאמר לא נמצא." />;

  return (
    <div
      dir="rtl"
      className="mx-auto flex max-w-4xl flex-col gap-4 pb-12"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
        >
          <FaArrowRight size={11} />
          <span>חזרה למאמרים</span>
        </button>
        <button
          type="button"
          onClick={() => navigate(`/blogs/create/${blog._id}`)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <FaPenToSquare size={12} />
          ערוך מאמר
        </button>
      </div>

      {/* Hero */}
      <article className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {/* Cover */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
          {youtubeVideoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeVideoId}`}
              title={blog.title}
              allowFullScreen
              className="h-full w-full"
            />
          ) : imageUrl ? (
            <img src={imageUrl} alt={blog.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
              <FaImage size={48} />
            </div>
          )}
        </div>

        {/* Title block */}
        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-5">
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {blog.group?.name && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 ring-1 ring-blue-200/60 dark:ring-blue-900/40">
                {blog.group.name}
              </span>
            )}
            {blog.planType && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200/60 dark:ring-emerald-900/40">
                {blog.planType}
              </span>
            )}
            {youtubeVideoId && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-300 ring-1 ring-rose-200/60 dark:ring-rose-900/40">
                <FaPlay size={9} />
                סרטון
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-slate-100">
            {blog.title}
          </h1>
          {blog.subtitle && (
            <p className="mt-2 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {blog.subtitle}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div
            className="prose-rtl text-sm leading-7 text-slate-700 dark:text-slate-200"
            style={{ wordBreak: "break-word" }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>

        {/* Footer — external link only when there's a non-YouTube link */}
        {blog.link && !youtubeVideoId && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4">
            <a
              href={blog.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <FaUpRightFromSquare size={11} />
              פתח קישור חיצוני
            </a>
          </div>
        )}
      </article>
    </div>
  );
};

export default BlogPreviewPage;
