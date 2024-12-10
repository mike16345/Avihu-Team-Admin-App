import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IBlogResponse } from "@/interfaces/IBlog";
import { buildPhotoUrl } from "@/lib/utils";
import DeleteButton from "../workout plan/buttons/DeleteButton";

interface BlogCardProps {
  blog: IBlogResponse;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onClick, onDelete }) => {
  return (
    <Card onClick={onClick} className=" cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between ">
        <CardTitle className=" leading-snug">{blog.title}</CardTitle>
        <DeleteButton
          tip="הסר"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(blog._id);
          }}
        />
      </CardHeader>
      <CardContent>
        {blog.imageUrl && (
          <img
            src={buildPhotoUrl(blog.imageUrl)}
            alt={blog.title}
            className="w-full h-40 object-cover rounded-md"
          />
        )}
        <p className="line-clamp-3" dangerouslySetInnerHTML={{ __html: blog.content }}></p>
      </CardContent>
    </Card>
  );
};
