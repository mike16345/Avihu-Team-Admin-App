import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import Loader from "../ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { QueryKeys } from "@/enums/QueryKeys";
import { HOUR_STALE_TIME } from "@/constants/constants";

interface AnalyticsCardProps {
  title: string;
  dataKey: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, dataKey }) => {
  const navigate = useNavigate();
  const { getUsersWithoutPlans, getUsersExpringThisMonth } = useAnalyticsApi();

  const actions: any = {
    [QueryKeys.NO_WORKOUT_PLAN]: {
      key: "workoutPlan",
      queryFunc: getUsersWithoutPlans,
      navUrl: `/workout-plans/`,
    },
    [QueryKeys.NO_DIET_PLAN]: {
      key: "dietPlan",
      queryFunc: getUsersWithoutPlans,
      navUrl: `/diet-plans/`,
    },
    [QueryKeys.EXPIRING_USERS]: {
      key: "expiringUsers",
      queryFunc: getUsersExpringThisMonth,
      navUrl: `/users/`,
    },
  };

  const { data, error, isError, isLoading } = useQuery({
    queryFn: () => actions[dataKey].queryFunc(actions[dataKey].key),
    queryKey: [dataKey],
    enabled: !!actions[dataKey],
    staleTime: HOUR_STALE_TIME,
  });

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-48 overflow-y-auto ">
        {isError && <ErrorPage message={error.message} />}
        {isLoading && <Loader size="large" />}
        {data?.data.length == 0 && (
          <div className="size-full flex items-center justify-center ">
            <h1 className="text-center text-success text-xl font-bold ">אין נתונים להצגה!</h1>
          </div>
        )}
        {data?.data.map((item: any, i: number) => (
          <div
            key={i}
            onDoubleClick={() => navigate(`${actions[dataKey]?.navUrl}${item._id}`)}
            className="w-full flex items-center justify-between hover:bg-accent cursor-pointer border-b-2"
          >
            <div className="flex gap-2 sm:gap-5 items-center py-5 px-2">
              <p>{item.firstName}</p>
              <p>{item.lastName}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
