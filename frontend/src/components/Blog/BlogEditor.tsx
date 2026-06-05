/**
 * BlogEditor — create / edit a blog article.
 *
 * Layout (redesigned to match the rest of the admin panel):
 *   1. In-flow toolbar at the top — back button + title + delete/cancel
 *      (no more "fixed top" header that fought the main scroll).
 *   2. Sectioned cards for: פרטי המאמר · סיווג · מדיה · תוכן.
 *   3. Sticky save bar at the bottom (same pattern as workout/diet
 *      plan editors).
 *
 * All form fields, validation, and mutation logic are unchanged — this
 * is a visual/structural refresh only.
 */
import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import DeleteModal from "../Alerts/DeleteModal";
import { useDisclosure } from "@/hooks/useDisclosure";
import {
  FaArrowRight,
  FaTrash,
  FaImage,
  FaLink,
  FaPenToSquare,
  FaNewspaper,
} from "react-icons/fa6";

type MediaType = "link" | "image";

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

/** Reusable section card matching the rest of the admin panel. */
const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ icon, title, description, children }) => (
  <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
    <header className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
    </header>
    <div className="p-5">{children}</div>
  </section>
);

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({
  children,
  required,
}) => (
  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
    {children}
    {required && <span className="ms-1 text-rose-500">*</span>}
  </label>
);

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
    } else {
      return await addBlogMutation.mutateAsync({ blog, image });
    }
  };

  const handleChangeMediaType = (type: MediaType) => {
    setMediaType(type);
    setLinkTouched(false);
    if (type == "image") return;
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

  const generatePhotoUrl = (url: string) => (isImageFromCloudFront ? buildPhotoUrl(url) : url);

  const blogGroupItems = useMemo(() => {
    if (!blogGroups?.data) return [];
    return convertItemsToOptions(blogGroups?.data, "name", "name");
  }, [blogGroups?.data]);

  useEffect(() => {
    if (!fetchedBlog) return;
    setBlog({ ...fetchedBlog });
    setBlogToDelete(fetchedBlog as IBlogResponse);
    setIsImageFromCloudFront(!!fetchedBlog.imageUrl);
    setMediaType(fetchedBlog.imageUrl ? "image" : "link");
    setIsEdit(true);
    setLinkTouched(false);
  }, [fetchedBlog]);

  if (isLoading) return <Loader variant="standard" />;

  const pageTitle = isEdit ? "עריכת מאמר" : "מאמר חדש";
  const pageSubtitle = isEdit
    ? "ערוך את התוכן של המאמר. השינויים יעודכנו באפליקציית המתאמן מיד עם שמירה."
    : "מלא את הפרטים הבאים כדי לפרסם מאמר חדש לאפליקציה.";
  const isTitleInvalid = !blog.title.trim();
  const isLinkInvalid = mediaType === "link" && (!blog.link || !isValidUrl(blog.link));
  const showLinkError = mediaType === "link" && (linkTouched || !!blog.link) && isLinkInvalid;
  const linkErrorMessage = !blog.link?.trim() ? "שדה חובה" : "הלינק אינו תקין";
  const isSaveDisabled = isTitleInvalid || isLinkInvalid;
  const isSaving = addBlogMutation.isPending || updateBlogMutation.isPending;

  return (
    <div
      dir="rtl"
      className="mx-auto flex max-w-4xl flex-col gap-5 pb-24"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* In-flow toolbar */}
      <button
        type="button"
        onClick={() => navigate("/blogs")}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
      >
        <FaArrowRight size={11} />
        <span>חזרה למאמרים</span>
      </button>

      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200/60 dark:ring-blue-900/40">
            {isEdit ? <FaPenToSquare size={18} /> : <FaNewspaper size={20} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{pageTitle}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{pageSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Article details */}
      <Section
        icon={<FaNewspaper size={14} />}
        title="פרטי המאמר"
        description="המידע שמופיע בראש העמוד באפליקציה."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <FieldLabel required>כותרת</FieldLabel>
            <Input
              className="h-10 text-sm"
              value={blog.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              placeholder="לדוגמה: אימון חיזוק שבועי"
            />
          </div>

          <div className="space-y-1.5">
            <FieldLabel>כותרת משנה</FieldLabel>
            <Input
              className="h-10 text-sm"
              value={blog.subtitle || ""}
              onChange={(e) => handleFieldChange("subtitle", e.target.value)}
              placeholder="לדוגמה: תוכנית בת 12 שבועות"
            />
          </div>

          <div className="space-y-1.5">
            <FieldLabel>סוג תוכנית</FieldLabel>
            <ComboBox
              options={planTypes}
              onSelect={(val) => handleFieldChange("planType", val)}
              value={blog.planType}
              inputPlaceholder="בחר תוכנית…"
            />
          </div>
        </div>
      </Section>

      {/* Classification */}
      <Section
        icon={<FaPenToSquare size={14} />}
        title="סיווג"
        description="מאיזה קבוצה המאמר הוא? משמש לפילטרים באפליקציה."
      >
        <div className="space-y-1.5">
          <FieldLabel>קבוצה</FieldLabel>
          <ComboBox
            isLoading={isBlogGroupsLoading}
            options={blogGroupItems}
            onSelect={(val) => handleFieldChange("group", val)}
            value={blog.group?.name || blog.group}
            inputPlaceholder="בחר קבוצה…"
            listEmptyMessage="אין קבוצות כרגע"
          />
        </div>
      </Section>

      {/* Media */}
      <Section
        icon={mediaType === "image" ? <FaImage size={14} /> : <FaLink size={14} />}
        title="מדיה"
        description="לינק חיצוני (YouTube וכו') או תמונת כיסוי."
      >
        <Tabs value={mediaType} onValueChange={(val) => handleChangeMediaType(val as MediaType)}>
          <TabsList className="inline-flex w-fit gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <TabsTrigger
              value="link"
              className="rounded-lg px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900"
            >
              <FaLink size={11} className="me-1.5 inline" />
              לינק
            </TabsTrigger>
            <TabsTrigger
              value="image"
              className="rounded-lg px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900"
            >
              <FaImage size={11} className="me-1.5 inline" />
              תמונה
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="mt-4 space-y-1.5">
            <FieldLabel required>לינק</FieldLabel>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ניתן להדביק לינק ל-YouTube או עמוד חיצוני.
            </p>
            <Input
              className="h-10 text-sm"
              value={blog.link || ""}
              type="text"
              placeholder="https://www.youtube.com/…"
              onChange={(e) => {
                if (!linkTouched) setLinkTouched(true);
                handleFieldChange("link", e.target.value);
              }}
              onBlur={handleLinkBlur}
            />
            {showLinkError && (
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                {linkErrorMessage}
              </p>
            )}
          </TabsContent>

          <TabsContent value="image" className="mt-4 space-y-2">
            <FieldLabel>תמונת כיסוי</FieldLabel>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              תמונה שתוצג בראש העמוד באפליקציה.
            </p>
            {!image && !blog.imageUrl ? (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 px-6 py-10 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-sm">
                  <FaImage size={18} className="text-slate-400 dark:text-slate-500" />
                </div>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  לחץ או גרור תמונה לכאן
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">PNG, JPG עד 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            ) : (
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 p-3">
                <img
                  src={generatePhotoUrl(image || blog.imageUrl || "")}
                  alt="Selected"
                  className="w-full rounded-xl object-cover"
                  style={{ maxHeight: 320 }}
                />
                <div className="flex gap-2">
                  <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700">
                    <FaImage size={11} />
                    החלף תמונה
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <FaTrash size={10} />
                    הסר
                  </button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Section>

      {/* Content */}
      <Section
        icon={<FaPenToSquare size={14} />}
        title="תוכן המאמר"
        description="הגוף המלא של המאמר — תומך עיצוב, רשימות, לינקים."
      >
        <TextEditor
          defaultValue={blog.content}
          value={blog.content}
          onChange={(val) => handleFieldChange("content", val)}
        />
      </Section>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 z-10 mt-3 flex flex-col gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-end">
        {isEdit && (
          <>
            <button
              type="button"
              onClick={() => setOpen(true)}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-60"
            >
              <FaTrash size={11} />
              מחק מאמר
            </button>
            <DeleteModal
              isModalOpen={isOpen}
              setIsModalOpen={setOpen as unknown as React.Dispatch<React.SetStateAction<boolean>>}
              onConfirm={handleDeleteBlog}
              onCancel={() => setOpen(false)}
            />
          </>
        )}
        <button
          type="button"
          onClick={() => navigate("/blogs")}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
        >
          ביטול
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaveDisabled || isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "שומר…" : isEdit ? "שמור שינויים" : "פרסם מאמר"}
        </button>
      </div>
    </div>
  );
};

export default BlogEditor;
