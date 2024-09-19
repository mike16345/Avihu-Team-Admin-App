import UserInfo from "@/components/UserDashboard/UserInfo/UserInfo";
import { WeightProgression } from "@/components/UserDashboard/WeightProgression/WeightProgression";
import { WorkoutProgression } from "@/components/UserDashboard/WorkoutProgression/WorkoutProgression";
import Loader from "@/components/ui/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MIN_STALE_TIME } from "@/constants/constants";
import { useUsersApi } from "@/hooks/api/useUsersApi";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import { useState } from "react";

export const UserDashboard = () => {
  const user = useLocation().state;
  const { getUser } = useUsersApi();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("candidates");

  const { data, isLoading, isError, error } = useQuery({
    enabled: !user,
    queryKey: [id || "oneUser"],
    staleTime: MIN_STALE_TIME,
    queryFn: () => getUser(id || ""),
  });

  if (isLoading) return <Loader size="large" />;
  if (isError && !data) return <ErrorPage message={error.message} />;

  const currentUser = data || user;

  return (
    <div className="size-full flex flex-col gap-4">
      <UserInfo user={currentUser} />
      <div>
        <Tabs dir="rtl" defaultValue="מעקב שקילה" className="w-full">
          <TabsList>
            <TabsTrigger onClick={() => setActiveTab("מעקב שקילה")} value="מעקב שקילה">
              מעקב שקילה
            </TabsTrigger>
            <TabsTrigger onClick={() => setActiveTab("מעקב אימון")} value="מעקב אימון">
              מעקב אימון
            </TabsTrigger>
          </TabsList>
          <TabsContent forceMount hidden={activeTab !== "מעקב שקילה"} value="מעקב שקילה">
            <WeightProgression />
          </TabsContent>
          <TabsContent forceMount hidden={activeTab !== "מעקב אימון"} value="מעקב אימון">
            <WorkoutProgression />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
