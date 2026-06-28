import BlogList from "@/components/Blog/BlogList";
import ScrollableArea from "@/components/ui/ScrollableArea";
import useBlogsQuery from "@/hooks/queries/blogs/useBlogsQuery";
import useLessonGroupsQuery from "@/hooks/queries/lessonGroups/useLessonGroupsQuery";
import { useStableSearchParams } from "@/hooks/useStableSearchParams";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { ILessonGroup } from "@/interfaces/IBlog";
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

const getNextSelectedGroups = (selectedGroups: ILessonGroup[], group: ILessonGroup) => {
  const isSelected = selectedGroups.some((selectedGroup) => selectedGroup.name === group.name);
  if (isSelected) {
    return selectedGroups.filter((selectedGroup) => selectedGroup.name !== group.name);
  }

  return [...selectedGroups, group];
};

const BlogPage = () => {
  const navigate = useNavigate();

  const { searchParams, setParam, setParams } = useStableSearchParams();
  const { data: lessonGroups } = useLessonGroupsQuery();
  const groups = useMemo(() => lessonGroups?.data ?? [], [lessonGroups]);
  const query = searchParams.get("q") ?? "";

  const selectedGroups = useMemo(
    () => parseSelectedGroups(searchParams.get("groups"), groups),
    [searchParams, groups]
  );

  const selectedGroupIds = useMemo(
    () => selectedGroups.map((group) => group._id).filter((id): id is string => Boolean(id)),
    [selectedGroups]
  );

  const blogQueryFilters = useMemo(
    () => ({ query, groups: selectedGroupIds }),
    [query, selectedGroupIds]
  );

  const {
    data: blogPages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
  } = useBlogsQuery(blogQueryFilters);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useScrollRestoration(scrollRef);

  const [groupsSheetOpen, setGroupsSheetOpen] = useState(false);

  const handleCreateNewBlog = () => navigate("/blogs/create");

  const blogs = useMemo(() => blogPages?.pages.flatMap((page) => page.results) ?? [], [blogPages]);
  const totalBlogs = blogPages?.pages[0]?.totalResults ?? blogs.length;

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
    setParams({ q: null, groups: null }, { replace: true });
  };

  const hasFilter = selectedGroups.length > 0 || query.trim().length > 0;

  return (
    <div data-testid="blogs-page" dir="rtl" className="flex flex-col gap-6 font-heebo">
      <BlogPageHeader onCreate={handleCreateNewBlog} />

      <BlogFilterToolbar
        filteredCount={blogs.length}
        totalCount={totalBlogs}
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
      </ScrollableArea>

      <LessonGroupsSheet open={groupsSheetOpen} onClose={() => setGroupsSheetOpen(false)} />
    </div>
  );
};

export default BlogPage;
