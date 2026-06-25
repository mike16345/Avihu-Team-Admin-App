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
  isFetchingNextPage?: boolean;
}

const BlogList: React.FC<BlogListProps> = ({
  blogs,
  isLoading,
  isError,
  error,
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
        className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-20 text-center font-heebo dark:border-slate-800 dark:bg-slate-800/40"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-900">
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
      className="grid grid-cols-1 gap-5 font-heebo sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {blogs.map((blog) => (
        <BlogCard key={blog._id} blog={blog} onClick={() => handleBlogClick(blog)} />
      ))}
      {isFetchingNextPage && (
        <div className="col-span-full flex justify-center py-3 text-xs font-semibold text-slate-400">
          טוען עוד מאמרים…
        </div>
      )}
    </div>
  );
};

export default BlogList;
