import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useBlogsApi } from "@/hooks/api/useBlogsApi";
import { IBlog, IBlogResponse } from "@/interfaces/IBlog";
import { buildPhotoUrl } from "@/lib/utils";

const BlogEditor = () => {
  const { handleUploadBlog, updateBlog, getBlogById } = useBlogsApi();
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQueryClient();

  const [blog, setBlog] = useState<IBlog>({
    title: "",
    content: "",
    imageUrl: undefined,
  });
  const [image, setImage] = useState<string | undefined>();
  const [isImageFromCloudFront, setIsImageFromCloudFront] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | undefined>();

  const { id } = useParams();
  const stateBlog = location.state?.blog as IBlog;

  const { data: fetchedBlog, isLoading } = useQuery({
    queryKey: ["blogs", id],
    queryFn: () => getBlogById(id!),
    enabled: !!id && !stateBlog,
  });

  const handleFieldChange = <K extends keyof IBlog>(field: K, value: IBlog[K]) => {
    setBlog((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setIsImageFromCloudFront(false);
        setImage(reader.result.toString());
        setImageToDelete(image);
        setBlog((prev) => ({ ...prev, imageUrl: reader.result!.toString() }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageToDelete(image);
    setImage(undefined);
    setBlog((prev) => ({ ...prev, imageUrl: undefined }));
  };

  const handleSave = async () => {
    const imageToRemove = isImageFromCloudFront ? imageToDelete : undefined;

    try {
      if (isEdit && id) {
        const res = await updateBlog(id, blog, image, imageToRemove);
        console.log("res", res);
        toast.success("Updated blog successfully!");
      } else {
        await handleUploadBlog(blog, image);
        toast.success("Created blog successfully!");
      }
      query.invalidateQueries({ queryKey: ["blogs"] });
      navigate("/blogs");
    } catch (error) {
      toast.error("Failed to save the blog. Please try again.");
    }
  };

  const generatePhotoUrl = (url: string) => (isImageFromCloudFront ? buildPhotoUrl(url) : url);

  useEffect(() => {
    if (stateBlog) {
      setBlog(stateBlog);
      setImage(stateBlog.imageUrl);
      setIsImageFromCloudFront(true);
      setIsEdit(true);
    } else if (fetchedBlog) {
      setBlog({
        title: fetchedBlog.title,
        content: fetchedBlog.content,
        imageUrl: fetchedBlog.imageUrl,
      });
      setImage(fetchedBlog.imageUrl);
      setIsImageFromCloudFront(true);
      setIsEdit(true);
    }
  }, [stateBlog, fetchedBlog]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-8">
      <Label className="font-semibold">כותרת</Label>
      <Input
        className="w-1/2"
        value={blog.title}
        onChange={(e) => handleFieldChange("title", e.target.value)}
      />
      <Label className="font-semibold">תמונה</Label>
      <Input type="file" accept="image/*" className="w-1/2" onChange={handleImageUpload} />
      {image && (
        <div className="flex flex-col gap-4 mt-2 relative w-1/4">
          <img src={generatePhotoUrl(image)} alt="Selected" className="w-full rounded-md" />
          <Button className="bg-red-500 text-base text-white  rounded" onClick={handleRemoveImage}>
            הסר
          </Button>
        </div>
      )}
      <Label className="font-semibold">תוכן</Label>
      <ReactQuill
        value={blog.content}
        className="flex-1"
        onChange={(val) => handleFieldChange("content", val)}
      />
      <div className="flex items-center justify-end">
        <Button onClick={handleSave}>שמור</Button>
      </div>
    </div>
  );
};

export default BlogEditor;
