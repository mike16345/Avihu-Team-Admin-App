import UserInfo from "@/components/UserDashboard/UserInfo/UserInfo";
import { WeightProgression } from "@/components/UserDashboard/WeightProgression/WeightProgression";
import { WorkoutProgression } from "@/components/UserDashboard/WorkoutProgression/WorkoutProgression";
import Loader from "@/components/ui/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import { useUrlTab } from "@/hooks/useUrlTab";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import MeasurementsProgression from "@/components/UserDashboard/MeasurementProgression/MeasurementsProgression";
import UserFormResponses from "@/components/UserDashboard/FormResponses/UserFormResponses";

export const weightTab = "מעקב שקילה";
export const workoutTab = "מעקב אימון";
export const measurementTab = "מעקב היקפים";
export const formsTab = "שאלונים";

export const UserDashboard = () => {
  const user = useLocation().state;
  const { id } = useParams();
  const tabs = [weightTab, workoutTab, measurementTab, formsTab];
  const { tab, setTab } = useUrlTab({ param: "tab", defaultTab: weightTab, tabs });

  const { data, isLoading, isError, error } = useUserQuery(id || "oneUser", !user);


  if (isLoading) return <Loader size="large" />;
  if (isError && !data) return <ErrorPage message={error.message} />;

  const currentUser = data || user;

  return (
    <div className="size-full flex flex-col gap-4  ">
      <h1 className="text-3xl text-center sm:hidden ">עמוד משתמש</h1>
      <UserInfo user={currentUser} />
      <Tabs dir="rtl" value={tab} onValueChange={setTab} className="w-full">
        <TabsList>
          <TabsTrigger value={weightTab}>
            {weightTab}
          </TabsTrigger>
          <TabsTrigger value={workoutTab}>
            {workoutTab}
          </TabsTrigger>
          <TabsTrigger value={measurementTab}>
            {measurementTab}
          </TabsTrigger>
          <TabsTrigger value={formsTab}>
            {formsTab}
          </TabsTrigger>
        </TabsList>
        <TabsContent forceMount hidden={tab !== weightTab} value={weightTab}>
          <WeightProgression />
        </TabsContent>
        <TabsContent forceMount hidden={tab !== workoutTab} value={workoutTab}>
          <WorkoutProgression />
        </TabsContent>
        <TabsContent forceMount hidden={tab !== measurementTab} value={measurementTab}>
          <MeasurementsProgression />
        </TabsContent>
        <TabsContent forceMount hidden={tab !== formsTab} value={formsTab}>
          <UserFormResponses />
        </TabsContent>
      </Tabs>
    </div>
  );
};
