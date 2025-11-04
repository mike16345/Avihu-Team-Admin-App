import UserInfo from "@/components/UserDashboard/UserInfo/UserInfo";
import { WeightProgression } from "@/components/UserDashboard/WeightProgression/WeightProgression";
import { WorkoutProgression } from "@/components/UserDashboard/WorkoutProgression/WorkoutProgression";
import Loader from "@/components/ui/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import { useState } from "react";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import MeasurementsProgression from "@/components/UserDashboard/MeasurementProgression/MeasurementsProgression";

export const weightTab = "מעקב שקילה";
export const workoutTab = "מעקב אימון";
export const measurementTab = "מעקב היקפים";

export const UserDashboard = () => {
  const user = useLocation().state;
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabName = searchParams.get("tab")?.trim();
  const [activeTab, setActiveTab] = useState(tabName);

  const { data, isLoading, isError, error } = useUserQuery(id || "oneUser", !user);

  const handleSwitchTabs = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (isLoading) return <Loader size="large" />;
  if (isError && !data) return <ErrorPage message={error.message} />;

  const currentUser = data || user;

  return (
    <div className="size-full flex flex-col gap-4  ">
      <h1 className="text-3xl text-center sm:hidden ">עמוד משתמש</h1>
      <UserInfo user={currentUser} />
      <Tabs dir="rtl" defaultValue={activeTab} className="w-full">
        <TabsList>
          <TabsTrigger
            onClick={() => handleSwitchTabs(weightTab)}
            value={weightTab}
            data-testid="tab-weight"
          >
            {weightTab}
          </TabsTrigger>
          <TabsTrigger
            onClick={() => handleSwitchTabs(workoutTab)}
            value={workoutTab}
            data-testid="tab-workout"
          >
            {workoutTab}
          </TabsTrigger>
          <TabsTrigger
            onClick={() => handleSwitchTabs(measurementTab)}
            value={measurementTab}
            data-testid="tab-measurement"
          >
            {measurementTab}
          </TabsTrigger>
        </TabsList>
        <TabsContent forceMount hidden={activeTab !== weightTab} value={weightTab}>
          <WeightProgression />
        </TabsContent>
        <TabsContent forceMount hidden={activeTab !== workoutTab} value={workoutTab}>
          <WorkoutProgression />
        </TabsContent>
        <TabsContent forceMount hidden={activeTab !== measurementTab} value={measurementTab}>
          <MeasurementsProgression />
        </TabsContent>
      </Tabs>
    </div>
  );
};
