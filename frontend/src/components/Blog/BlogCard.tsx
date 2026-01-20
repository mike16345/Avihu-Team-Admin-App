import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IBlogResponse } from "@/interfaces/IBlog";
import { buildPhotoUrl, extractVideoId, getYouTubeThumbnail } from "@/lib/utils";

interface BlogCardProps {
  blog: IBlogResponse;
  onClick: () => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onClick }) => {
  const hasYoutubeLink = Boolean(blog.link && extractVideoId(blog.link));
  const fallbackImage = hasYoutubeLink && blog.link ? getYouTubeThumbnail(blog.link) : undefined;
  const imageUrl = blog.imageUrl ? buildPhotoUrl(blog.imageUrl) : fallbackImage;

  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="flex flex-col gap-2 min-h-[5rem]">
        <div className="space-y-2 flex-1 min-w-0">
          <CardTitle className="leading-snug line-clamp-2 min-h-[3rem]">{blog.title}</CardTitle>
          <span className="block text-sm text-muted-foreground line-clamp-1">קבוצה: {blog.group?.name || blog.group}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="h-40 w-full overflow-hidden rounded-md bg-muted">
          {imageUrl && <img src={imageUrl} alt={blog.title} className="h-full w-full object-cover" />}
        </div>
        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: blog.content }}></p>
      </CardContent>
    </Card>
  );
};
