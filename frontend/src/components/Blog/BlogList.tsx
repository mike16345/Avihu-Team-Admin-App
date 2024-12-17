import React, { useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { BlogCard } from "./BlogCard";
import { PaginationResult } from "@/interfaces/interfaces";
import { useBlogsApi } from "@/hooks/api/useBlogsApi";
import { IBlog } from "@/interfaces/IBlog";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../Alerts/DeleteModal";
import { toast } from "sonner";
import { QueryKeys } from "@/enums/QueryKeys";
import Loader from "../ui/Loader";
import ErrorPage from "@/pages/ErrorPage";

const BlogList: React.FC = () => {
  const navigate = useNavigate();
  const query = useQueryClient();
  const { getPaginatedPosts, deleteBlog } = useBlogsApi();

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [QueryKeys.BLOGS],
    initialPageParam: { page: 1, limit: 10 },
    queryFn: ({ pageParam = { page: 1, limit: 10 } }) => getPaginatedPosts(pageParam),
    getNextPageParam: (lastPage: PaginationResult<IBlog>) => {
      return lastPage.hasNextPage ? { page: lastPage.currentPage + 1, limit: 10 } : undefined;
    },
    staleTime: Infinity,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<(IBlog & { _id: string }) | null>(null);

  const handleBlogClick = (blog: IBlog & { _id: string }) => {
    navigate(`/blogs/create/${blog._id}`, { state: { blog } });
  };

  const handleOpenDeleteModal = (blog: IBlog & { _id: string }) => {
    setBlogToDelete(blog);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteBlog = () => {
    if (!blogToDelete) return;
    deleteBlog(blogToDelete)
      .then((res) => {
        console.log("deleted blog", res);
        toast.success("Successfully deleted blog");
        query.invalidateQueries({ queryKey: [QueryKeys.BLOGS] });
      })
      .catch((err) => {
        console.error("error deleting blog", err);
        toast.error("Failed to delete blog");
      });
  };

  if (isLoading) return <Loader />;
  if (isError) return <ErrorPage message={error?.response?.data?.message} />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {data?.pages.map((page) =>
        page.results.map((blog) => (
          <BlogCard
            key={blog._id}
            blog={blog}
            onDelete={() => handleOpenDeleteModal(blog)}
            onClick={() => handleBlogClick(blog)}
          />
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
      <DeleteModal
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
        onConfirm={() => handleDeleteBlog()}
        onCancel={() => {
          setBlogToDelete(null);
          setIsDeleteModalOpen(false);
        }}
      />
    </div>
  );
};

export default BlogList;
