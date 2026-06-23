import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { IBlog, IBlogResponse } from "@/interfaces/IBlog";
import { buildPhotoUrl, convertItemsToOptions } from "@/lib/utils";
import { QueryKeys } from "@/enums/QueryKeys";
import Loader from "../ui/Loader";
import useBlogQuery from "@/hooks/queries/blogs/useBlogQuery";
import useAddBlog from "@/hooks/mutations/blogs/useAddBlog";
import useUpdateBlog from "@/hooks/mutations/blogs/useUpdateBlog";
import useDeleteBlog from "@/hooks/mutations/blogs/useDeleteBlog";
import ComboBox from "../ui/combo-box";
import useLessonGroupsQuery from "@/hooks/queries/lessonGroups/useLessonGroupsQuery";
import UserPlanTypes from "@/enums/UserPlanTypes";
import { Option } from "@/types/types";
import TextEditor from "../ui/TextEditor";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { useDisclosure } from "@/hooks/useDisclosure";
import LessonGroupsSheet from "./LessonGroupsSheet";
import { FaNewspaper, FaPenToSquare, FaPlus } from "react-icons/fa6";
import BlogEditorHeader from "./BlogEditorHeader";
import BlogEditorMediaSection, { type MediaType } from "./BlogEditorMediaSection";
import BlogEditorActions from "./BlogEditorActions";
import { BlogEditorFieldLabel, BlogEditorSection } from "./BlogEditorPrimitives";

const defaultBlog: IBlog = {
  title: "",
  content: "",
  subtitle: "",
  planType: UserPlanTypes.GENERAL,
  imageUrl: undefined,
};

const planTypes: Option[] = Object.values(UserPlanTypes).map((type) => ({
  name: type,
  value: type,
}));

const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const hasScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed);
  if (hasScheme) return trimmed;
  const looksLikeUrl = /^([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(trimmed);
  if (!looksLikeUrl) return trimmed;
  return `https://${trimmed}`;
};

const getUploadedFile = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (!event.target.files) return null;
  return event.target.files[0] || null;
};

const getLinkErrorMessage = (link: string | undefined) => {
  if (!link?.trim()) return "שדה חובה";
  return "הלינק אינו תקין";
};

const getInitialMediaType = (imageUrl: string | undefined): MediaType => {
  if (imageUrl) return "image";
  return "link";
};

const getPhotoUrl = (url: string, isCloudFrontUrl: boolean) => {
  if (isCloudFrontUrl) return buildPhotoUrl(url);
  return url;
};

