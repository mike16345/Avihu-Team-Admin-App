import { IBlogResponse } from "@/interfaces/IBlog";
import { buildPhotoUrl, extractVideoId, getYouTubeThumbnail } from "@/lib/utils";

type GroupPalette = {
  bg: string;
  text: string;
  ring: string;
};

const GROUP_PALETTES: GroupPalette[] = [
  {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    ring: "ring-blue-200/60 dark:ring-blue-900/40",
  },
  {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-200/60 dark:ring-emerald-900/40",
  },
  {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
    ring: "ring-purple-200/60 dark:ring-purple-900/40",
  },
  {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    ring: "ring-rose-200/60 dark:ring-rose-900/40",
  },
  {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    ring: "ring-amber-200/60 dark:ring-amber-900/40",
  },
  {
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    text: "text-cyan-700 dark:text-cyan-300",
    ring: "ring-cyan-200/60 dark:ring-cyan-900/40",
  },
];

export const getBlogGroupName = (blog: IBlogResponse) => {
  if (typeof blog.group === "string") return blog.group;
  return blog.group?.name;
};

export const getBlogGroupPalette = (name?: string) => {
  if (!name) return GROUP_PALETTES[0];

  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }

  return GROUP_PALETTES[hash % GROUP_PALETTES.length];
};

export const stripBlogHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

export const getBlogMedia = (blog: IBlogResponse) => {
  const youtubeVideoId = blog.link ? extractVideoId(blog.link) : null;
  const fallbackImage = youtubeVideoId && blog.link ? getYouTubeThumbnail(blog.link) : undefined;
  const imageUrl = blog.imageUrl ? buildPhotoUrl(blog.imageUrl) : fallbackImage;

  return {
    hasYoutubeLink: Boolean(youtubeVideoId),
    imageUrl,
    youtubeVideoId,
  };
};
