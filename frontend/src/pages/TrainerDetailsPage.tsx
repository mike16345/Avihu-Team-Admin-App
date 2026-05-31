import { useState } from "react";
import { toast } from "sonner";
import { MdOutlineChevronLeft } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import { EditTrainerDialog } from "@/components/trainers/EditTrainerDialog";
import { TrainerInformationCard } from "@/components/trainers/TrainerInformationCard";
import { TrainerOverviewCard } from "@/components/trainers/TrainerOverviewCard";
import { TrainerQuickActionsCard } from "@/components/trainers/TrainerQuickActionsCard";
import { TrainerSubTrainersDialog } from "@/components/trainers/TrainerSubTrainersDialog";
import { MainRoutes } from "@/enums/Routes";
import Loader from "@/components/ui/Loader";
import { useUpdateTrainer } from "@/hooks/mutations/trainers/useUpdateTrainer";
import { useTrainerQuery } from "@/hooks/queries/trainers/useTrainerQuery";
import ErrorPage from "@/pages/ErrorPage";

const TrainerDetailsPage = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubTrainersDialogOpen, setIsSubTrainersDialogOpen] = useState(false);
  const { id } = useParams();
  const { data, isLoading, isError, error } = useTrainerQuery(id);
  const updateTrainerMutation = useUpdateTrainer({
    onSuccess: () => {
      toast.success("המאמן נחסם בהצלחה");
    },
    onError: (mutationError: any) => {
      toast.error("חסימת המאמן נכשלה", {
        description: mutationError?.data?.message ?? mutationError?.message,
      });
    },
  });

  if (isLoading) {
    return <Loader size="large" />;
  }

  if (isError || !data) {
    return <ErrorPage message={error?.message ?? "שגיאה בטעינת פרטי המאמן"} />;
  }

  const handleBlockTrainer = () => {
    updateTrainerMutation.mutate({
      id: data.trainer._id,
      body: {
        fullName: data.trainer.fullName,
        email: data.trainer.email,
        phone: data.trainer.phone,
        subscriptionPlan: data.trainer.subscriptionPlan,
        clientLimit: data.trainer.clientLimit,
        subTrainerLimit: data.trainer.subTrainerLimit,
        status: "blocked",
        source: data.trainer.source,
        videoLibraryAccess: data.trainer.videoLibraryAccess,
        userId: data.trainer.userId,
        isDeleted: data.trainer.isDeleted,
      },
    });
  };

  return (
    <div dir="rtl" className="mx-auto 2xl:max-w-[1400px] space-y-6 pb-6">
      <nav aria-label="breadcrumb" className="flex justify-start">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to={MainRoutes.TRAINERS}
            className="transition-colors hover:text-foreground hover:underline"
          >
            מאמנים
          </Link>
          <MdOutlineChevronLeft />
          <span className="text-foreground">{data.trainer.fullName}</span>
        </div>
      </nav>

      <TrainerOverviewCard data={data} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <TrainerInformationCard data={data} />
        <TrainerQuickActionsCard
          onEdit={() => setIsEditDialogOpen(true)}
          onBlock={handleBlockTrainer}
          onViewSubTrainers={() => setIsSubTrainersDialogOpen(true)}
          isBlocking={updateTrainerMutation.isPending}
          isBlocked={data.trainer.status === "blocked"}
        />
      </div>

      <EditTrainerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        data={data}
      />

      <TrainerSubTrainersDialog
        open={isSubTrainersDialogOpen}
        onOpenChange={setIsSubTrainersDialogOpen}
        trainerId={data.trainer._id}
        trainerName={data.trainer.fullName}
      />
    </div>
  );
};

export default TrainerDetailsPage;
