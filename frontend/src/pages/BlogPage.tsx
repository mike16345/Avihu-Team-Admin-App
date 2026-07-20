import BlogList from "@/components/Blog/BlogList";
import ScrollableArea from "@/components/ui/ScrollableArea";
import useBlogsQuery from "@/hooks/queries/blogs/useBlogsQuery";
import useLessonGroupsQuery from "@/hooks/queries/lessonGroups/useLessonGroupsQuery";
import { useStableSearchParams } from "@/hooks/useStableSearchParams";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { IBlogResponse, ILessonGroup } from "@/interfaces/IBlog";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import LessonGroupsSheet from "@/components/Blog/LessonGroupsSheet";
import BlogPageHeader from "@/components/Blog/BlogPageHeader";
import BlogFilterToolbar from "@/components/Blog/BlogFilterToolbar";
import BlogGroupFilterChips from "@/components/Blog/BlogGroupFilterChips";

const GROUPS_PARAM_DELIMITER = ",";
const SEARCH_DEBOUNCE_MS = 300;

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

const normalizeSearchValue = (value?: string) => value?.trim().toLowerCase() ?? "";

const getBlogGroupName = (blog: IBlogResponse) => {
  if (typeof blog.group === "string") return blog.group;
  return blog.group?.name ?? "";
};

const filterBlogsByQuery = (blogs: IBlogResponse[], query: string) => {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return blogs;

  return blogs.filter((blog) => {
    const searchableValues = [
      blog.title,
      blog.subtitle,
      blog.content,
      blog.link,
      blog.planType,
      getBlogGroupName(blog),
    ];

    return searchableValues.some((value) => normalizeSearchValue(value).includes(normalizedQuery));
  });
};

const mergeBlogsById = (...blogLists: IBlogResponse[][]) => {
  const seen = new Set<string>();

  return blogLists.flatMap((blogList) =>
    blogList.filter((blog) => {
      if (seen.has(blog._id)) return false;
      seen.add(blog._id);

      return true;
    })
  );
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

  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const baseBlogQueryFilters = useMemo(() => ({ groups: selectedGroupIds }), [selectedGroupIds]);

  const {
    data: baseBlogPages,
    isLoading: isBaseLoading,
    isFetchingNextPage: isFetchingNextBasePage,
    hasNextPage: hasNextBasePage,
    fetchNextPage: fetchNextBasePage,
    isError: isBaseError,
    error: baseError,
  } = useBlogsQuery(baseBlogQueryFilters);

  const baseBlogs = useMemo(
    () => baseBlogPages?.pages.flatMap((page) => page.results) ?? [],
    [baseBlogPages]
  );
  const totalBlogs = baseBlogPages?.pages[0]?.totalResults ?? baseBlogs.length;
  const activeQuery = query.trim();
  const debouncedSearchQuery = debouncedQuery.trim();
  const hasLoadedAllBaseBlogs = Boolean(
    baseBlogPages && !hasNextBasePage && baseBlogs.length >= totalBlogs
  );
  const shouldSearchServer = Boolean(
    activeQuery && debouncedSearchQuery === activeQuery && !hasLoadedAllBaseBlogs
  );

  const {
    data: serverSearchPages,
    isFetching: isFetchingServerSearch,
    isFetchingNextPage: isFetchingNextSearchPage,
    hasNextPage: hasNextSearchPage,
    fetchNextPage: fetchNextSearchPage,
    isError: isSearchError,
    error: searchError,
  } = useBlogsQuery(
    { query: debouncedSearchQuery, groups: selectedGroupIds },
    { enabled: shouldSearchServer }
  );

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useScrollRestoration(scrollRef);

  const [groupsSheetOpen, setGroupsSheetOpen] = useState(false);

  const handleCreateNewBlog = () => navigate("/blogs/create");

  const localSearchBlogs = useMemo(
    () => filterBlogsByQuery(baseBlogs, activeQuery),
    [baseBlogs, activeQuery]
  );
  const serverSearchBlogs = useMemo(
    () => serverSearchPages?.pages.flatMap((page) => page.results) ?? [],
    [serverSearchPages]
  );
  const blogs = useMemo(() => {
    if (!activeQuery) return baseBlogs;

    return mergeBlogsById(localSearchBlogs, serverSearchBlogs);
  }, [activeQuery, baseBlogs, localSearchBlogs, serverSearchBlogs]);
  const isLoading = isBaseLoading && blogs.length === 0;
  const isFetchingNextPage =
    isFetchingNextBasePage ||
    isFetchingNextSearchPage ||
    (shouldSearchServer && isFetchingServerSearch && serverSearchBlogs.length === 0);
  const isError = isBaseError || (isSearchError && blogs.length === 0);
  const error = isBaseError ? baseError : searchError;

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
          if (activeQuery) {
            if (shouldSearchServer && hasNextSearchPage && !isFetchingNextSearchPage) {
              fetchNextSearchPage();
            }

            return;
          }

          if (hasNextBasePage && !isFetchingNextBasePage) fetchNextBasePage();
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
