import UserInfo from "@/components/UserDashboard/UserInfo/UserInfo";
import { WeightProgression } from "@/components/UserDashboard/WeightProgression/WeightProgression";
import { WorkoutProgression } from "@/components/UserDashboard/WorkoutProgression/WorkoutProgression";
import Loader from "@/components/ui/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MIN_STALE_TIME } from "@/constants/constants";
import { useUsersApi } from "@/hooks/api/useUsersApi";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import { useState } from "react";

export const weightTab = "מעקב שקילה";
export const workoutTab = "מעקב אימון";

export const UserDashboard = () => {
  const user = useLocation().state;
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const { getUser } = useUsersApi();

  const tabName = searchParams.get("tab")?.trim();
  const [activeTab, setActiveTab] = useState(tabName);
  const queryKey = id || "oneUser";

  const { data, isLoading, isError, error } = useQuery({
    enabled: !user,
    queryKey: [queryKey],
    staleTime: MIN_STALE_TIME,
    queryFn: () => getUser(id || ""),
  });

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
          <TabsTrigger onClick={() => handleSwitchTabs(weightTab)} value={weightTab}>
            {weightTab}
          </TabsTrigger>
          <TabsTrigger onClick={() => handleSwitchTabs(workoutTab)} value={workoutTab}>
            {workoutTab}
          </TabsTrigger>
        </TabsList>
        <TabsContent forceMount hidden={activeTab !== weightTab} value={weightTab}>
          <WeightProgression />
        </TabsContent>
        <TabsContent forceMount hidden={activeTab !== workoutTab} value={workoutTab}>
          <WorkoutProgression />
        </TabsContent>
      </Tabs>
    </div>
  );
};
