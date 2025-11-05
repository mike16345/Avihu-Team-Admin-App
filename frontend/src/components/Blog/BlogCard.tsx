import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IBlogResponse } from "@/interfaces/IBlog";
import { buildPhotoUrl, extractVideoId, getYouTubeThumbnail } from "@/lib/utils";
import DeleteButton from "../ui/buttons/DeleteButton";

interface BlogCardProps {
  blog: IBlogResponse;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onClick, onDelete }) => {
  const hasYoutubeLink = Boolean(blog.link && extractVideoId(blog.link));
  const fallbackImage = hasYoutubeLink && blog.link ? getYouTubeThumbnail(blog.link) : undefined;
  const imageUrl = blog.imageUrl ? buildPhotoUrl(blog.imageUrl) : fallbackImage;

  return (
    <Card onClick={onClick} className=" cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between ">
        <div className="space-y-2">
          <CardTitle className=" leading-snug">{blog.title}</CardTitle>
          <span>קבוצה: {blog.group?.name || blog.group}</span>
        </div>
        <DeleteButton
          tip="הסר"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(blog._id);
          }}
        />
      </CardHeader>
      <CardContent>
        {imageUrl && (
          <img src={imageUrl} alt={blog.title} className="w-full h-40 object-cover rounded-md" />
        )}
        <p className="line-clamp-3" dangerouslySetInnerHTML={{ __html: blog.content }}></p>
      </CardContent>
    </Card>
  );
};
