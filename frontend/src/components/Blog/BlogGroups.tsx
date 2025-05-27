import { useState } from "react";
import PresetTable from "../tables/PresetTable";
import useLessonGroupsQuery from "@/hooks/queries/lessonGroups/useLessonGroupsQuery";
import useDeleteLessonGroup from "@/hooks/mutations/lessonGroups/useDeleteLessonGroup";
import PresetSheet from "../templates/PresetSheet";
import TemplateTabsSkeleton from "../ui/skeletons/TemplateTabsSkeleton";
import { Button } from "../ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/enums/QueryKeys";
import { toast } from "sonner";
import BackButton from "../ui/BackButton";

const BlogGroups = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useLessonGroupsQuery();

  const onSuccess = (blog: any) => {
    toast.success("פריט נמחק בהצלחה!");
    queryClient.invalidateQueries({ queryKey: [QueryKeys.LESSON_GROUPS] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.LESSON_GROUPS, blog?._id] });
  };

  const deleteLessonGroup = useDeleteLessonGroup({ onSuccess });

  const handleViewLessonGroup = (id?: string) => {
    setLessonGroupId(id);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setLessonGroupId(undefined);
  };

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [lessonGroupId, setLessonGroupId] = useState<string | undefined>(undefined);

  if (isLoading) return <TemplateTabsSkeleton />;

  return (
    <div>
      <BackButton navLink="/blogs" />

      <Button onClick={() => handleViewLessonGroup()} className="my-4">
        הוסף קבוצה
      </Button>
      <PresetTable
        data={data?.data || []}
        handleDelete={(id) => deleteLessonGroup.mutate(id)}
        handleViewData={handleViewLessonGroup}
      />
      <PresetSheet
        id={lessonGroupId}
        isOpen={isSheetOpen}
        onCloseSheet={handleCloseSheet}
        form="lessonGroups"
      />
    </div>
  );
};

export default BlogGroups;
