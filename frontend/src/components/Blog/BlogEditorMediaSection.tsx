import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { IBlog } from "@/interfaces/IBlog";
import { FaImage, FaLink, FaTrash } from "react-icons/fa6";
import { BlogEditorFieldLabel, BlogEditorSection } from "./BlogEditorPrimitives";

type MediaType = "link" | "image";

type BlogEditorMediaSectionProps = {
  blog: IBlog;
  image?: string;
  mediaType: MediaType;
  showLinkError: boolean;
  linkErrorMessage: string;
  onMediaTypeChange: (type: MediaType) => void;
  onLinkChange: (value: string) => void;
  onLinkBlur: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  getPhotoUrl: (url: string) => string;
};

const hasMediaPreview = (image: string | undefined, imageUrl: string | undefined) =>
  Boolean(image || imageUrl);

const getMediaSectionIcon = (mediaType: MediaType) => {
  if (mediaType === "image") return <FaImage size={14} />;
  return <FaLink size={14} />;
};

const BlogEditorMediaSection: React.FC<BlogEditorMediaSectionProps> = ({
  blog,
  image,
  mediaType,
  showLinkError,
  linkErrorMessage,
  onMediaTypeChange,
  onLinkChange,
  onLinkBlur,
  onImageUpload,
  onRemoveImage,
  getPhotoUrl,
}) => {
  const hasPreview = hasMediaPreview(image, blog.imageUrl);
  const previewUrl = getPhotoUrl(image || blog.imageUrl || "");

  return (
    <BlogEditorSection
      icon={getMediaSectionIcon(mediaType)}
      title="מדיה"
      description="לינק חיצוני (YouTube וכו') או תמונת כיסוי."
    >
      <Tabs value={mediaType} onValueChange={(value) => onMediaTypeChange(value as MediaType)}>
        <TabsList className="inline-flex w-fit gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
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
          <BlogEditorFieldLabel required>לינק</BlogEditorFieldLabel>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ניתן להדביק לינק ל-YouTube או עמוד חיצוני.
          </p>
          <Input
            className="h-10 text-sm"
            value={blog.link || ""}
            type="text"
            placeholder="https://www.youtube.com/…"
            onChange={(event) => onLinkChange(event.target.value)}
            onBlur={onLinkBlur}
          />
          {showLinkError && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              {linkErrorMessage}
            </p>
          )}
        </TabsContent>

        <TabsContent value="image" className="mt-4 space-y-2">
          <BlogEditorFieldLabel>תמונת כיסוי</BlogEditorFieldLabel>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            תמונה שתוצג בראש העמוד באפליקציה.
          </p>

          {!hasPreview && (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/40 px-6 py-10 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-blue-950/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-900">
                <FaImage size={18} className="text-slate-400 dark:text-slate-500" />
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                לחץ או גרור תמונה לכאן
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">PNG, JPG עד 5MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
            </label>
          )}

          {hasPreview && (
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/40 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <img
                src={previewUrl}
                alt="Selected"
                className="max-h-[320px] w-full rounded-xl object-cover"
              />
              <div className="flex gap-2">
                <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  <FaImage size={11} />
                  החלף תמונה
                  <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
                </label>
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/30"
                >
                  <FaTrash size={10} />
                  הסר
                </button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </BlogEditorSection>
  );
};

export default BlogEditorMediaSection;
export type { MediaType };
