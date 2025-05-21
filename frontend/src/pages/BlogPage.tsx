import BlogList from "@/components/Blog/BlogList";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const BlogPage = () => {
  const navigate = useNavigate();

  const handleCreateNewBlog = () => {
    navigate("/blogs/create");
  };

  const handleViewBlogGroups = () => {
    navigate("/presets/blogs/groups");
  };

  return (
    <div>
      <div className="flex items-center sm:justify-start justify-center p-4">
        <div className="w-full flex items-center justify-between">
          <Button onClick={handleCreateNewBlog} className="w-full sm:w-32">
            צור בלוג חדש
          </Button>

          <Button variant={"outline"} onClick={handleViewBlogGroups} className="w-full sm:w-32">
            קבוצות
          </Button>
        </div>
      </div>
      <BlogList />
    </div>
  );
};

export default BlogPage;
