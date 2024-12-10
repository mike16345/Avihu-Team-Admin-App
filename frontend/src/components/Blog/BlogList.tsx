import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { BlogCard } from "./BlogCard";
import { PaginationResult } from "@/interfaces/interfaces";
import { useBlogsApi } from "@/hooks/api/useBlogsApi";
import { IBlog } from "@/interfaces/IBlog";
import { useNavigate } from "react-router-dom";

const BlogList: React.FC = () => {
  const navigate = useNavigate();
  const { getPaginatedPosts } = useBlogsApi();

  const { data, isLoading, isError, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["blogs"],
    initialPageParam: { page: 1, limit: 10 },
    queryFn: ({ pageParam = { page: 1, limit: 10 } }) => getPaginatedPosts(pageParam),
    getNextPageParam: (lastPage: PaginationResult<IBlog>) => {
      return lastPage.hasNextPage ? { page: lastPage.currentPage + 1, limit: 10 } : undefined;
    },
  });

  const handleBlogClick = (blog: IBlog & { _id: string }) => {
    navigate(`/blogs/create/${blog._id}`, { state: { blog } });
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {data?.pages.map((page) =>
        page.results.map((blog) => (
          <BlogCard key={blog._id} blog={blog} onClick={() => handleBlogClick(blog)} />
        ))
      )}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          className="col-span-full mt-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default BlogList;