const BlogEditor = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const { data: fetchedBlog, isLoading } = useBlogQuery(id);
  const { data: blogGroups, isLoading: isBlogGroupsLoading } = useLessonGroupsQuery();

  const [blog, setBlog] = useState<IBlog>(defaultBlog);
  const [image, setImage] = useState<string | undefined>();
  const [isImageFromCloudFront, setIsImageFromCloudFront] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<IBlogResponse | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("link");
  const [imageToDelete, setImageToDelete] = useState<string | undefined>();
  const [linkTouched, setLinkTouched] = useState(false);

  const { isOpen, setOpen } = useDisclosure();
  const [groupsSheetOpen, setGroupsSheetOpen] = useState(false);

  const onSuccess = async () => {
    toast.success("מאמר נשמר בהצלחה!");
    navigate("/blogs");
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BLOGS] }),
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BLOGS, id] }),
    ]);
  };
  const onError = () => toast.error("אירעה שגיאה בשמירת המאמר!");

  const addBlogMutation = useAddBlog({ onSuccess, onError });
  const updateBlogMutation = useUpdateBlog({ onSuccess, onError });

  const onDeleteSuccess = async () => {
    toast.success("המאמר נמחק בהצלחה");
    navigate("/blogs");
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BLOGS] }),
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BLOGS, id] }),
    ]);
  };
  const onDeleteError = (e: any) =>
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, { description: e?.message });

  const deleteBlogMutation = useDeleteBlog({
    onSuccess: onDeleteSuccess,
    onError: onDeleteError,
  });

  const handleFieldChange = <K extends keyof IBlog>(field: K, value: IBlog[K]) => {
    setBlog((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = getUploadedFile(event);
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

  const handleDeleteBlog = () => {
    if (!blogToDelete) return;
    deleteBlogMutation.mutate(blogToDelete);
  };

  const handleSave = async () => {
    if (isEdit && id) {
      return await updateBlogMutation.mutateAsync({
        blogId: id,
        blog,
        imageToUpload: image,
        imageToDelete,
      });
    }

    return await addBlogMutation.mutateAsync({ blog, image });
  };

  const handleChangeMediaType = (type: MediaType) => {
    setMediaType(type);
    setLinkTouched(false);
    if (type === "image") return;
    setImage(undefined);
    setIsImageFromCloudFront(false);
    if (blog.imageUrl && isEdit && isImageFromCloudFront) {
      setImageToDelete(blog.imageUrl);
    } else {
      handleFieldChange("imageUrl", undefined);
    }
  };

  const handleLinkBlur = () => {
    setLinkTouched(true);
    if (!blog.link) return;
    const normalized = normalizeUrl(blog.link);
    if (normalized !== blog.link) handleFieldChange("link", normalized);
  };

  const blogGroupItems = useMemo(() => {
    if (!blogGroups?.data) return [];
    return convertItemsToOptions(blogGroups?.data, "name", "name");
  }, [blogGroups?.data]);

  useEffect(() => {
    if (!fetchedBlog) return;
    setBlog({ ...fetchedBlog });
    setBlogToDelete(fetchedBlog as IBlogResponse);
    setIsImageFromCloudFront(!!fetchedBlog.imageUrl);
    setMediaType(getInitialMediaType(fetchedBlog.imageUrl));
    setIsEdit(true);
    setLinkTouched(false);
  }, [fetchedBlog]);

  if (isLoading) return <Loader variant="standard" />;

  const isTitleInvalid = !blog.title.trim();
  const isLinkInvalid = mediaType === "link" && (!blog.link || !isValidUrl(blog.link));
  const showLinkError = mediaType === "link" && (linkTouched || !!blog.link) && isLinkInvalid;
  const linkErrorMessage = getLinkErrorMessage(blog.link);
  const isSaveDisabled = isTitleInvalid || isLinkInvalid;
  const isSaving = addBlogMutation.isPending || updateBlogMutation.isPending;

  return (
    <div dir="rtl" className="mx-auto flex max-w-4xl flex-col gap-5 pb-24 font-heebo">
      <BlogEditorHeader isEdit={isEdit} onBack={() => navigate("/blogs")} />

      <BlogEditorSection
        icon={<FaNewspaper size={14} />}
        title="פרטי המאמר"
        description="המידע שמופיע בראש העמוד באפליקציה."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <BlogEditorFieldLabel required>כותרת</BlogEditorFieldLabel>
            <Input
              className="h-10 text-sm"
              value={blog.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              placeholder="לדוגמה: אימון חיזוק שבועי"
            />
          </div>

          <div className="space-y-1.5">
            <BlogEditorFieldLabel>כותרת משנה</BlogEditorFieldLabel>
            <Input
              className="h-10 text-sm"
              value={blog.subtitle || ""}
              onChange={(e) => handleFieldChange("subtitle", e.target.value)}
              placeholder="לדוגמה: תוכנית בת 12 שבועות"
            />
          </div>

          <div className="space-y-1.5">
            <BlogEditorFieldLabel>סוג תוכנית</BlogEditorFieldLabel>
            <ComboBox
              options={planTypes}
              onSelect={(val) => handleFieldChange("planType", val)}
              value={blog.planType}
              inputPlaceholder="בחר תוכנית…"
            />
          </div>
        </div>
      </BlogEditorSection>

      <BlogEditorSection
        icon={<FaPenToSquare size={14} />}
        title="סיווג"
        description="מאיזה קבוצה המאמר הוא? משמש לפילטרים באפליקציה."
      >
        <div className="space-y-1.5">
          <BlogEditorFieldLabel>קבוצה</BlogEditorFieldLabel>
          <ComboBox
            isLoading={isBlogGroupsLoading}
            options={blogGroupItems}
            onSelect={(val) => handleFieldChange("group", val)}
            value={blog.group?.name || blog.group}
            inputPlaceholder="בחר קבוצה…"
            listEmptyMessage="אין קבוצות כרגע"
          />
          <button
            type="button"
            onClick={() => setGroupsSheetOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 transition-colors hover:text-blue-700"
          >
            <FaPlus size={9} />
            קבוצה חדשה / ערוך קבוצות
          </button>
        </div>
      </BlogEditorSection>

      <BlogEditorMediaSection
        blog={blog}
        image={image}
        mediaType={mediaType}
        showLinkError={showLinkError}
        linkErrorMessage={linkErrorMessage}
        onMediaTypeChange={handleChangeMediaType}
        onLinkChange={(value) => {
          if (!linkTouched) setLinkTouched(true);
          handleFieldChange("link", value);
        }}
        onLinkBlur={handleLinkBlur}
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
        getPhotoUrl={(url) => getPhotoUrl(url, isImageFromCloudFront)}
      />

      <BlogEditorSection
        icon={<FaPenToSquare size={14} />}
        title="תוכן המאמר"
        description="הגוף המלא של המאמר — תומך עיצוב, רשימות, לינקים."
      >
        <TextEditor
          defaultValue={blog.content}
          value={blog.content}
          onChange={(val) => handleFieldChange("content", val)}
        />
      </BlogEditorSection>

      <BlogEditorActions
        isEdit={isEdit}
        isSaving={isSaving}
        isSaveDisabled={isSaveDisabled}
        isDeleteModalOpen={isOpen}
        onDeleteClick={() => setOpen(true)}
        onDeleteModalOpenChange={setOpen as React.Dispatch<React.SetStateAction<boolean>>}
        onConfirmDelete={handleDeleteBlog}
        onCancelDelete={() => setOpen(false)}
        onCancel={() => navigate("/blogs")}
        onSave={handleSave}
      />

      <LessonGroupsSheet
        open={groupsSheetOpen}
        onClose={() => setGroupsSheetOpen(false)}
        onCreated={(name) => {
          handleFieldChange("group", { name } as IBlog["group"]);
        }}
      />
    </div>
  );
};

export default BlogEditor;
