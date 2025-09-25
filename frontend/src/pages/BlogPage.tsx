import BlogList from "@/components/Blog/BlogList";
import { Button } from "@/components/ui/button";
import CustomButton from "@/components/ui/CustomButton";
import Loader from "@/components/ui/Loader";
import FilterItems from "@/components/ui/FilterItems";
import useBlogsQuery from "@/hooks/queries/blogs/useBlogsQuery";
import useLessonGroupsQuery from "@/hooks/queries/lessonGroups/useLessonGroupsQuery";
import { ILessonGroup } from "@/interfaces/IBlog";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const BlogPage = () => {
  const navigate = useNavigate();

  const {
    data: blogPages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useBlogsQuery();
  const { data: lessonGroups } = useLessonGroupsQuery();

  const [selectedGroups, setSelectedGroups] = useState<ILessonGroup[]>([]);

  const handleCreateNewBlog = () => navigate("/blogs/create");
  const handleViewBlogGroups = () => navigate("/presets/blogs/groups");

  const allBlogs = useMemo(() => {
    return blogPages?.pages.flatMap((page) => page.results) ?? [];
  }, [blogPages]);

  const blogs = useMemo(() => {
    if (selectedGroups.length === 0) return allBlogs;

    const selectedGroupIds = new Set(selectedGroups.map((group) => group.name));

    return allBlogs.filter((blog) => blog.group && selectedGroupIds.has(blog.group));
  }, [selectedGroups, allBlogs]);

  if (isLoading) return <Loader />;

  return (
    <>
      <div className="flex items-center sm:justify-start justify-center p-4">
        <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
          <Button onClick={handleCreateNewBlog} className="w-full sm:w-32">
            צור מאמר חדש
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleViewBlogGroups} className="w-full sm:w-32">
              קבוצות
            </Button>

            <FilterItems<ILessonGroup>
              items={lessonGroups?.data || []}
              nameKey="name"
              selectedItems={selectedGroups}
              onChange={setSelectedGroups}
              placeholder="סנן לפי קבוצות"
            />
          </div>
        </div>
      </div>
      <BlogList blogs={blogs} />

      {hasNextPage && (
        <div className="flex justify-center p-4">
          <CustomButton
            title={isFetchingNextPage ? "טוען..." : "טען עוד"}
            onClick={() => fetchNextPage()}
            isLoading={isFetchingNextPage}
            variant="default"
          />
        </div>
      )}
    </>
  );
};

export default BlogPage;
