import React from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import { HOUR_STALE_TIME } from "@/constants/constants";
import Loader from "../ui/Loader";
import ErrorPage from "@/pages/ErrorPage";

interface AnalyticsCardProps {
  title: string;
  dataKey: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, dataKey }) => {
  const navigate = useNavigate();
  const { getUsersWithoutPlans, getUsersExpringThisMonth } = useAnalyticsApi();

  const determineActionsByKey = (key: string) => {
    switch (key) {
      case `workoutPlan`:
        return {
          queryFunc: getUsersWithoutPlans,
          navUrl: `/workout-plans/`,
        };
      case `dietPlan`:
        return {
          queryFunc: getUsersWithoutPlans,
          navUrl: `/diet-plans/`,
        };
      case `expiringUsers`:
        return {
          queryFunc: getUsersExpringThisMonth,
          navUrl: `/users/`,
        };
    }
  };

  const actions = determineActionsByKey(dataKey);

  const apiData = useQuery({
    queryFn: () => actions?.queryFunc(dataKey),
    queryKey: [dataKey],
    staleTime: HOUR_STALE_TIME,
  });

  const { data, error, isError, isLoading } = apiData;

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
        {data?.data.map((item, i) => (
          <div key={i} className="w-full flex items-center justify-between border-b-2">
            <div className="flex gap-5 items-center py-5 px-2">
              <p>{item.firstName}</p>
              <p>{item.lastName}</p>
            </div>
            <Button onClick={() => navigate(`${actions?.navUrl}${item._id}`)}>צפה</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
