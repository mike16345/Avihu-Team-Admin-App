/**
 * BlogList — grid of BlogCards with empty state + "load more" pagination.
 *
 * Pure presentation; consumes the same props it did before.
 */
import React from "react";
import { BlogCard } from "./BlogCard";
import { IBlogResponse } from "@/interfaces/IBlog";
import { useNavigate } from "react-router-dom";
import Loader from "../ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { FaNewspaper } from "react-icons/fa6";

interface BlogListProps {
  blogs: IBlogResponse[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  hasNextPage?: boolean;
  fetchNextPage?: () => void | Promise<unknown>;
  isFetchingNextPage?: boolean;
}

const BlogList: React.FC<BlogListProps> = ({
  blogs,
  isLoading,
  isError,
  error,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}) => {
  const navigate = useNavigate();

  const handleBlogClick = (blog: IBlogResponse) => {
    navigate(`/blogs/${blog._id}`, { state: { blog } });
  };

  if (isLoading) return <Loader />;
  if (isError) {
    const message = error instanceof Error ? error.message : undefined;
    return <ErrorPage message={message} />;
  }

  if (blogs.length === 0) {
    return (
      <div
        dir="rtl"
        className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-6 py-20 text-center"
        style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
          <FaNewspaper size={28} className="text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">אין מאמרים עדיין</h3>
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          לחץ על "מאמר חדש" כדי להוסיף את המאמר הראשון שלך לאפליקציה.
        </p>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {blogs.map((blog) => (
        <BlogCard key={blog._id} blog={blog} onClick={() => handleBlogClick(blog)} />
      ))}
      {hasNextPage && fetchNextPage && (
        <div className="col-span-full mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetchingNextPage ? "טוען…" : "טען עוד מאמרים"}
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogList;
