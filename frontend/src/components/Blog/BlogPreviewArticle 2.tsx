import { IBlogResponse } from "@/interfaces/IBlog";
import { FaImage, FaPlay, FaUpRightFromSquare } from "react-icons/fa6";

type BlogPreviewArticleProps = {
  blog: IBlogResponse;
  imageUrl?: string;
  youtubeVideoId: string | null;
};

const BlogPreviewCover: React.FC<BlogPreviewArticleProps> = ({
  blog,
  imageUrl,
  youtubeVideoId,
}) => {
  const imageSrc = imageUrl || "";
  const showImage = !youtubeVideoId && Boolean(imageSrc);
  const showFallback = !youtubeVideoId && !imageSrc;

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
      {youtubeVideoId && (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeVideoId}`}
          title={blog.title}
          allowFullScreen
          className="h-full w-full"
        />
      )}
      {showImage && <img src={imageSrc} alt={blog.title} className="h-full w-full object-cover" />}
      {showFallback && (
        <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
          <FaImage size={48} />
        </div>
      )}
    </div>
  );
};

const BlogPreviewArticle: React.FC<BlogPreviewArticleProps> = ({
  blog,
  imageUrl,
  youtubeVideoId,
}) => (
  <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <BlogPreviewCover blog={blog} imageUrl={imageUrl} youtubeVideoId={youtubeVideoId} />

    <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {blog.group?.name && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/40">
            {blog.group.name}
          </span>
        )}
        {blog.planType && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/40">
            {blog.planType}
          </span>
        )}
        {youtubeVideoId && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/40">
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

    <div className="px-6 py-6">
      <div
        className="prose-rtl text-sm leading-7 text-slate-700 [word-break:break-word] dark:text-slate-200"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </div>

    {blog.link && !youtubeVideoId && (
      <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-800">
        <a
          href={blog.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
        >
          <FaUpRightFromSquare size={11} />
          פתח קישור חיצוני
        </a>
      </div>
    )}
  </article>
);

export default BlogPreviewArticle;
