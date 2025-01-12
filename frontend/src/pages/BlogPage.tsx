import BlogList from "@/components/Blog/BlogList";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const BlogPage = () => {
  const navigate = useNavigate();

  const handleCreateNewBlog = () => {
    navigate("/blogs/create");
  };

  return (
    <div>
      <div className="flex items-center sm:justify-start justify-center p-4">
        <Button onClick={handleCreateNewBlog} className="w-full sm:w-32">
          צור בלוג חדש
        </Button>
      </div>
      <BlogList />
    </div>
  );
};

export default BlogPage;
