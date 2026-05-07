import { TrainerInformationCard } from "@/components/trainers/TrainerInformationCard";
import { TrainerOverviewCard } from "@/components/trainers/TrainerOverviewCard";
import { TrainerQuickActionsCard } from "@/components/trainers/TrainerQuickActionsCard";
import { MainRoutes } from "@/enums/Routes";
import Loader from "@/components/ui/Loader";
import { useTrainerQuery } from "@/hooks/queries/trainers/useTrainerQuery";
import ErrorPage from "@/pages/ErrorPage";
import { Link, useParams } from "react-router-dom";
import { MdOutlineChevronLeft } from "react-icons/md";

const TrainerDetailsPage = () => {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useTrainerQuery(id);

  if (isLoading) {
    return <Loader size="large" />;
  }

  if (isError || !data) {
    return <ErrorPage message={error?.message ?? "שגיאה בטעינת פרטי המאמן"} />;
  }

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
        <TrainerQuickActionsCard />
      </div>
    </div>
  );
};

export default TrainerDetailsPage;
