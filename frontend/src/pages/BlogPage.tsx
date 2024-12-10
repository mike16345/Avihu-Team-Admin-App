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
      <div className="flex  p-4">
        <Button onClick={handleCreateNewBlog} className="bg-blue-500 text-white">
          צור בלוג חדש
        </Button>
      </div>
      <BlogList />
    </div>
  );
};

export default BlogPage;
