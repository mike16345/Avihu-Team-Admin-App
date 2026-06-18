import { useState } from "react";
import { toast } from "sonner";
import { MdOutlineChevronLeft } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import { TrainerAccessDialog } from "@/components/trainers/TrainerAccessDialog";
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
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubTrainersDialogOpen, setIsSubTrainersDialogOpen] = useState(false);
  const { id } = useParams();
  const { data, isLoading, isError, error } = useTrainerQuery(id);
  const updateTrainerMutation = useUpdateTrainer();

  if (isLoading) {
    return <Loader size="large" />;
  }

  if (isError || !data) {
    return <ErrorPage message={error?.message ?? "שגיאה בטעינת פרטי המאמן"} />;
  }

  const isBlocked = data.trainer.status === "blocked";

  const handleConfirmAccessChange = () => {
    const nextStatus = isBlocked ? "active" : "blocked";

    updateTrainerMutation.mutate(
      {
        id: data.trainer._id,
        body: {
          fullName: data.trainer.fullName,
          email: data.trainer.email.toLowerCase(),
          phone: data.trainer.phone,
          subscriptionPlan: data.trainer.subscriptionPlan,
          clientLimit: data.trainer.clientLimit,
          subTrainerLimit: data.trainer.subTrainerLimit,
          status: nextStatus,
          source: data.trainer.source,
          videoLibraryAccess: data.trainer.videoLibraryAccess,
          userId: data.trainer.userId,
          isDeleted: data.trainer.isDeleted,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            nextStatus === "blocked" ? "המאמן נחסם בהצלחה" : "הגישה למאמן הוחזרה בהצלחה"
          );
          setIsAccessDialogOpen(false);
        },
        onError: (mutationError: any) => {
          toast.error(
            nextStatus === "blocked" ? "חסימת המאמן נכשלה" : "הענקת הגישה למאמן נכשלה",
            {
              description: mutationError?.data?.message ?? mutationError?.message,
            }
          );
        },
      }
    );
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
          onToggleAccess={() => setIsAccessDialogOpen(true)}
          onViewSubTrainers={() => setIsSubTrainersDialogOpen(true)}
          isAccessUpdating={updateTrainerMutation.isPending}
          isBlocked={isBlocked}
        />
      </div>

      <TrainerAccessDialog
        open={isAccessDialogOpen}
        onOpenChange={setIsAccessDialogOpen}
        trainerName={data.trainer.fullName}
        isBlocked={isBlocked}
        isPending={updateTrainerMutation.isPending}
        onConfirm={handleConfirmAccessChange}
      />

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
