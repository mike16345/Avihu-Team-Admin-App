import React from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import { HOUR_STALE_TIME } from "@/constants/constants";
import Loader from "../ui/Loader";
import ErrorPage from "@/pages/ErrorPage";

interface IAanlyticsList {
  firstName: string;
  lastName: string;
  navLink: string;
}

interface AnalyticsCardProps {
  title: string;
  dataKey: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, dataKey }) => {
  const navigate = useNavigate();
  const { getUsersWithoutPlans } = useAnalyticsApi();

  const data = useQuery({
    queryFn: () => getUsersWithoutPlans(dataKey),
    queryKey: [dataKey],
    staleTime: HOUR_STALE_TIME,
  });

  if (data.isError) return <ErrorPage message={data.error.message} />;

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col max-h-64 overflow-y-auto border-y-2">
        {data.isLoading && <Loader size="large" />}
        {data.data?.map((item, i) => (
          <div key={i} className="w-full flex items-center justify-between border-b-2">
            <div className="flex gap-5 items-center py-5 px-2">
              <p>{item.firstName}</p>
              <p>{item.lastName}</p>
            </div>
            <Button
              onClick={() =>
                navigate(
                  dataKey == `workoutPlan`
                    ? `/workout-plans/${item._id}`
                    : `/diet-plans/${item._id}`
                )
              }
            >
              צפה
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>

    /*  <div dir="rtl" className="w-full flex flex-col">
      <h2></h2>
      <div className="flex flex-col max-h-64 overflow-y-auto">
        
      </div>
    </div> */
  );
};

export default AnalyticsCard;
