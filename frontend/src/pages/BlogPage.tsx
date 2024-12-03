import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBlogsApi } from "@/hooks/api/useBlogsApi";
import { IBlog } from "@/interfaces/IBlog";
import { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const Editor = () => {
  const { handleUploadBlog } = useBlogsApi();
  const [blog, setBlog] = useState<IBlog>({
    title: "",
    content: "",
  });
  const [image, setImage] = useState<string | undefined>();

  const handleChange = <K extends keyof IBlog>(key: K, value: IBlog[K]) => {
    setBlog({ ...blog, [key]: value });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result) {
        setImage(reader.result.toString());
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    handleUploadBlog(blog, image);
  };

  return (
    <div className="flex flex-col gap-4 p-8">
      <Label className="font-semibold">כותרת</Label>
      <Input
        className="w-1/2"
        value={blog.title}
        onChange={(e) => handleChange("title", e.target.value)}
      />
      <Label className="font-semibold">תמונה</Label>
      <Input type="file" accept="image/*" className="w-1/2" onChange={handleImageUpload} />
      {image && (
        <div className="mt-2">
          <img src={image} alt="Selected" className="w-1/4 rounded-md" />
        </div>
      )}
      <Label className="font-semibold">תוכן</Label>
      <ReactQuill
        style={{ direction: "ltr" }}
        value={blog.content}
        className="flex-1"
        onChange={(val) => handleChange("content", val)}
      />
      <div className="flex items-center justify-end">
        <Button onClick={handleSave}>שמור</Button>
      </div>
    </div>
  );
};

export default Editor;
