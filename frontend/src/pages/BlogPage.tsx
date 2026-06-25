import BlogList from "@/components/Blog/BlogList";
import Loader from "@/components/ui/Loader";
import ScrollableArea from "@/components/ui/ScrollableArea";
import useBlogsQuery from "@/hooks/queries/blogs/useBlogsQuery";
import useLessonGroupsQuery from "@/hooks/queries/lessonGroups/useLessonGroupsQuery";
import { useStableSearchParams } from "@/hooks/useStableSearchParams";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { IBlogResponse, ILessonGroup } from "@/interfaces/IBlog";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import LessonGroupsSheet from "@/components/Blog/LessonGroupsSheet";
import BlogPageHeader from "@/components/Blog/BlogPageHeader";
import BlogFilterToolbar from "@/components/Blog/BlogFilterToolbar";
import BlogGroupFilterChips from "@/components/Blog/BlogGroupFilterChips";

const GROUPS_PARAM_DELIMITER = ",";

const parseSelectedGroups = (raw: string | null, available: ILessonGroup[]): ILessonGroup[] => {
  if (!raw) return [];
  const wanted = new Set(raw.split(GROUPS_PARAM_DELIMITER).filter(Boolean));
  return available.filter((group) => wanted.has(group.name));
};

const serialiseSelectedGroups = (selected: ILessonGroup[]): string | null => {
  if (selected.length === 0) return null;
  return selected.map((group) => group.name).join(GROUPS_PARAM_DELIMITER);
};

const getFilteredBlogs = (
  blogs: IBlogResponse[],
  selectedGroups: ILessonGroup[],
  query: string
) => {
  let nextBlogs = blogs;

  if (selectedGroups.length > 0) {
    const selectedNames = new Set(selectedGroups.map((group) => group.name));
    nextBlogs = nextBlogs.filter((blog) => blog.group && selectedNames.has(blog.group.name));
  }

  if (query.trim()) {
    const normalizedQuery = query.trim().toLowerCase();
    nextBlogs = nextBlogs.filter(
      (blog) =>
        blog.title?.toLowerCase().includes(normalizedQuery) ||
        blog.subtitle?.toLowerCase().includes(normalizedQuery) ||
        blog.content?.toLowerCase().includes(normalizedQuery)
    );
  }

  return nextBlogs;
};

const getNextSelectedGroups = (selectedGroups: ILessonGroup[], group: ILessonGroup) => {
  const isSelected = selectedGroups.some((selectedGroup) => selectedGroup.name === group.name);
  if (isSelected) {
    return selectedGroups.filter((selectedGroup) => selectedGroup.name !== group.name);
  }

  return [...selectedGroups, group];
};

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

  const { searchParams, setParam } = useStableSearchParams();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useScrollRestoration(scrollRef);

  const [groupsSheetOpen, setGroupsSheetOpen] = useState(false);

  const handleCreateNewBlog = () => navigate("/blogs/create");

  const allBlogs = useMemo(
    () => blogPages?.pages.flatMap((page) => page.results) ?? [],
    [blogPages]
  );

  const groups = lessonGroups?.data || [];

  const query = searchParams.get("q") ?? "";
  const selectedGroups = useMemo(
    () => parseSelectedGroups(searchParams.get("groups"), groups),
    [searchParams, groups]
  );

  const blogs = useMemo(
    () => getFilteredBlogs(allBlogs, selectedGroups, query),
    [selectedGroups, allBlogs, query]
  );

  // URL-driven filters — coming back from a single article preview
  // restores the same search + group selection the trainer left on.
  // `replace: true` keeps every keystroke from spawning a history
  // entry; navigating into an article still pushes one entry, so
  // browser back and the in-page "חזרה" button behave identically.
  const handleQueryChange = (value: string) => {
    setParam("q", value || null, { replace: true });
  };

  const handleToggleGroup = (group: ILessonGroup) => {
    const next = getNextSelectedGroups(selectedGroups, group);
    setParam("groups", serialiseSelectedGroups(next), { replace: true });
  };

  const handleClearFilters = () => {
    setParam("q", null, { replace: true });
    setParam("groups", null, { replace: true });
  };

  const hasFilter = selectedGroups.length > 0 || query.trim().length > 0;

  return (
    <div data-testid="blogs-page" dir="rtl" className="flex flex-col gap-6 font-heebo">
      <BlogPageHeader onCreate={handleCreateNewBlog} />

      <BlogFilterToolbar
        filteredCount={blogs.length}
        totalCount={allBlogs.length}
        hasFilter={hasFilter}
        query={query}
        onQueryChange={handleQueryChange}
        onClearFilters={handleClearFilters}
      />

      <BlogGroupFilterChips
        groups={groups}
        selectedGroups={selectedGroups}
        onToggleGroup={handleToggleGroup}
        onOpenGroups={() => setGroupsSheetOpen(true)}
      />

      <ScrollableArea
        ref={scrollRef}
        className="max-h-[calc(100vh-240px)]"
        onReachEnd={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
      >
        <BlogList
          blogs={blogs}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          isError={isError}
          error={error}
        />
        {isLoading && <Loader />}
      </ScrollableArea>

      <LessonGroupsSheet open={groupsSheetOpen} onClose={() => setGroupsSheetOpen(false)} />
    </div>
  );
};

export default BlogPage;
