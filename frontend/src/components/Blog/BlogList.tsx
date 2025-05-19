import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BlogCard } from "./BlogCard";
import { IBlog } from "@/interfaces/IBlog";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../Alerts/DeleteModal";
import { toast } from "sonner";
import { QueryKeys } from "@/enums/QueryKeys";
import Loader from "../ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import useBlogsQuery from "@/hooks/queries/blogs/useBlogsQuery";
import useDeleteBlog from "@/hooks/mutations/blogs/useDeleteBlog";
import CustomButton from "../ui/CustomButton";

const BlogList: React.FC = () => {
  const navigate = useNavigate();
  const query = useQueryClient();

  const { data, isFetchingNextPage, isLoading, isError, error, fetchNextPage, hasNextPage } =
    useBlogsQuery();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<(IBlog & { _id: string }) | null>(null);

  const handleBlogClick = (blog: IBlog & { _id: string }) => {
    navigate(`/blogs/create/${blog._id}`, { state: { blog } });
  };

  const handleOpenDeleteModal = (blog: IBlog & { _id: string }) => {
    setBlogToDelete(blog);
    setIsDeleteModalOpen(true);
  };

  const onError = (e: any) => {
    toast.error("לא הצלחנו למחוק את הבלוג");
  };

  const onSuccess = (blog: any) => {
    toast.success("בלוג נמחק בהצלחה!");
    query.invalidateQueries({ queryKey: [QueryKeys.BLOGS] });
    query.invalidateQueries({ queryKey: [QueryKeys.BLOGS, blog._id] });
  };

  const deleteBlogMutation = useDeleteBlog({ onSuccess, onError });

  const handleDeleteBlog = () => {
    if (!blogToDelete) return;
    deleteBlogMutation.mutate(blogToDelete);
  };

  if (isLoading) return <Loader />;
  if (isError) return <ErrorPage message={error?.message} />;

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
      {(!data?.pages[0].results || data?.pages[0].results.length == 0) && (
        <div className="col-span-full text-center text-xl">אין בלוגים כרגע</div>
      )}
      {hasNextPage && (
        <CustomButton
          title="הצג עוד"
          isLoading={isFetchingNextPage}
          onClick={() => fetchNextPage()}
          className="col-span-full mt-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        />
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
