import { ILessonGroup } from "@/interfaces/IBlog";
import BlogGroupCard from "./BlogGroupCard";
import BlogGroupsEmptyState from "./BlogGroupsEmptyState";

type BlogGroupsGridProps = {
  groups: ILessonGroup[];
  blogCountByGroup: Record<string, number>;
  onEdit: (id?: string) => void;
  onDelete: (group: ILessonGroup) => void;
};

const BlogGroupsGrid: React.FC<BlogGroupsGridProps> = ({
  groups,
  blogCountByGroup,
  onEdit,
  onDelete,
}) => {
  if (groups.length === 0) return <BlogGroupsEmptyState />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <BlogGroupCard
          key={group._id || group.name}
          group={group}
          count={blogCountByGroup[group.name] || 0}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default BlogGroupsGrid;
