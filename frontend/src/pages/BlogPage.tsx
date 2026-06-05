/**
 * BlogPage — admin list of blog articles.
 *
 * Redesigned shell — clearer hierarchy without touching the data shape:
 *   1. Page header (title + subtitle + small live stats: total / filtered)
 *   2. Action bar (primary "מאמר חדש" CTA · "ניהול קבוצות" · search)
 *   3. Group filter chips — toggle a group on/off with one click;
 *      keeps the same multi-select behaviour as the old FilterItems
 *      dropdown but with a friendlier, more visible UI.
 *   4. Card grid (BlogList).
 *
 * No API or interface changes — the mobile contract is untouched.
 */
import BlogList from "@/components/Blog/BlogList";
import Loader from "@/components/ui/Loader";
import useBlogsQuery from "@/hooks/queries/blogs/useBlogsQuery";
import useLessonGroupsQuery from "@/hooks/queries/lessonGroups/useLessonGroupsQuery";
import { ILessonGroup } from "@/interfaces/IBlog";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaNewspaper,
  FaPlus,
  FaLayerGroup,
  FaMagnifyingGlass,
  FaXmark,
} from "react-icons/fa6";

const BlogPage = () => {
  const navigate = useNavigate();

  const {
    data: blogPages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
  } = useBlogsQuery();
  const { data: lessonGroups } = useLessonGroupsQuery();

  const [selectedGroups, setSelectedGroups] = useState<ILessonGroup[]>([]);
  const [query, setQuery] = useState("");

  const handleCreateNewBlog = () => navigate("/blogs/create");
  const handleViewBlogGroups = () => navigate("/presets/blogs/groups");

  const allBlogs = useMemo(
    () => blogPages?.pages.flatMap((page) => page.results) ?? [],
    [blogPages]
  );

  // Apply group + free-text filters together.
  const blogs = useMemo(() => {
    let next = allBlogs;
    if (selectedGroups.length > 0) {
      const selectedNames = new Set(selectedGroups.map((g) => g.name));
      next = next.filter((b) => b.group && selectedNames.has(b.group.name));
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      next = next.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.subtitle?.toLowerCase().includes(q) ||
          b.content?.toLowerCase().includes(q)
      );
    }
    return next;
  }, [selectedGroups, allBlogs, query]);

  const toggleGroup = (group: ILessonGroup) => {
    setSelectedGroups((prev) =>
      prev.some((g) => g.name === group.name)
        ? prev.filter((g) => g.name !== group.name)
        : [...prev, group]
    );
  };

  if (isLoading) return <Loader />;

  const groups = lessonGroups?.data || [];
  const hasFilter = selectedGroups.length > 0 || query.trim().length > 0;

  return (
    <div
      data-testid="blogs-page"
      dir="rtl"
      className="flex flex-col gap-6"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200/60 dark:ring-blue-900/40">
            <FaNewspaper size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              מאמרים
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ניהול תוכן שמופיע במסך המאמרים של אפליקציית המתאמן
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleViewBlogGroups}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <FaLayerGroup size={12} />
            ניהול קבוצות
          </button>
          <button
            type="button"
            onClick={handleCreateNewBlog}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
          >
            <FaPlus size={12} />
            מאמר חדש
          </button>
        </div>
      </div>

      {/* Stats + search row */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <div className="flex items-center gap-2 px-2">
          <span className="inline-flex h-8 min-w-[2.5rem] items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            {blogs.length}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {hasFilter && blogs.length !== allBlogs.length
              ? `מתוך ${allBlogs.length} מאמרים`
              : "מאמרים בסך הכל"}
          </span>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <FaMagnifyingGlass
            size={12}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש לפי כותרת, תת-כותרת או תוכן…"
            className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pr-8 pl-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="נקה חיפוש"
            >
              <FaXmark size={10} />
            </button>
          )}
        </div>

        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedGroups([]);
            }}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
          >
            נקה הכל
          </button>
        )}
      </div>

      {/* Group filter chips */}
      {groups.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ms-1">
            קבוצות:
          </span>
          {groups.map((group) => {
            const active = selectedGroups.some((g) => g.name === group.name);
            return (
              <button
                key={group._id || group.name}
                type="button"
                onClick={() => toggleGroup(group)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-300"
                }`}
              >
                {group.name}
                {active && <FaXmark size={9} className="opacity-70" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Cards */}
      <BlogList
        blogs={blogs}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        isError={isError}
        error={error}
      />
    </div>
  );
};

export default BlogPage;
