import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { IBlog, IBlogResponse } from "@/interfaces/IBlog";
import { buildPhotoUrl, convertItemsToOptions } from "@/lib/utils";
import { QueryKeys } from "@/enums/QueryKeys";
import CustomButton from "../ui/CustomButton";
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

type MediaType = "link" | "image";

const defaultBlog: IBlog = {
  title: "",
  content: "",
  subtitle: "",
  planType: UserPlanTypes.GENERAL,
  imageUrl: undefined,
};

const planTypes: Option[] = Object.values(UserPlanTypes).map((type) => {
  return {
    name: type,
    value: type,
  };
});

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
  const [blogToDelete, setBlogToDelete] = useState<IBlogResponse | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("link");
  const [imageToDelete, setImageToDelete] = useState<string | undefined>();
  const [linkTouched, setLinkTouched] = useState(false);

  const onSuccess = async () => {
    toast.success("מאמר נשמר בהצלחה!");
    navigate("/blogs");
    await Promise.all([
      query.invalidateQueries({ queryKey: [QueryKeys.BLOGS] }),
      query.invalidateQueries({ queryKey: [QueryKeys.BLOGS, id] }),
    ]);
  };

  const onError = () => {
    toast.error("אירעה שגיאה בשמירת המאמר!");
  };

  const addBlogMutation = useAddBlog({ onSuccess, onError });
  const updateBlogMutation = useUpdateBlog({ onSuccess, onError });

  const onDeleteSuccess = async () => {
    toast.success("המאמר נמחק בהצלחה");
    navigate("/blogs");
    await Promise.all([
      query.invalidateQueries({ queryKey: [QueryKeys.BLOGS] }),
      query.invalidateQueries({ queryKey: [QueryKeys.BLOGS, id] }),
    ]);
  };

  const onDeleteError = (e: any) => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: e?.message,
    });
  };

  const deleteBlogMutation = useDeleteBlog({ onSuccess: onDeleteSuccess, onError: onDeleteError });

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
    if (normalized !== blog.link) {
      handleFieldChange("link", normalized);
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
    setBlogToDelete(fetchedBlog as IBlogResponse);
    setIsImageFromCloudFront(!!fetchedBlog.imageUrl);
    setMediaType(fetchedBlog.imageUrl ? "image" : "link");
    setIsEdit(true);
    setLinkTouched(false);
  }, [fetchedBlog]);

  if (isLoading) return <Loader variant="standard" />;

  const pageTitle = isEdit ? "עריכת מאמר" : "יצירת מאמר";
  const isTitleInvalid = !blog.title.trim();
  const isLinkInvalid = mediaType === "link" && (!blog.link || !isValidUrl(blog.link));
  const showLinkError = mediaType === "link" && (linkTouched || !!blog.link) && isLinkInvalid;
  const linkErrorMessage = !blog.link?.trim() ? "שדה חובה" : "הלינק אינו תקין";
  const isSaveDisabled = isTitleInvalid || isLinkInvalid;

  return (
    <div className="pb-10">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <h1 className="order-1 text-xl font-semibold text-right sm:order-2">{pageTitle}</h1>
          <div className="order-3 flex items-center gap-2 sm:order-1 sm:justify-self-end">
            <Button variant="outline" onClick={() => navigate("/blogs")}>
              ביטול
            </Button>
            {isEdit && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">מחק</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="text-right" dir="rtl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>מחיקת קורס</AlertDialogTitle>
                    <AlertDialogDescription>
                      המחיקה היא פעולה בלתי הפיכה. האם למחוק את הקורס?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="sm:justify-start">
                    <AlertDialogCancel>ביטול</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteBlog}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      מחק
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <div className="order-2 flex items-center gap-2 sm:order-3 sm:justify-self-start">
            <CustomButton
              className="w-32"
              isLoading={addBlogMutation.isPending || updateBlogMutation.isPending}
              title="שמור"
              variant={"success"}
              onClick={handleSave}
              disabled={isSaveDisabled}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pt-6 text-right">
        <Card>
          <CardHeader>
            <CardTitle>פרטי המאמר</CardTitle>
            <CardDescription>מידע בסיסי שמופיע בראש העמוד.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold">
                כותרת <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">שם קצר וברור למאמר.</p>
              <Input
                className="w-full"
                value={blog.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="לדוגמה: אימון חיזוק שבועי"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">כותרת משנה</Label>
              <p className="text-xs text-muted-foreground">שורת הסבר קצרה (לא חובה).</p>
              <Input
                className="w-full"
                value={blog.subtitle || ""}
                onChange={(e) => handleFieldChange("subtitle", e.target.value)}
                placeholder="לדוגמה: תוכנית בת 12 שבועות"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">תוכנית</Label>
              <p className="text-xs text-muted-foreground">בחר את סוג התוכנית.</p>
              <ComboBox
                options={planTypes}
                onSelect={(val) => handleFieldChange("planType", val)}
                value={blog.planType}
                inputPlaceholder="בחר תוכנית..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>סיווג</CardTitle>
            <CardDescription>ארגון המאמר לפי קבוצות.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold">קבוצה</Label>
              <p className="text-xs text-muted-foreground">משמש לסינון וחיפוש.</p>
              <ComboBox
                isLoading={isBlogGroupsLoading}
                options={blogGroupItems}
                onSelect={(val) => handleFieldChange("group", val)}
                value={blog.group?.name || blog.group}
                inputPlaceholder="בחר קבוצה..."
                listEmptyMessage="אין קבוצות כרגע"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>מדיה</CardTitle>
            <CardDescription>בחרו לינק או העלאת תמונה.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              value={mediaType}
              onValueChange={(val) => handleChangeMediaType(val as MediaType)}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="link">לינק</TabsTrigger>
                <TabsTrigger value="image">תמונה</TabsTrigger>
              </TabsList>
              <TabsContent value="link" className="mt-4 space-y-2">
                <Label className="font-semibold">לינק</Label>
                <p className="text-xs text-muted-foreground">
                  ניתן להדביק לינק ל־YouTube או עמוד חיצוני.
                </p>
                <Input
                  dir="ltr"
                  className="w-full text-left"
                  value={blog.link || ""}
                  type="text"
                  placeholder="לדוגמה: https://www.youtube.com/..."
                  onChange={(e) => {
                    if (!linkTouched) setLinkTouched(true);
                    handleFieldChange("link", e.target.value);
                  }}
                  onBlur={handleLinkBlur}
                />
                {showLinkError && <p className="text-xs text-destructive">{linkErrorMessage}</p>}
              </TabsContent>
              <TabsContent value="image" className="mt-4 space-y-2">
                <Label className="font-semibold">תמונה</Label>
                <p className="text-xs text-muted-foreground">בחרו תמונת כיסוי שתוצג בראש הדף.</p>
                <Input
                  type="file"
                  accept="image/*"
                  className="w-full cursor-pointer"
                  onChange={handleImageUpload}
                />
                {(image || blog.imageUrl) && (
                  <div className="flex flex-col gap-3 pt-3 sm:w-1/2">
                    <img
                      src={generatePhotoUrl(image || blog.imageUrl || "")}
                      alt="Selected"
                      className="w-full rounded-md"
                    />
                    <Button
                      className="bg-destructive text-base rounded"
                      onClick={handleRemoveImage}
                    >
                      הסר
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>תוכן</CardTitle>
            <CardDescription>הטקסט שיופיע בתחתית העמוד.</CardDescription>
          </CardHeader>
          <CardContent>
            <TextEditor
              defaultValue={blog.content}
              value={blog.content}
              onChange={(val) => handleFieldChange("content", val)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogEditor;
