import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IBlog } from "@/interfaces/IBlog";
import { buildPhotoUrl, convertItemsToOptions } from "@/lib/utils";
import BackButton from "../ui/BackButton";
import { QueryKeys } from "@/enums/QueryKeys";
import CustomButton from "../ui/CustomButton";
import Loader from "../ui/Loader";
import useBlogQuery from "@/hooks/queries/blogs/useBlogQuery";
import useAddBlog from "@/hooks/mutations/blogs/useAddBlog";
import useUpdateBlog from "@/hooks/mutations/blogs/useUpdateBlog";
import CustomRadioGroup, { IRadioItem } from "../ui/CustomRadioGroup";
import ComboBox from "../ui/combo-box";
import useLessonGroupsQuery from "@/hooks/queries/lessonGroups/useLessonGroupsQuery";
import UserPlanTypes from "@/enums/UserPlanTypes";
import { Option } from "@/types/types";
import TextEditor from "../ui/TextEditor";

type MediaType = "link" | "image";

const defaultBlog: IBlog = {
  title: "",
  content: "",
  planType: UserPlanTypes.GENERAL,
  imageUrl: undefined,
};

const radioItems: IRadioItem<string>[] = [
  {
    id: "link",
    label: "לינק",
    value: "link",
  },
  {
    id: "image",
    label: "תמונה",
    value: "image",
  },
];

const planTypes: Option[] = Object.values(UserPlanTypes).map((type) => {
  return {
    name: type,
    value: type,
  };
});

const BlogEditor = () => {
  const navigate = useNavigate();
  const query = useQueryClient();
  const { id } = useParams();

  const { data: fetchedBlog, isLoading } = useBlogQuery(id);
  const { data: blogGroups, isLoading: isBlogGroupsLoading } = useLessonGroupsQuery();

  const [blog, setBlog] = useState<IBlog>(defaultBlog);
  const [image, setImage] = useState<string | undefined>();
  const [isImageFromCloudFront, setIsImageFromCloudFront] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [mediaType, setMediaType] = useState<MediaType>("link");
  const [imageToDelete, setImageToDelete] = useState<string | undefined>();

  const onSuccess = async () => {
    toast.success(`פוסט נשמר בהצלחה!`);
    navigate("/blogs");
    await Promise.all([
      query.invalidateQueries({ queryKey: [QueryKeys.BLOGS] }),
      query.invalidateQueries({ queryKey: [QueryKeys.BLOGS, id] }),
    ]);
  };

  const onError = () => {
    toast.error("אירעה שגיאה בהעלאת הפוסט!");
  };

  const addBlogMutation = useAddBlog({ onSuccess, onError });
  const updateBlogMutation = useUpdateBlog({ onSuccess, onError });

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
      return await updateBlogMutation.mutateAsync({
        blogId: id,
        blog,
        imageToUpload: image,
        imageToDelete,
      });
    } else {
      return await addBlogMutation.mutateAsync({ blog, image });
    }
  };

  const handleChangeMediaType = (type: MediaType) => {
    setMediaType(type);
    if (type == "image") return;

    setImage(undefined);
    setIsImageFromCloudFront(false);

    if (blog.imageUrl && isEdit && isImageFromCloudFront) {
      setImageToDelete(blog.imageUrl);
    } else {
      handleFieldChange("imageUrl", undefined);
    }
  };

  const generatePhotoUrl = (url: string) => (isImageFromCloudFront ? buildPhotoUrl(url) : url);

  const blogGroupItems = useMemo(() => {
    if (!blogGroups?.data) return [];

    return convertItemsToOptions(blogGroups?.data, "name", "name");
  }, [blogGroups?.data]);

  useEffect(() => {
    if (!fetchedBlog) return;

    setBlog({ ...fetchedBlog });
    setIsImageFromCloudFront(!!fetchedBlog.imageUrl);
    setMediaType(fetchedBlog.imageUrl ? "image" : "link");
    setIsEdit(true);
  }, [fetchedBlog]);

  if (isLoading) return <Loader variant="standard" />;

  return (
    <div className="flex justify-between p-4 pb-8">
      <div className="flex-1 flex flex-col gap-2 ">
        <BackButton navLink="/blogs" />
        <Label className="font-semibold">כותרת</Label>
        <Input
          className="sm:w-2/3 "
          value={blog.title}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          placeholder="כותרת.."
        />
        <Label className="font-semibold">כותרת משנה</Label>
        <Input
          className="sm:w-2/3 "
          value={blog.subtitle}
          onChange={(e) => handleFieldChange("subtitle", e.target.value)}
          placeholder="כותרת משנה..."
        />

        <div className="flex flex-col gap-3 sm:w-2/3">
          <Label className="font-semibold">תוכנית</Label>

          <ComboBox
            options={planTypes}
            onSelect={(val) => handleFieldChange("planType", val)}
            value={blog.planType}
            inputPlaceholder="בחר תוכנית..."
          />
          <Label className="font-semibold">קבוצה</Label>
          <ComboBox
            isLoading={isBlogGroupsLoading}
            options={blogGroupItems}
            onSelect={(val) => handleFieldChange("group", val)}
            value={blog.group?.name || blog.group}
            inputPlaceholder="בחר קבוצה..."
            listEmptyMessage="אין קבוצות כרגע"
          />
        </div>
        <div className="flex flex-col justify-center gap-2 sm:2/3">
          {mediaType == "image" && (
            <>
              <Label className="font-semibold">תמונה</Label>
              <Input
                type="file"
                accept="image/*"
                className="sm:w-2/3 cursor-pointer"
                onChange={handleImageUpload}
              />
            </>
          )}
          {mediaType == "link" && (
            <>
              <Label className="font-semibold">לינק</Label>
              <Input
                value={blog.link}
                type="text"
                placeholder=".../https://youtube.com"
                className="sm:w-2/3"
                onChange={(e) => handleFieldChange("link", e.target.value)}
              />
            </>
          )}
          <CustomRadioGroup
            className="flex w-fit items-center"
            defaultValue="link"
            items={radioItems}
            onValueChange={handleChangeMediaType}
          />
        </div>
        {(image || blog.imageUrl) && (
          <div className="flex flex-col gap-4 mt-2 relative sm:w-1/4">
            <img
              src={generatePhotoUrl(image || blog.imageUrl || "")}
              alt="Selected"
              className="w-full rounded-md"
            />
            <Button className="bg-destructive text-base rounded" onClick={handleRemoveImage}>
              הסר
            </Button>
          </div>
        )}
        <Label className="font-semibold">תוכן</Label>
        <TextEditor
          defaultValue={blog.content}
          value={blog.content}
          onChange={(val) => handleFieldChange("content", val)}
        />
      </div>
      <CustomButton
        className="w-32 h-fit"
        isLoading={addBlogMutation.isPending || updateBlogMutation.isPending}
        title="שמור"
        variant={"success"}
        onClick={handleSave}
      />
    </div>
  );
};

export default BlogEditor;
