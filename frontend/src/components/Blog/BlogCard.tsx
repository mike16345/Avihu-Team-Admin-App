import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IBlogResponse } from "@/interfaces/IBlog";
import { buildPhotoUrl } from "@/lib/utils";

interface BlogCardProps {
  blog: IBlogResponse;
  onClick: () => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onClick }) => {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{blog.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {blog.imageUrl && (
          <img
            src={buildPhotoUrl(blog.imageUrl)}
            alt={blog.title}
            className="w-full h-40 object-cover rounded-md"
          />
        )}
        <p
          className="text-gray-700 mt-2 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        ></p>
      </CardContent>
    </Card>
  );
};
