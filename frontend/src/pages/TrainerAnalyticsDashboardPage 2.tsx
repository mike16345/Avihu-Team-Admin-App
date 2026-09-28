import { TrainerDashboardCloseToLimitCard } from "@/components/trainerAnalytics/TrainerDashboardCloseToLimitCard";
import { TrainerDashboardJoinedByMonthCard } from "@/components/trainerAnalytics/TrainerDashboardJoinedByMonthCard";
import { TrainerDashboardSourcesCard } from "@/components/trainerAnalytics/TrainerDashboardSourcesCard";
import { TrainerDashboardSummarySection } from "@/components/trainerAnalytics/TrainerDashboardSummarySection";

const TrainerAnalyticsDashboardPage = () => {
  return (
    <div dir="rtl" className="mx-auto max-w-[1400px] space-y-6 pb-6">
      <TrainerDashboardSummarySection />

      <div className="flex flex-col gap-6 xl:flex-row">
        <TrainerDashboardSourcesCard />
        <TrainerDashboardJoinedByMonthCard />
      </div>

      <TrainerDashboardCloseToLimitCard />
    </div>
  );
};

export default TrainerAnalyticsDashboardPage;
