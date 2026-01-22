import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import BackButton from "@/components/ui/BackButton";
import useBlogQuery from "@/hooks/queries/blogs/useBlogQuery";
import { buildPhotoUrl, extractVideoId, getYouTubeThumbnail } from "@/lib/utils";
import { BiPencil } from "react-icons/bi";

const BlogPreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: blog, isLoading, isError, error } = useBlogQuery(id);

  const imageUrl = useMemo(() => {
    if (!blog) return undefined;
    const hasYoutubeLink = Boolean(blog.link && extractVideoId(blog.link));
    const fallbackImage = hasYoutubeLink && blog.link ? getYouTubeThumbnail(blog.link) : undefined;
    return blog.imageUrl ? buildPhotoUrl(blog.imageUrl) : fallbackImage;
  }, [blog]);

  if (isLoading) return <Loader variant="standard" />;
  if (isError) {
    const message = error instanceof Error ? error.message : undefined;
    return <ErrorPage message={message} />;
  }
  if (!blog) return <ErrorPage message="המאמר לא נמצא." />;

  return (
    <div className="p-4 pb-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <BackButton navLink="/blogs" />
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate(`/blogs/create/${blog._id}`)}
          >
            <BiPencil className="h-4 w-4" />
            עריכה
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold leading-snug">{blog.title}</h1>
              {blog.subtitle && (
                <p className="text-sm text-muted-foreground leading-relaxed">{blog.subtitle}</p>
              )}
            </div>
            {imageUrl && (
              <div className="h-64 w-full overflow-hidden rounded-lg bg-muted">
                <img src={imageUrl} alt={blog.title} className="h-full w-full object-cover" />
              </div>
            )}
          </div>
          <div
            className="text-sm leading-relaxed text-foreground space-y-4"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </div>
    </div>
  );
};

export default BlogPreviewPage;
