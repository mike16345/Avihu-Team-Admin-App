import { WeightChart } from "./WeightChart";
import { WeightCalendar } from "./WeightCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { useWeighInsApi } from "@/hooks/api/useWeighInsApi";
import { useParams } from "react-router";
import { CurrentWeighIn } from "./CurrentWeighIn";
import { WeightProgressionPhotos } from "./WeightProgressionPhotos";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { HOUR_STALE_TIME, MIN_STALE_TIME } from "@/constants/constants";
import { createRetryFunction } from "@/lib/utils";

export const WeightProgression = () => {
  const { id } = useParams();

  const { getWeighInsByUserId } = useWeighInsApi();

  if (!id) return;
  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["weighIns"],
    staleTime: HOUR_STALE_TIME,
    queryFn: () => getWeighInsByUserId(id),
    retry: createRetryFunction(404),
  });

  if (isLoading) return <Loader size="large" />;
  if (error?.status !== 404) return <ErrorPage message={error.message} />;
  const weighIns = data || [];

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="size-full flex items-center ">
          {!!weighIns?.length && (
            <Card className="size-full">
              <CardHeader>
                <CardTitle>מעקב שקילה</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col  gap-2">
                <div className="flex flex-col items-center lg:flex-row gap-2">
                  <WeightCalendar weighIns={weighIns} />
                  <WeightChart weighIns={weighIns} />
                </div>
                <CurrentWeighIn weighIn={weighIns[weighIns.length - 1]} />
              </CardContent>
            </Card>
          )}
          {weighIns?.length == 0 && (
            <div className="size-full">
              <h1 className="text-center">אין מעקב שקילה</h1>
            </div>
          )}
        </div>

        {/* <WeightProgressionPhotos /> */}
      </div>
    </>
  );
};
