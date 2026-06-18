import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import useBlogQuery from "@/hooks/queries/blogs/useBlogQuery";
import { getBlogMedia } from "@/components/Blog/blogDisplayUtils";
import BlogPreviewToolbar from "@/components/Blog/BlogPreviewToolbar";
import BlogPreviewArticle from "@/components/Blog/BlogPreviewArticle";

const BlogPreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: blog, isLoading, isError, error } = useBlogQuery(id);

  const blogMedia = useMemo(() => {
    if (!blog) return undefined;
    return getBlogMedia(blog);
  }, [blog]);

  const handleBack = () => {
    const canGoBack =
      typeof window !== "undefined" &&
      typeof window.history.state?.idx === "number" &&
      window.history.state.idx > 0;
    if (canGoBack) navigate(-1);
    else navigate("/blogs");
  };

  if (isLoading) return <Loader variant="standard" />;
  if (isError) {
    const message = error instanceof Error ? error.message : undefined;
    return <ErrorPage message={message} />;
  }
  if (!blog) return <ErrorPage message="המאמר לא נמצא." />;

  return (
    <div dir="rtl" className="mx-auto flex max-w-4xl flex-col gap-4 pb-12 font-heebo">
      <BlogPreviewToolbar
        onBack={handleBack}
        onEdit={() => navigate(`/blogs/create/${blog._id}`)}
      />
      <BlogPreviewArticle
        blog={blog}
        imageUrl={blogMedia?.imageUrl}
        youtubeVideoId={blogMedia?.youtubeVideoId ?? null}
      />
    </div>
  );
};

export default BlogPreviewPage;
