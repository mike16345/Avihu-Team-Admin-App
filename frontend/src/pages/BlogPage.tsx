import BlogList from "@/components/Blog/BlogList";
import Loader from "@/components/ui/Loader";
import useBlogsQuery from "@/hooks/queries/blogs/useBlogsQuery";
import useLessonGroupsQuery from "@/hooks/queries/lessonGroups/useLessonGroupsQuery";
import { IBlogResponse, ILessonGroup } from "@/interfaces/IBlog";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LessonGroupsSheet from "@/components/Blog/LessonGroupsSheet";
import BlogPageHeader from "@/components/Blog/BlogPageHeader";
import BlogFilterToolbar from "@/components/Blog/BlogFilterToolbar";
import BlogGroupFilterChips from "@/components/Blog/BlogGroupFilterChips";

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

  const [selectedGroups, setSelectedGroups] = useState<ILessonGroup[]>([]);
  const [query, setQuery] = useState("");
  const [groupsSheetOpen, setGroupsSheetOpen] = useState(false);

  const handleCreateNewBlog = () => navigate("/blogs/create");

  const allBlogs = useMemo(
    () => blogPages?.pages.flatMap((page) => page.results) ?? [],
    [blogPages]
  );

  const blogs = useMemo(
    () => getFilteredBlogs(allBlogs, selectedGroups, query),
    [selectedGroups, allBlogs, query]
  );

  const toggleGroup = (group: ILessonGroup) => {
    setSelectedGroups((prev) => getNextSelectedGroups(prev, group));
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedGroups([]);
  };

  if (isLoading) return <Loader />;

  const groups = lessonGroups?.data || [];
  const hasFilter = selectedGroups.length > 0 || query.trim().length > 0;

  return (
    <div data-testid="blogs-page" dir="rtl" className="flex flex-col gap-6 font-heebo">
      <BlogPageHeader onCreate={handleCreateNewBlog} />

      <BlogFilterToolbar
        filteredCount={blogs.length}
        totalCount={allBlogs.length}
        hasFilter={hasFilter}
        query={query}
        onQueryChange={setQuery}
        onClearFilters={clearFilters}
      />

      <BlogGroupFilterChips
        groups={groups}
        selectedGroups={selectedGroups}
        onToggleGroup={toggleGroup}
        onOpenGroups={() => setGroupsSheetOpen(true)}
      />

      <BlogList
        blogs={blogs}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        isError={isError}
        error={error}
      />

      <LessonGroupsSheet open={groupsSheetOpen} onClose={() => setGroupsSheetOpen(false)} />
    </div>
  );
};

export default BlogPage;
