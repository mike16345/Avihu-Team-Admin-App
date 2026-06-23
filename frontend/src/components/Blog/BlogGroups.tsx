import { useMemo, useState } from "react";
import useLessonGroupsQuery from "@/hooks/queries/lessonGroups/useLessonGroupsQuery";
import useDeleteLessonGroup from "@/hooks/mutations/lessonGroups/useDeleteLessonGroup";
import PresetSheet from "../templates/PresetSheet";
import TemplateTabsSkeleton from "../ui/skeletons/TemplateTabsSkeleton";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/enums/QueryKeys";
import { toast } from "sonner";
import { ApiResponse } from "@/types/types";
import { ILessonGroup } from "@/interfaces/IBlog";
import useBlogsQuery from "@/hooks/queries/blogs/useBlogsQuery";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../Alerts/DeleteModal";
import BlogGroupsHeader from "./BlogGroupsHeader";
import BlogGroupsGrid from "./BlogGroupsGrid";

const getBlogCountByGroup = (blogPages: ReturnType<typeof useBlogsQuery>["data"]) => {
  const blogs = blogPages?.pages.flatMap((page) => page.results) ?? [];
  return blogs.reduce<Record<string, number>>((counts, blog) => {
    const name = blog.group?.name;
    if (!name) return counts;

    counts[name] = (counts[name] || 0) + 1;
    return counts;
  }, {});
};

const getDeleteAlertMessage = (
  pendingDelete: ILessonGroup | null,
  blogCountByGroup: Record<string, number>
) => {
  if (!pendingDelete) return undefined;

  const hasBlogsInGroup = (blogCountByGroup[pendingDelete.name] || 0) > 0;

  return (
    <>
      האם למחוק את הקבוצה <strong>"{pendingDelete.name}"</strong>?<br />
      {hasBlogsInGroup && "המאמרים בקבוצה זו לא יימחקו, אך יישארו ללא סיווג."}
    </>
  );
};

const BlogGroups = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useLessonGroupsQuery();
  const { data: blogPages } = useBlogsQuery();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [lessonGroupId, setLessonGroupId] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<ILessonGroup | null>(null);

  const onSuccess = (lessonGroup: ApiResponse<ILessonGroup>) => {
    toast.success("קבוצה נמחקה בהצלחה!");
    queryClient.invalidateQueries({ queryKey: [QueryKeys.LESSON_GROUPS] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.LESSON_GROUPS, lessonGroup.data._id] });
    setPendingDelete(null);
  };

  const deleteLessonGroup = useDeleteLessonGroup({ onSuccess });

  const handleEdit = (id?: string) => {
    setLessonGroupId(id);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setLessonGroupId(undefined);
  };

  const blogCountByGroup = useMemo(() => getBlogCountByGroup(blogPages), [blogPages]);

  if (isLoading) return <TemplateTabsSkeleton />;

  const groups = data?.data || [];

  return (
    <div dir="rtl" className="flex flex-col gap-5 font-heebo">
      <BlogGroupsHeader onBack={() => navigate("/blogs")} onCreate={() => handleEdit(undefined)} />

      <BlogGroupsGrid
        groups={groups}
        blogCountByGroup={blogCountByGroup}
        onEdit={handleEdit}
        onDelete={setPendingDelete}
      />

      <PresetSheet
        id={lessonGroupId}
        isOpen={isSheetOpen}
        onCloseSheet={handleCloseSheet}
        form="lessonGroups"
      />

      <DeleteModal
        isModalOpen={pendingDelete !== null}
        setIsModalOpen={(open) => !open && setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete?._id) deleteLessonGroup.mutate(pendingDelete._id);
        }}
        onCancel={() => setPendingDelete(null)}
        alertMessage={getDeleteAlertMessage(pendingDelete, blogCountByGroup)}
      />
    </div>
  );
};

export default BlogGroups;
