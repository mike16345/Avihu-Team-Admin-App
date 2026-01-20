import React from "react";
import { BlogCard } from "./BlogCard";
import { IBlogResponse } from "@/interfaces/IBlog";
import { useNavigate } from "react-router-dom";
import Loader from "../ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import CustomButton from "../ui/CustomButton";

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {blogs.map((blog) => (
        <BlogCard
          key={blog._id}
          blog={blog}
          onClick={() => handleBlogClick(blog)}
        />
      ))}
      {blogs.length == 0 && (
        <div className="col-span-full text-center text-xl">אין מאמרים כרגע</div>
      )}
      {hasNextPage && fetchNextPage && (
        <CustomButton
          title="הצג עוד"
          isLoading={isFetchingNextPage}
          onClick={() => fetchNextPage()}
          className="col-span-full mt-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        />
      )}
    </div>
  );
};

export default BlogList;
