import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useBlogsApi } from "@/hooks/api/useBlogsApi";
import { IBlog } from "@/interfaces/IBlog";
import { buildPhotoUrl } from "@/lib/utils";
import BackButton from "../ui/BackButton";
import { QueryKeys } from "@/enums/QueryKeys";
import CustomButton from "../ui/CustomButton";
import Loader from "../ui/Loader";

const formats = [
  "font",
  "size",
  "color",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "align",
];

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

  const quillRef = useRef<ReactQuill>(null);

  const { id } = useParams();
  const stateBlog = location.state?.blog as IBlog;

  const { data: fetchedBlog, isLoading } = useQuery({
    queryKey: [QueryKeys.BLOGS, id],
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
        setImageToDelete(blog.imageUrl);
        setImage(reader.result.toString());
        setBlog((prev) => ({ ...prev, imageUrl: reader.result!.toString() }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageToDelete(blog.imageUrl);
    setImage(undefined);
    setBlog((prev) => ({ ...prev, imageUrl: undefined }));
  };

  const handleSave = async () => {
    if (isEdit && id) {
      return await updateBlog(id, blog, image, imageToDelete);
    } else {
      return await handleUploadBlog(blog, image);
    }
  };

  const onSuccess = () => {
    query.invalidateQueries({ queryKey: [QueryKeys.BLOGS] });
    toast.success(`פוסט נשמר בהצלחה!`);
    navigate("/blogs");
  };

  const onError = () => {
    toast.error("אירעה שגיאה בהעלאת הפוסט!");
  };

  const saveBlogMutation = useMutation({ mutationFn: handleSave, onSuccess, onError });

  const generatePhotoUrl = (url: string) => (isImageFromCloudFront ? buildPhotoUrl(url) : url);

  useEffect(() => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    editor.format("align", "right");
  }, [quillRef]);

  useEffect(() => {
    if (stateBlog) {
      setBlog(stateBlog);
      setIsImageFromCloudFront(true);
      setIsEdit(true);
    } else if (fetchedBlog) {
      setBlog({
        title: fetchedBlog.title,
        content: fetchedBlog.content,
        imageUrl: fetchedBlog.imageUrl,
      });
      setIsImageFromCloudFront(true);
      setIsEdit(true);
    }
  }, [stateBlog, fetchedBlog]);

  if (isLoading) {
    return <Loader variant="standard" />;
  }

  return (
    <div className="flex flex-col gap-4 p-8">
      <BackButton navLink="/blogs" />
      <Label className="font-semibold">כותרת</Label>
      <Input
        className="w-1/2 "
        value={blog.title}
        onChange={(e) => handleFieldChange("title", e.target.value)}
      />
      <Label className="font-semibold">תמונה</Label>
      <Input type="file" accept="image/*" className="w-1/2" onChange={handleImageUpload} />
      {(image || blog.imageUrl) && (
        <div className="flex flex-col gap-4 mt-2 relative w-1/4">
          <img
            src={generatePhotoUrl(image || blog.imageUrl || "")}
            alt="Selected"
            className="w-full rounded-md"
          />
          <Button className="bg-red-500 text-base text-white  rounded" onClick={handleRemoveImage}>
            הסר
          </Button>
        </div>
      )}
      <Label className="font-semibold">תוכן</Label>
      <ReactQuill
        id="editor"
        ref={quillRef}
        value={blog.content}
        modules={{
          toolbar: [
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
            ["link"],
            ["clean"],
            [{ align: "" }, { align: "center" }, { align: "right" }, { align: "justify" }],
          ],
        }}
        formats={formats}
        className="flex-1 "
        onChange={(val) => handleFieldChange("content", val)}
      />
      <div className="flex items-center justify-end gap-3">
        <Button variant={"secondary"} onClick={() => navigate("/blogs")}>
          בטל
        </Button>
        <CustomButton
          isLoading={saveBlogMutation.isPending}
          title="שמור"
          variant={"success"}
          onClick={() => saveBlogMutation.mutate()}
        />
      </div>
    </div>
  );
};

export default BlogEditor;
